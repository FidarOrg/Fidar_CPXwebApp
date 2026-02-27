import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "../language-swicther/LanguageSwitcher";
import ModeToggle from "../theme-provider/mode-toggle";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/providers/LanguageProvider";

function Policy() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <Card className="max-w-3xl w-full shadow-md border border-gray-300 dark:border-gray-700 relative">

       

        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {t("policy.title")}
          </CardTitle>
        </CardHeader>
 {/* Top-right tools */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 z-10">
          <ModeToggle />
          <LanguageSwitcher />
        </div>
        <CardContent className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">

          {/* Intro Paragraph */}
          <p>{t("policy.para1")}</p>

          {/* Section 1 */}
          <h3 className="font-semibold text-foreground">{t("policy.section1")}</h3>
          <p>{t("policy.section1_body")}</p>

          {/* Section 2 */}
          <h3 className="font-semibold text-foreground">{t("policy.section2")}</h3>
          <p>{t("policy.section2_body")}</p>

          {/* Section 3 */}
          <h3 className="font-semibold text-foreground">{t("policy.section3")}</h3>
          <p>{t("policy.section3_body")}</p>

          {/* Section 4 */}
          <h3 className="font-semibold text-foreground">{t("policy.section4")}</h3>
          <p>{t("policy.section4_body")}</p>

          {/* Last Updated */}
          <p className="pt-3 text-center text-xs text-muted-foreground">
            {t("policy.lastUpdated")}
          </p>

          {/* Back Button */}
          <div className="pt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="px-6"
            >
              {t("policy.back")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Policy;
