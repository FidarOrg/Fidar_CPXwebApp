import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Globe } from "lucide-react";
import logo from "../assets/banklogo.png";
import fidarLogo from "../assets/fidarlogo.jpg";
import { toast } from "@/hooks/use-toast";
import ModeToggle from "@/components/theme-provider/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/providers/LanguageProvider";
import { handleFidarError } from "@/lib/handleFidarError";
import { fidar } from "@/lib/fidar";

// 🔹 Language Switcher (same as before)
function LanguageSwitcher() {
  const { lang, toggleLanguage } = useLanguage();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 hover:bg-accent rounded-md focus:outline-none">
          <Globe className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuItem
          onClick={() => toggleLanguage("en")}
          className={lang === "en" ? "font-bold" : ""}
        >
          English
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => toggleLanguage("ar")}
          className={lang === "ar" ? "font-bold" : ""}
        >
          العربية
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => toggleLanguage("hi")}
          className={lang === "hi" ? "font-bold" : ""}
        >
          हिंदी
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AtmLogin() {
  const [atmId, setAtmId] = useState("");
  const [atmLoading, setAtmLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { lang } = useLanguage(); // 🔥 Needed for button alignment

  const handleAtmBindWithQR = async () => {
    if (!atmId.trim()) return;
    setAtmLoading(true);

    try {
      // 1️⃣ Validate customer/account exists
      const account = await fidar.getAccountByCustomerId(atmId);

      if (!account) {
        toast({
          variant: "destructive",
          title: t("atmLoginPage.toast.loginError.title"),
          description: t("atmLoginPage.toast.inactive"),
        });
        return;
      }

      // 2️⃣ Success Toast
      toast({
        title: t("atmQRPage.title"),
        description: t("atmQRPage.login.subtitle_1"),
      });

      // 3️⃣ Move to ATM QR page
      navigate("/atm-qr", {
        state: { customerId: atmId },
      });

    } catch (error) {
      console.error("[FIDAR ATM] Bind/Login failed:", error);
      handleFidarError(error, t);
    } finally {
      setAtmLoading(false);
    }
  };

  const handleAtmKeyPress = (e) => {
    if (e.key === "Enter") handleAtmBindWithQR();
  };

  return (
    <div
      className={`
        relative flex items-center justify-center min-h-dvh
        bg-gradient-to-br from-background to-muted
        px-3 sm:px-4 mt-4 mb-4 sm:mt-0 sm:mb-0
      `}
    >
      {/* 🔥 Dynamic Top Toolbar Position (Arabic → Left, Others → Right) */}
      <div
        className={`absolute top-3 sm:top-4 flex items-center gap-2 transition-all duration-300
        ${lang === "ar" ? "left-3 sm:left-4" : "right-3 sm:right-4"}`}
      >
        <ModeToggle />
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-6xl flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg border-2 border-slate-300 dark:border-slate-700">

          <CardHeader className="flex flex-col items-center space-y-3 pt-6 sm:pt-8">
            <img
              src={logo}
              alt="Smart Bank Logo"
              className="h-14 sm:h-16 md:h-20 w-auto rounded-md drop-shadow-md"
              draggable={false}
            />
            <CardTitle className="text-2xl font-bold tracking-tight">
              {t("atmLoginPage.title")}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {t("atmLoginPage.subtitle")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 px-4 sm:px-6 pt-3 pb-5">
            <div className="space-y-2">
              <Label htmlFor="atm-id" className="font-medium">
                {t("atmLoginPage.customerIdLabel")}
              </Label>

              <TooltipProvider delayDuration={250}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="atm-id"
                      placeholder={t("atmLoginPage.customerIdPlaceholder")}
                      value={atmId}
                      onChange={(e) => setAtmId(e.target.value)}
                      onKeyDown={handleAtmKeyPress}
                      className="h-11"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("atmLoginPage.customerIdTooltip")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button
              className="w-full h-11 bg-gradient-to-r from-pink-900 via-purple-900 to-blue-900 hover:from-pink-800 hover:via-purple-800 hover:to-blue-800 text-white font-semibold shadow-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(88,28,135,0.6)] hover:scale-[1.02] active:scale-95 rounded-lg"
              disabled={!atmId.trim() || atmLoading}
              onClick={handleAtmBindWithQR}
            >
              {atmLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("atmLoginPage.binding")}
                </>
              ) : (
                t("atmLoginPage.bind")
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-2">
              {t("atmLoginPage.banklogin")}{" "}
              <span
                onClick={() => navigate("/bank-login")}
                className="text-blue-600 dark:text-blue-400 underline cursor-pointer hover:text-blue-700 transition-colors duration-200"
              >
                {t("atmLoginPage.click_here")}
              </span>
            </p>
          </CardContent>

          <Separator />

          <CardFooter className="flex flex-col space-y-4 text-center px-4 sm:px-6 py-5">
            <p className="text-sm text-muted-foreground">
              {t("bankLoginPage.termsText")}{" "}
              <span
                onClick={() => navigate("/privacy")}
                className="text-blue-600 dark:text-blue-400 underline cursor-pointer hover:text-blue-700 transition-colors duration-200"
              >
                {t("bankLoginPage.privacyPolicy")}
              </span>{" "}
              {t("bankLoginPage.and")}{" "}
              <span
                onClick={() => navigate("/terms")}
                className="text-blue-600 dark:text-blue-400 underline cursor-pointer hover:text-blue-700 transition-colors duration-200"
              >
                {t("bankLoginPage.terms")}
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <p className="text-sm text-muted-foreground">
                {t("atmLoginPage.poweredBy")}
              </p>
              <img src={fidarLogo} alt="Powered by Fidar" className="h-10" />
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
