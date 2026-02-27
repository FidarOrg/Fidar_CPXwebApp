import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function BeneficiaryForm({ onAdd, submitting = false }) {
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    iban: "",
    accountNumber: "",
  });

  const [loading, setLoading] = useState(false); // local form loading
  const { t } = useTranslation();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.nickname || !form.iban || !form.accountNumber) return;

    setLoading(true);
    try {
      // Delegate to parent. If parent returns a Promise, await it so form shows loading.
      // Parent should run verification and then call fidar.addBeneficiary.
      const maybePromise = onAdd && onAdd(form);
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
      }

      // clear form on success
      setForm({ name: "", nickname: "", iban: "", accountNumber: "" });
    } catch (err) {
      // Parent should handle errors (toast/handler); optionally show local fallback
      console.error("[BeneficiaryForm] onAdd failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input name="name" placeholder={t("actions.fullname")} value={form.name} onChange={handleChange} />
      <Input name="nickname" placeholder={t("actions.nickname")} value={form.nickname} onChange={handleChange} />
      <Input name="iban" placeholder={t("actions.iban")} value={form.iban} onChange={handleChange} />
      <Input name="accountNumber" placeholder={t("actions.accountno")} value={form.accountNumber} onChange={handleChange} />

      <Button onClick={handleSubmit} disabled={loading || submitting} className="w-full">
        {loading || submitting ? t("actions.adding") : t("actions.addBeneficiary")}
      </Button>
    </div>
  );
}
