import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CallVerificationPage() {
  const API_BASE = "http://localhost:3001";
  const token = localStorage.getItem("authToken");

  const { t } = useTranslation();
  const [empId, setEmpId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE}/iam/verification/call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employeeId: empId }),
      });

      const data = await res.json().catch(() => ({}));
      setMessage(`📞 ${t("demo.callVerificationPage.successPrefix")} ${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      setMessage(`❌ ${t("demo.callVerificationPage.error")}`);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {t("demo.callVerificationPage.title")}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="empId">
              {t("demo.callVerificationPage.employeeId")}
            </Label>

            <Input
              id="empId"
              placeholder={t("demo.callVerificationPage.employeeIdPlaceholder")}
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              className="border-border"
            />
          </div>

          <Button className="w-full" onClick={handleSubmit}>
            {t("demo.callVerificationPage.verify")}
          </Button>

          {message && (
            <pre className="mt-4 p-3 rounded-lg border border-border bg-muted text-sm text-foreground shadow-sm whitespace-pre-wrap">
              {message}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
