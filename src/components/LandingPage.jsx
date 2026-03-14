import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import fidarLogo from "../assets/fidarlogo.jpg";
import ModeToggle from "@/components/theme-provider/mode-toggle";
import { Globe } from "lucide-react";

import {
  ShieldCheck,
  Lock,
  Activity,
  Users,
  FileCheck,
  BarChart3,
  KeyRound,
  ScanFace,
  ShieldAlert,
  Database,
  Settings,
  BadgeCheck,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useLanguage } from "@/providers/LanguageProvider";

function LanguageSwitcher() {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 hover:bg-accent rounded-md">
          <Globe className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={5}>
        <DropdownMenuItem
          className={lang === "en" ? "font-bold" : ""}
          onClick={() => toggleLanguage("en")}
        >
          English
        </DropdownMenuItem>

        <DropdownMenuItem
          className={lang === "ar" ? "font-bold" : ""}
          onClick={() => toggleLanguage("ar")}
        >
          العربية
        </DropdownMenuItem>

        <DropdownMenuItem
          className={lang === "hi" ? "font-bold" : ""}
          onClick={() => toggleLanguage("hi")}
        >
          हिंदी
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function EmployeeLanding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">

      {/* ================= HEADER ================= */}
      <header
        className="relative bg-card border-b border-b-gray-700 px-4 lg:px-8 shadow-sm sticky top-0 z-40"
        dir="ltr"
      >
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <img src={fidarLogo} alt="Fidar Logo" className="h-10 w-auto rounded-md" />

            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="#operations" className="hover:underline">Operations</a>
              <a href="#security" className="hover:underline">Security</a>
              <a href="#analytics" className="hover:underline">Analytics</a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">

            {/* Employee Login (leads to Emp-login page with QR + SSO + Passkey) */}
            <button
              onClick={() => navigate("/Emp-login")}
              className="w-36 h-10 text-sm font-semibold rounded-lg
                bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900
                text-white shadow-lg hover:scale-[1.03] active:scale-95
                hover:shadow-[0_0_15px_rgba(79,70,229,0.5)]
                transition-all duration-300"
            >
              Employee Login
            </button>

            <ModeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="flex-1 relative">

        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.06] bg-[url('/grid.svg')] bg-cover pointer-events-none z-0"></div>

        {/* Red glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[700px] h-[700px] rounded-full bg-[#E11D48]/35 blur-[200px]"></div>
        </div>

        {/* ================= HERO ================= */}
        <section
          className="relative z-10 flex items-start justify-center pt-24 min-h-[calc(100vh-2rem)]
                      px-4 lg:px-8 text-center"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <div className="max-w-3xl mx-auto space-y-4 animate-fade-up -mt-10">

            <p className="uppercase text-[#E11D48] tracking-widest text-xs font-semibold">
              Internal Control Center
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              <span className="text-[#E11D48]">
                Employee Operations Dashboard
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Manage approvals, monitor transactions, oversee security events,
              and maintain system integrity — all from one secure interface.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur">
                <BadgeCheck className="w-6 h-6 text-[#E11D48]" />
                <span>Role-Based Access</span>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur">
                <ShieldCheck className="w-6 h-6 text-[#E11D48]" />
                <span>Audit Logging</span>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur">
                <Activity className="w-6 h-6 text-[#E11D48]" />
                <span>Live Monitoring</span>
              </div>
            </div>

          </div>
        </section>

        {/* ================= DASHBOARD PREVIEW STRIP ================= */}
        <section className="relative z-30 -mt-80 px-4 lg:px-14">
          <div className="max-w-7xl mx-auto bg-card/60 backdrop-blur-2xl border border-border
                          rounded-2xl p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Pending Approvals */}
            <div className="bg-card border rounded-2xl p-6 shadow-md hover:shadow-xl transition-all">
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
              <h3 className="text-3xl font-bold mt-2">18</h3>
              <p className="text-xs text-muted-foreground mt-2">High priority: 4</p>
            </div>

            {/* Fraud Alerts */}
            <div className="bg-card border rounded-2xl p-6 shadow-md hover:shadow-xl transition-all">
              <p className="text-sm text-muted-foreground">Fraud Alerts</p>
              <h3 className="text-3xl font-bold mt-2 text-red-500">3</h3>
              <p className="text-xs text-muted-foreground mt-2">Requires review</p>
            </div>

            {/* System Health */}
            <div className="bg-card border rounded-2xl p-6 shadow-md hover:shadow-xl transition-all">
              <p className="text-sm text-muted-foreground">System Health</p>
              <h3 className="text-3xl font-bold mt-2 text-green-500">98.6%</h3>
              <p className="text-xs text-muted-foreground mt-2">All services operational</p>
            </div>

            {/* Active Employees */}
            <div className="bg-card border rounded-2xl p-6 shadow-md hover:shadow-xl transition-all">
              <p className="text-sm text-muted-foreground">Active Staff</p>
              <h3 className="text-3xl font-bold mt-2">42</h3>
              <p className="text-xs text-muted-foreground mt-2">Online now</p>
            </div>

          </div>
        </section>

        {/* ================= OPERATIONS SECTION ================= */}
        <section id="operations" className="py-20" dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="max-w-7xl mx-auto text-center">

            <h2 className="text-2xl font-semibold">Operational Tools</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mt-3">
              Built for internal teams handling transaction approvals,
              compliance checks, and system oversight.
            </p>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-10">

              <div className="bg-card border rounded-lg p-6">
                <FileCheck className="h-6 w-6 mb-3 text-primary" />
                <h3>Transaction Approvals</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Review and authorize high-value transfers with full audit trace.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <Users className="h-6 w-6 mb-3 text-primary" />
                <h3>User Management</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Assign roles, permissions, and enforce internal policies.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <Database className="h-6 w-6 mb-3 text-primary" />
                <h3>Data Oversight</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Monitor logs, exports, and system activity in real time.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ================= SECURITY ================= */}
        <section id="security" className="py-20 border-t border-border text-center"
          dir={lang === "ar" ? "rtl" : "ltr"}>
          <h3 className="text-xl font-semibold">Enterprise Security</h3>

          <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
            Internal access is protected with layered authentication,
            biometric verification, and strict audit compliance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 px-4">

            <div className="bg-card border rounded-lg p-6">
              <KeyRound className="h-6 w-6 mb-3 text-primary" />
              <h4>Hardware MFA</h4>
              <p className="text-sm text-muted-foreground mt-2">
                FIDO-based authentication for internal systems.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <ScanFace className="h-6 w-6 mb-3 text-primary" />
              <h4>Biometric Verification</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Face authentication for secure approvals.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <ShieldAlert className="h-6 w-6 mb-3 text-primary" />
              <h4>Threat Detection</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Real-time anomaly and fraud monitoring.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-card border-t border-border mt-12" dir="ltr">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 text-sm text-muted-foreground flex justify-between">
          <div>© {new Date().getFullYear()} Smart Bank — Internal System</div>
          <div>Confidential • Authorized Personnel Only</div>
        </div>
      </footer>

    </div>
  );
}