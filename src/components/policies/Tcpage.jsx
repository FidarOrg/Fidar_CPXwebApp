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

function Terms() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <Card className="max-w-3xl w-full shadow-md border border-gray-300 dark:border-gray-700 relative">

        {/* Header */}
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {t("terms.title")}
          </CardTitle>
        </CardHeader>

        {/* Top-right Language + Theme */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 z-10">
          <ModeToggle />
          <LanguageSwitcher />
        </div>

        {/* Content */}
        <CardContent className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">

          {/* Paragraph 1 */}
          <p>{t("terms.para1")}</p>

          {/* Section 1 */}
          <h3 className="font-semibold text-foreground">{t("terms.section1")}</h3>
          <p>{t("terms.section1_body")}</p>

          {/* Section 2 */}
          <h3 className="font-semibold text-foreground">{t("terms.section2")}</h3>
          <p>{t("terms.section2_body")}</p>

          {/* Section 3 */}
          <h3 className="font-semibold text-foreground">{t("terms.section3")}</h3>
          <p>{t("terms.section3_body")}</p>

          {/* Section 4 */}
          <h3 className="font-semibold text-foreground">{t("terms.section4")}</h3>
          <p>{t("terms.section4_body")}</p>

          {/* Last Updated */}
          <p className="pt-3 text-center text-xs text-muted-foreground">
            {t("terms.lastUpdated")}
          </p>

          {/* Back Button */}
          <div className="pt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="px-6"
            >
              {t("terms.back")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Terms;
