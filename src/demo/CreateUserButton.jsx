import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function CreateUserPage() {
  const API_BASE = "http://localhost:3001";
  const token = localStorage.getItem("authToken");
  const { t } = useTranslation();

  const isRTL = document.documentElement.dir === "rtl";

  const [form, setForm] = useState({
    customerId: "",
    name: "",
    username: "",
    phone: "",
    card: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.customerId || !form.name || !form.username || !form.phone || !form.card) {
      setMessage(`⚠️ ${t("demo.createUserPage.errorMissingFields")}`);
      return;
    }

    if (!token) {
      setMessage(`❌ ${t("demo.createUserPage.errorNoToken")}`);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/iam/accounts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || `Server returned ${response.status}`);
      }

      setMessage(
        `✅ ${t("demo.createUserPage.successMessage")} (ID: ${
          data?.id || "N/A"
        } | Username: ${data?.username || form.username})`
      );

      setForm({
        customerId: "",
        name: "",
        username: "",
        phone: "",
        card: "",
      });
    } catch (err) {
      console.error("Error creating user:", err);
      setMessage(`❌ ${t("demo.createUserPage.errorMessage")}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            {t("demo.createUserPage.title")}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* Customer ID */}
          <div className="space-y-2">
            <Label htmlFor="customerId">{t("demo.createUserPage.customerId")}</Label>
            <Input
              id="customerId"
              name="customerId"
              placeholder={t("demo.createUserPage.customerIdPlaceholder")}
              value={form.customerId}
              onChange={handleChange}
              className="border-border"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("demo.createUserPage.fullName")}</Label>
            <Input
              id="name"
              name="name"
              placeholder={t("demo.createUserPage.fullNamePlaceholder")}
              value={form.name}
              onChange={handleChange}
              className="border-border"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">{t("demo.createUserPage.username")}</Label>
            <Input
              id="username"
              name="username"
              placeholder={t("demo.createUserPage.usernamePlaceholder")}
              value={form.username}
              onChange={handleChange}
              className="border-border"
            />
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label>{t("demo.createUserPage.phoneNumber")}</Label>

            <PhoneInput
              country={"us"}
              enableSearch
              placeholder={t("demo.createUserPage.phonePlaceholder")}
              value={form.phone.replace(/^\+/, "")}
              onChange={(phone) => setForm({ ...form, phone: `+${phone}` })}
              // Container gets an RTL marker class
              containerClass={`w-full phone-input ${isRTL ? "rtl" : "ltr"}`}
              // Keep the text field LTR for phone numbers, and pad for the flag
              inputClass={`
                !w-full !h-10 !text-base !rounded-md !bg-background !text-foreground
                !border !border-border focus:!outline-none focus:!ring-2 focus:!ring-[hsl(var(--ring))]
                phone-input__field ${isRTL ? "!pr-12 !pl-3 text-right" : "!pl-12 !pr-3"}
              `}
              // Keep the button absolutely positioned inside the input
              buttonClass={`phone-input__button ${isRTL ? "rtl" : "ltr"}`}
              dropdownClass="!bg-popover !text-popover-foreground !border !border-border !shadow-md"
              searchClass="!bg-background !text-foreground !border !border-border"
              // Hard-force LTR direction on the actual input element as a fallback
              inputStyle={{ direction: "ltr" }}
              inputExtraProps={{ dir: "ltr" }}
            />

          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="card">{t("demo.createUserPage.cardNumber")}</Label>
            <Input
              id="card"
              name="card"
              placeholder={t("demo.createUserPage.cardNumberPlaceholder")}
              value={form.card}
              onChange={handleChange}
              className="border-border"
            />
          </div>

          <Separator className="my-2" />

          {/* Submit Button */}
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? t("demo.createUserPage.submitting") : t("demo.createUserPage.submit")}
          </Button>

          {/* Messages */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg border text-sm shadow-sm ${
                message.startsWith("✅")
                  ? "bg-green-500/10 border-green-500/30"
                  : message.startsWith("⚠️")
                  ? "bg-yellow-500/10 border-yellow-500/30"
                  : "bg-destructive/10 border-destructive/30"
              }`}
            >
              {message}
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
