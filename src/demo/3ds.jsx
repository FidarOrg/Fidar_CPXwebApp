import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import Header from "@/components/header/Header";

// ---------------------------------------------------------
// Secure Checkout Dialog Component (NO <p> inside <p>)
// ---------------------------------------------------------
function SecureCheckoutDialog({ open, onClose, onResend, resendDisabled, cooldown }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Secure Checkout</DialogTitle>

          {/* Prevent nested <p> issue */}
          <DialogDescription asChild>
            <div className="text-sm text-muted-foreground space-y-3">
              <div className="text-lg font-bold mt-2">Smart Bank</div>
              <div className="font-semibold mt-4">Payment Security</div>
              <div>
                Authenticate using your Smart Bank app. Tap the push notification sent to your phone.
              </div>
              <div>If you didn’t receive it, you can resend after the timer ends.</div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <Button
          className="mt-6 w-full"
          onClick={onResend}
          disabled={resendDisabled}
        >
          {resendDisabled ? `Resend in ${cooldown}s` : "Resend push notification"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------
// Main Component
// ---------------------------------------------------------
export default function OrderSummaryPage() {
  const { t } = useTranslation();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successPopupOpen, setSuccessPopupOpen] = useState(false);
  const [failedPopupOpen, setFailedPopupOpen] = useState(false);

  const [sessionId, setSessionId] = useState(null);

  const [resendDisabled, setResendDisabled] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  // timers
  const pollingInterval = useRef(null);
  const cooldownTimer = useRef(null);

  // ---------------------------------------------------------
  // PAY NOW → Show Secure Checkout + Send First Push
  // ---------------------------------------------------------
  const handlePayNow = async () => {
    setCheckoutOpen(true);
    await sendPushNotification(); // create session + poll
  };

  // ---------------------------------------------------------
  // COOLDOWN (Disable resend 30 sec)
  // ---------------------------------------------------------
  const startCooldown = () => {
    setResendDisabled(true);
    setCooldown(30);

    cooldownTimer.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimer.current);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ---------------------------------------------------------
  // SEND PUSH NOTIFICATION (POST)
  // ---------------------------------------------------------
 const sendPushNotification = async () => {
  try {
    startCooldown(); // disable resend for 30 sec

    const response = await fetch(
      "https://axpd8hgbc2.ap-south-1.awsapprunner.com/fidar/sdk/api/fcm/notify/data",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "d299f275-c364-46fe-860c-7643185cfb2f",
          title: "This transaction is from Apple.com UAE",
          description: "Total amount USD 9356",
          body: "Tap to approve",
          channel: "HIGH_ALERT",
          data: {
            message: "Approve your purchase",
            type: "3ds",
            card: "34** **** **** 8765"
          }
        }),
      }
    );

    const result = await response.json();
    console.log("Push Response:", result);

    const sid = result.sessionId;
    if (!sid) {
      console.error("❌ API did not return sessionId");
      return;
    }

    setSessionId(sid);

    // stop previous polling if any
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }

    // start polling for new session
    startPolling(sid);

  } catch (err) {
    console.error("Push error:", err);
  }
};


  // ---------------------------------------------------------
  // POLLING EVERY 10 SECONDS
  // ---------------------------------------------------------
  const startPolling = (sid) => {
    console.log("Polling started for:", sid);

    pollingInterval.current = setInterval(async () => {
      try {
        const res = await fetch(
          `https://axpd8hgbc2.ap-south-1.awsapprunner.com/fidar/sdk/api/pooling/sessions/${sid}`
        );

        const data = await res.json();
        console.log("Polling:", data);

        // SUCCESS CASE
        if (data.status === "VERIFIED") {
          clearInterval(pollingInterval.current);
          setCheckoutOpen(false);
          setSuccessPopupOpen(true);
        }

        // FAILURE CASE
        else if (data.status === "DECLINED" || data.status === "FAILED") {
          clearInterval(pollingInterval.current);
          setCheckoutOpen(false);
          setFailedPopupOpen(true);
        }

      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 10000); // ← 10 seconds polling
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur">
        <Header type={"bank"} />
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-5xl w-full shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">
              {t("demo.orderSummaryPage.title")}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col md:flex-row gap-8 p-6">
            {/* PRODUCT */}
            <div className="flex flex-col items-center w-full md:w-1/2 border rounded-xl p-4 bg-card">
              <img
                src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp14-silver-select-202410?wid=940&hei=1112&fmt=png-alpha"
                className="w-72 h-auto rounded-lg shadow border"
              />
              <h2 className="mt-6 text-xl font-medium">MacBook Pro 14”</h2>
            </div>

            {/* PAYMENT SECTION */}
            <div className="flex flex-col justify-center w-full md:w-1/2 border rounded-xl p-6 bg-card shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Price Details</h3>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Items</span>
                <span>USD 3686</span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>USD 3686</span>
              </div>

              <Button className="mt-6 w-full" onClick={handlePayNow}>
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* SECURE CHECKOUT */}
      <SecureCheckoutDialog
        open={checkoutOpen}
        onClose={setCheckoutOpen}
        onResend={sendPushNotification}
        resendDisabled={resendDisabled}
        cooldown={cooldown}
      />

      {/* SUCCESS POPUP */}
      <Dialog open={successPopupOpen} onOpenChange={setSuccessPopupOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
            <DialogTitle className="text-xl font-semibold">
              Purchase Successful
            </DialogTitle>
            <DialogDescription>
              Your payment has been verified successfully.
            </DialogDescription>
          </DialogHeader>

          <Button className="mt-4 w-full" onClick={() => setSuccessPopupOpen(false)}>
            Done
          </Button>
        </DialogContent>
      </Dialog>

      {/* FAILURE POPUP */}
      <Dialog open={failedPopupOpen} onOpenChange={setFailedPopupOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-red-600">
              Verification Failed
            </DialogTitle>
            <DialogDescription>
              Your authentication was declined. Please try again.
            </DialogDescription>
          </DialogHeader>

          <Button className="mt-4 w-full" onClick={() => setFailedPopupOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
