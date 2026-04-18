import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Globe } from "lucide-react";
import logo from "../assets/cpxlogo.png";
import fidarLogoLight from "../assets/fidar_dark.png";
import fidarLogoDark from "../assets/fidar_light.png";
import { useTheme } from "@/components/theme-provider/theme-provider";
import ModeToggle from "@/components/theme-provider/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/providers/LanguageProvider";
import { FIDAR_API_BASE } from "@/config";

// 🔹 Inline component for language switcher
function LanguageSwitcher() {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 hover:bg-accent rounded-md focus:outline-none"
          aria-label="Change language"
        >
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

function EmpLogin() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { lang } = useLanguage();

  return (
    <div className="relative flex items-center justify-center min-h-dvh bg-gradient-to-br from-background to-muted px-3 sm:px-4 mt-4 mb-4 sm:mt-0 sm:mb-0">

      {/* 🔥 Dynamic Button Position - LEFT for Arabic, RIGHT for others */}
      <div
        className={`absolute top-3 sm:top-4 flex items-center gap-2 transition-all duration-300
        ${lang === "ar" ? "left-3 sm:left-4" : "right-3 sm:right-4"}`}
      >
        <ModeToggle />
        <LanguageSwitcher />
      </div>

      <div className="relative w-full max-w-6xl flex items-center justify-center min-h-screen md:min-h-dvh">
        <Card className="w-full max-w-md shadow-lg border-2 border-slate-300 dark:border-slate-700">
          <CardHeader className="flex flex-col items-center space-y-3 pt-6 sm:pt-8">
            <img
              src={logo}
              alt="Smart Bank Logo"
              className="h-16 w-auto rounded-md"
            />
            <CardTitle>{t("bankLoginPage.title")}</CardTitle>
            <CardDescription className="text-center">
              Please Sign in to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 px-4 sm:px-6 pt-3 pb-5">
            {/* ── SSO Login (PingOne / Keycloak via SAML) ── */}
            <a
              href={`${FIDAR_API_BASE}/fidar/sdk/api/saml2/authenticate/pingone`}
              className="flex items-center justify-center w-full h-11 sm:h-10 gap-2 rounded-lg border border-border
                         bg-card hover:bg-accent text-sm font-semibold text-foreground
                         shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-95"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M12 8v4l3 3" />
              </svg>
              Sign in with SSO
            </a>
          </CardContent>

          <Separator />

          <CardFooter className="flex flex-col space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t("bankLoginPage.termsText")}{" "}
              <Link
                to="/privacy"
                className="text-blue-600 dark:text-blue-400 underline cursor-pointer hover:text-blue-700 transition-colors duration-200"
              >
                {t("bankLoginPage.privacyPolicy")}
              </Link>{" "}
              {t("bankLoginPage.and")}{" "}
              <Link
                to="/terms"
                className="text-blue-600 dark:text-blue-400 underline cursor-pointer hover:text-blue-700 transition-colors duration-200"
              >
                {t("bankLoginPage.terms")}
              </Link>
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {t("bankLoginPage.poweredBy")}
              </p>
              <img
                src={
                  (theme === "dark" ||
                    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches))
                    ? fidarLogoDark
                    : fidarLogoLight
                }
                className="h-16"
                alt="Fidar Logo"
              />
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default EmpLogin;