import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppSidebar from "@/components/sidebar/app-sidebar";
import ModeToggle from "@/components/theme-provider/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import logo from "@/assets/cpxlogo.png";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../language-swicther/LanguageSwitcher";
import { fidar } from "@/lib/fidar"; // ✅ import Fidar to fetch profile

export default function Header({ open, onOpenChange, type = "bank" }) {
  const isATM = type === "atm";
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dir = document.documentElement.dir || i18n.dir(i18n.language);
  const isRTL = dir === "rtl";

  // -----------------------------
  // Profile state
  // -----------------------------
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await fidar.getMyProfile();
        setProfile(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    }
    fetchProfile();
  }, []);

  async function handleSignOut() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("sessionData");
    navigate("/", { replace: true });
  }

  return (
    <header className="bg-card px-2 lg:px-8 shadow-sm sticky top-0 z-40">
      <div className="relative h-14 w-full flex items-center justify-center" dir={dir}>
        
        {/* --- BUTTONS BLOCK (RTL = LEFT EDGE, LTR = RIGHT EDGE) --- */}
        <div
          className={`absolute inset-y-0 flex items-center gap-3 ${
            isRTL ? "left-0" : "right-0"
          }`}
          style={{ paddingInline: "0.5rem" }}
        >
          {/* Mode Toggle with tooltip */}
          <div title="Mode toggle">
            <ModeToggle />
          </div>

          {/* Language Switcher with tooltip */}
          <div title="Language switcher">
            <LanguageSwitcher />
          </div>

          {/* Avatar dropdown with tooltip showing user name */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="outline-none"
                title={profile?.name ? profile.name : "User"}
              >
                <Avatar className="h-9 w-9 ring-2 ring-blue-600 cursor-pointer">
                  {profile?.image ? (
                    <AvatarImage src={profile.image} />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {profile?.name?.split(" ")[0]?.[0].toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align={isRTL ? "start" : "end"}
              className="w-48"
            >
              <DropdownMenuLabel>{t("header.myAccount")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate("/profile")}>
                {t("header.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onSelect={handleSignOut}>
                {t("header.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center area if ever needed */}
        <div className="flex-1 text-center pointer-events-none" aria-hidden />

        {/* --- LOGO + TITLE BLOCK (OPPOSITE SIDE OF BUTTONS) --- */}
        <div
          className={`absolute inset-y-0 flex items-center gap-3 ${
            isRTL ? "right-0" : "left-0"
          }`}
          style={{ paddingInline: "0.5rem" }}
        >
          {!isATM && (
            <Sheet open={open} onOpenChange={onOpenChange}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 rounded-md hover:bg-accent">
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </button>
              </SheetTrigger>

              <SheetContent
                side={isRTL ? "right" : "left"}
                className="p-0 w-72 sm:w-80 bg-sidebar text-sidebar-foreground"
              >
                <SheetHeader className="px-3 py-2 border-b flex items-center justify-start">
                  <SheetTitle className="flex items-center gap-2">
                    <img src={logo} className="h-6 w-auto rounded-sm" />
                    <span>{t("title.smartbank")}</span>
                  </SheetTitle>
                </SheetHeader>

                <AppSidebar onNavigate={() => onOpenChange(false)} />
              </SheetContent>
            </Sheet>
          )}

          <div className="flex items-center gap-2">
            <img src={logo} className="h-8 w-auto rounded-md" />
            <span className="font-extrabold text-lg hidden sm:block">
              Web App
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
