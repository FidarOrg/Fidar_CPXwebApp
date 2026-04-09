import React from "react";
import { ArrowLeft, Shield, Smartphone, User, Globe, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header/Header";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Input from ShadCN

export default function Settings() {
  const devices = [
    { id: 1, name: "Chrome – Windows 10", lastActive: "2 hours ago" },
    { id: 2, name: "Safari – iPhone 14 Pro", lastActive: "Yesterday" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header type="bank" />

      <div className="flex">
        <div className="hidden lg:block sticky top-14 h-[calc(100vh-56px)]">
          <AppSidebar activeItem="settings" />
        </div>

        <main className="flex-1 px-4 lg:px-8 py-6">
          <div className="max-w-screen-xl mx-auto space-y-6">

            {/* PAGE TITLE */}
            <h1 className="text-2xl font-bold">Settings</h1>

            {/* PROFILE SETTINGS */}
            <Card className="bg-card/50 border border-white/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" /> Profile Settings
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Update your personal profile information.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Full Name" className="h-11" />
                  <Input placeholder="Email Address" className="h-11" />
                </div>

                <Button className="passkey-btn mt-3" style={{ width: "auto", padding: "8px 16px", fontSize: "14px", borderRadius: "6px", fontFamily: "inherit" }}>
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* SECURITY SETTINGS */}
            {/* <Card className="bg-card/50 border border-white/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" /> Security Settings
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Update password and secure your account.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Current Password"
                    type="password"
                    className="h-11"
                  />
                  <Input
                    placeholder="New Password"
                    type="password"
                    className="h-11"
                  />
                </div>

                <Button className="mt-3 bg-blue-600 hover:bg-blue-700">
                  Update Password
                </Button>
              </CardContent>
            </Card> */}

            {/* TWO-FACTOR AUTH */}
            <Card className="bg-card/50 border border-white/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" /> Two-Factor Authentication (2FA)
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Add an extra layer of security to your Smart Bank account.
                </p>

                <Button className="passkey-btn" style={{ width: "auto", padding: "8px 16px", fontSize: "14px", borderRadius: "6px", fontFamily: "inherit" }}>
                  Enable 2FA
                </Button>
              </CardContent>
            </Card>

            {/* DEVICE MANAGEMENT */}
            <Card className="bg-card/50 border border-white/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="h-5 w-5" /> Device Management
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Manage devices that have logged into your Smart Bank account.
                </p>

                {devices.map((d) => (
                  <div
                    key={d.id}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center"
                  >
                    {/* Device Info */}
                    <div>
                      <p className="font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {d.lastActive}
                      </p>
                    </div>

                    {/* Compact Remove Button */}
                    <div className="flex md:justify-end">
                      <Button
                        variant="destructive"
                        className="w-fit px-4 py-2 text-sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* APP PREFERENCES */}
            <Card className="bg-card/50 border border-white/10 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5" /> App Preferences
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Choose language, theme, and notification settings.
                </p>

                <Button className="passkey-btn" style={{ width: "auto", padding: "8px 16px", fontSize: "14px", borderRadius: "6px", fontFamily: "inherit" }}>
                  Open Preferences
                </Button>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}
