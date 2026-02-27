import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Phone,
  BadgeCheck,
  ShieldCheck,
  Settings,
  FileText,
  Lock,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/header/Header";

export default function ActionsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Header type={"bank"} />
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl p-4 md:p-8">
        <Card className="shadow-md border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {t("demo.actionsPage.title")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("demo.actionsPage.description")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Primary Actions */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="default"
                className="h-11 justify-start gap-2"
                onClick={() => navigate("/create-user")}
              >
                <Plus className="h-4 w-4" />
                {t("demo.actionsPage.createUser")}
              </Button>

              <Button
                variant="secondary"
                className="h-11 justify-start gap-2"
                onClick={() => navigate("/call-verification")}
              >
                <Phone className="h-4 w-4" />
                {t("demo.actionsPage.callVerification")}
              </Button>

              <Button
                variant="outline"
                className="h-11 justify-start gap-2 sm:col-span-2"
                onClick={() => navigate("/sales-verification")}
              >
                <BadgeCheck className="h-4 w-4" />
                {t("demo.actionsPage.salesVerification")}
              </Button>
            </div>

            <Separator className="my-2" />

            {/* Single 3DS Button */}
            <section className="space-y-3">
              <Alert className="border-primary/30 bg-primary/10">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary font-medium">
                  {t("demo.actionsPage.3dsTitle")}
                </AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  {t("demo.actionsPage.3dsDescription")}
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
                onClick={() => navigate("/3ds")}
              >
                <Lock className="h-4 w-4" />
                {t("demo.actionsPage.proceedTo3ds")}
              </Button>
            </section>
          </CardContent>

          <CardFooter className="flex flex-col md:flex-row items-center justify-between border-t bg-muted/20 gap-3 py-3 px-4">
            <p className="text-xs text-muted-foreground">
              {t("demo.actionsPage.needHelp")}
            </p>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/logs")}
              >
                <FileText className="mr-1 h-4 w-4" />
                {t("demo.actionsPage.viewLogs")}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/settings")}
              >
                <Settings className="mr-1 h-4 w-4" />
                {t("demo.actionsPage.settings")}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
