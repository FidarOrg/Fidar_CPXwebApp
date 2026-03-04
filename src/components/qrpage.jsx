import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/banklogo.png";
import ModeToggle from "@/components/theme-provider/mode-toggle";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "./language-swicther/LanguageSwitcher";
import { useTranslation } from "react-i18next";

import { fidar } from "@/lib/fidar";
import { handleFidarError } from "@/lib/handleFidarError";
import BluetoothGate from "./BluetoothGate";
import toast from "react-hot-toast";
import { ErrorCode, isFidarException } from "fidar-web-sdk";

function QrPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const customerId = location.state?.customerId;

  const [status, setStatus] = useState("STARTING");
  const [error, setError] = useState("");
  const [qrImage, setQrImage] = useState(undefined);

  const [expiresIn] = useState(180);
  const [timeLeft, setTimeLeft] = useState(180);

  const [bluetoothReady, setBluetoothReady] = useState(false);

  // ⏳ Countdown timer
  useEffect(() => {
    if (status === "ERROR" || status === "VERIFIED") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);


  // 🔐 Start QR flow ONLY after Bluetooth is ready
  useEffect(() => {
    if (!customerId || !bluetoothReady) return;

    let cancelled = false;

    async function startQRFlow() {
      setStatus("STARTING");
      setError("");

      try {
        await fidar.loginWithQR(
          (flowStatus) => {
            if (cancelled) return;
            setStatus(flowStatus);

            if (flowStatus === "EXPIRED") {
              setError(t("bankQRPage.Session.expired_description"));
            }
          },
          (imageBase64) => {
            if (cancelled) return;
            setQrImage(imageBase64);
          }
        );

        if (!cancelled) {
          navigate("/dashboard");
        }
      } catch (err) {
        if (cancelled) return;

        if (
          handleSecurityError(err, {
            redirect: navigate,
          })
        ) {
          return;
        }
        handleFidarError(err, t);
        setStatus("ERROR");
        setError(
          err?.payload?.message || t("bankQRPage.Connectionissue")
        );
      }
    }

    startQRFlow();

    return () => {
      cancelled = true;
    };
  }, [customerId, bluetoothReady, navigate, t]);

  const isExpired = timeLeft === 0 || status === "EXPIRED";
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (status === "ERROR") {
    return (
      <main className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">
              {t("bankQRPage.Session.cancelled")}
            </CardTitle>
            <CardDescription>
              {t("bankQRPage.Session.cancelled_description")}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <Alert variant="destructive">
              <AlertTitle>
                {t("bankQRPage.Security.warning")}
              </AlertTitle>
              <AlertDescription>
                {error ||
                  t("bankQRPage.Session.window_switch_detected")}
              </AlertDescription>
            </Alert>

            <Button
              className="w-full"
              onClick={() => navigate("/Emp-login")}
            >
              {t("bankQRPage.login.backbutton")}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }


  if (!customerId) {
    return (
      <main className="relative flex justify-center items-center min-h-screen bg-muted/30 p-4">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
          <ModeToggle />
          <LanguageSwitcher />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <CardTitle>{t("bankQRPage.Session.error")}</CardTitle>
            <CardDescription>
              {t("bankQRPage.Session.error_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-36 w-full rounded-lg" />
            <div className="mt-3 flex justify-end">
              <Button onClick={() => navigate("/")}>
                {t("bankQRPage.login.backbutton")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const statusLabel = (() => {
    if (isExpired) return "EXPIRED";
    if (status === "VERIFIED") return "VERIFIED";
    if (status === "LOOKUP_SUCCESS") return "LOOKUP";
    if (status === "QR_READY" || status === "QR_GENERATED") return "READY";
    if (status === "DEVICE_AUTH_STARTED") return "WAITING";
    if (status === "PENDING" || status === "STARTING") return "PENDING";
    if (status === "ERROR") return "ERROR";
    return status || "PENDING";
  })();

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-muted/30 p-3">
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
        <ModeToggle />
        <LanguageSwitcher />
      </div>

      <div className="relative w-full max-w-sm">
        <div
          className="pointer-events-none absolute -inset-[1.5px] rounded-2xl bg-gradient-to-br from-blue-400/40 via-cyan-400/35 to-emerald-400/40 blur-sm z-0"
          aria-hidden="true"
        />
        <Card className="relative shadow-md border rounded-2xl z-10">
          {!bluetoothReady ? (
          <BluetoothGate onReady={() => setBluetoothReady(true)} />
        ) : (
          <>
          <CardHeader className="pt-4 px-5 pb-2">
            <div className="w-full flex justify-center mb-2">
              <img
                src={logo}
                alt="Smart Bank"
                className="w-16 sm:w-20 rounded-md shadow select-none"
                draggable={false}
              />
            </div>
            <div className="text-center">
              <CardTitle className="text-base sm:text-lg font-semibold">
                {t("bankQRPage.title")}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t("bankQRPage.subtitle")}
              </CardDescription>
            </div>
          </CardHeader>

          <Separator className="mx-5" />

          <CardContent className="flex flex-col items-center gap-3 py-4">
            <div className="w-[180px] sm:w-[200px]">
              <AspectRatio ratio={1}>
                <div className="p-1.5 rounded-lg bg-white shadow-sm h-full w-full flex items-center justify-center">
                  {qrImage ? (
                    <img
                      src={qrImage}
                      alt="Login QR"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Skeleton className="h-full w-full rounded-md" />
                  )}
                </div>
              </AspectRatio>
            </div>

            <Badge
              variant={isExpired ? "destructive" : "secondary"}
              className="uppercase tracking-wide font-semibold px-2 py-0.5 text-xs"
            >
              {t("bankQRPage.status")} {statusLabel}
            </Badge>

            <div className="w-full max-w-xs text-center">
              <p className="text-xs mb-1">
                {t("bankQRPage.expire_timer")} {minutes}:{seconds.toString().padStart(2, "0")}
              </p>
              <Progress
                value={(timeLeft / expiresIn) * 100}
                className="h-2 rounded-full"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="w-full p-2 text-xs">
                <AlertTitle className="text-sm">
                  {t("bankQRPage.Connectionissue")}
                </AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isExpired && (
              <Alert className="w-full p-2 text-xs">
                <AlertTitle className="text-sm">
                  {t("bankQRPage.Session.expired")}
                </AlertTitle>
                <AlertDescription>
                  {t("bankQRPage.Session.expired_description")}
                </AlertDescription>
              </Alert>
            )}

            <div className="w-full rounded-md border p-3 bg-background/60">
              <p className="font-medium mb-2 text-xs">
                {t("bankQRPage.login.guide_title")}
              </p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                <li className="flex gap-1 items-start">
                  <ShieldCheck className="h-3 w-3 mt-0.5 text-emerald-600 shrink-0" />
                  <span>{t("bankQRPage.login.subtitle_1")}</span>
                </li>
                <li>{t("bankQRPage.login.Condition")}</li>
              </ul>
            </div>

            <div className="flex w-full justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
              >
                {t("bankQRPage.login.backbutton")}
              </Button>
            </div>
          </CardContent>
          </>
          )}
        </Card>
      </div>
    </main>
  );
}

export default QrPage;
