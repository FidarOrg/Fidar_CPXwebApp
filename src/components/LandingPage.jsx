import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import fidarLogo from "../assets/cpx.png";
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
  Layers,
  ClipboardCheck,
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
              className="passkey-btn"
              style={{ padding: "7px 12px", fontSize: "14px", borderRadius: "8px", width: "auto" }}
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
          className="relative z-10 flex items-start justify-center pt-24 pb-16
                      px-4 lg:px-8 text-center"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <div className="max-w-3xl mx-auto space-y-4 animate-fade-up -mt-10">

            <p className="uppercase tracking-widest text-xs font-semibold bg-gradient-to-r from-[#1a2e44] via-[#79C6C7] to-[#79C6C7] bg-clip-text text-transparent">
              Internal Control Center
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-r from-red-600 via-red-500 to-rose-400 bg-clip-text text-transparent">
              Employee Operations Dashboard
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Manage approvals, monitor interactions, oversee security events,
              and maintain system integrity — all from one secure interface
            </p>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center gap-3 px-5 py-2 rounded-full border border-teal-400/40 bg-teal-400/10 backdrop-blur text-sm font-medium">
                <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4 text-teal-400" />
                </div>
                <span>Role-Based Access</span>
              </div>

              <div className="flex items-center gap-3 px-5 py-2 rounded-full border border-teal-400/40 bg-teal-400/10 backdrop-blur text-sm font-medium">
                <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                </div>
                <span>Audit Logging</span>
              </div>

              <div className="flex items-center gap-3 px-5 py-2 rounded-full border border-teal-400/40 bg-teal-400/10 backdrop-blur text-sm font-medium">
                <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-teal-400" />
                </div>
                <span>Live Monitoring</span>
              </div>
            </div>

          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="relative z-10 px-4 lg:px-14 pb-20" dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="max-w-6xl mx-auto text-center">
            <p className="uppercase tracking-widest text-xs font-semibold mb-2 bg-gradient-to-r from-[#1a2e44] via-[#79C6C7] to-[#79C6C7] bg-clip-text text-transparent">How It Works</p>
            <h2 className="text-2xl font-bold mb-14">Secure access in three steps</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* connector line on md+ */}
              <div className="hidden md:block absolute top-8 left-[calc(16.65%+1rem)] right-[calc(16.65%+1rem)] h-px bg-border z-0" />

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-400/40 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold">1. Employee Signs In</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Staff authenticate using a device-bound Fidar Q-Key — no passwords, no OTPs. The
                  cryptographic key never leaves the device's secure enclave.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {["Passwordless", "Passkeys", "PQC"].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full border border-teal-400/40 bg-teal-400/10 text-white text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-400/40 flex items-center justify-center">
                  <Layers className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold">2. AI Verifies Context</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Behavioral intelligence continuously evaluates session risk — analyzing interaction patterns,
                  location signals, and device posture — before granting access to sensitive operations.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {["Behavioral biometrics", "Real-time risk score", "Zero standing access"].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full border border-pink-400/40 bg-pink-400/10 text-white text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-400/40 flex items-center justify-center">
                  <ClipboardCheck className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold">3. Approve &amp; Audit</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every interaction and API call is cryptographically signed and written to an immutable audit
                  trail — providing tamper-proof compliance records from login through to action completion.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {["Immutable audit trail", "Cryptographic signing", "Full compliance logging"].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full border border-pink-400/40 bg-pink-400/10 text-white text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= WHY FIDAR STRIP ================= */}
        <section className="relative z-30 px-4 lg:px-14 py-12">
          <div className="max-w-7xl mx-auto bg-card/60 backdrop-blur-2xl border border-border
                          rounded-2xl p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Passkey Authentication */}
            <div className="bg-card border rounded-2xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col gap-3">
              <KeyRound className="w-8 h-8 text-[#E11D48]" />
              <h3 className="font-semibold text-base">Passkey Authentication</h3>
              <p className="text-xs text-muted-foreground">Phishing-resistant FIDO2 passkeys replaces passwords entirely — no OTPs, no friction.</p>
            </div>

            {/* Zero-Trust Security */}
            <div className="bg-card border rounded-2xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col gap-3">
              <ShieldAlert className="w-8 h-8 text-[#E11D48]" />
              <h3 className="font-semibold text-base">Zero-Trust Architecture</h3>
              <p className="text-xs text-muted-foreground">Every request is verified continuously. No implicit trust granted to any user or device.</p>
            </div>

            {/* Biometric Verification */}
            <div className="bg-card border rounded-2xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col gap-3">
              <ScanFace className="w-8 h-8 text-[#E11D48]" />
              <h3 className="font-semibold text-base">Biometric Verification</h3>
              <p className="text-xs text-muted-foreground">Native device biometrics bind identity to hardware — uncloneable and instant.</p>
            </div>

            {/* AI Fraud Prevention */}
            <div className="bg-card border rounded-2xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col gap-3">
              <ShieldCheck className="w-8 h-8 text-[#E11D48]" />
              <h3 className="font-semibold text-base">AI Fraud Prevention</h3>
              <p className="text-xs text-muted-foreground">Behavioral intelligence and real-time AI models detect and block anomalies before damage occurs.</p>
            </div>

          </div>
        </section>

        {/* ================= OPERATIONS SECTION ================= */}
        <section id="operations" className="py-20" dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="max-w-7xl mx-auto text-center">

            <h2 className="text-2xl font-semibold">Operational Tools</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mt-3">
              Built for internal teams handling transaction approvals,
              compliance checks, and system oversight
            </p>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-10">

              <div className="bg-card border rounded-lg p-6">
                <FileCheck className="h-6 w-6 mb-3 text-primary" />
                <h3>Transaction Approvals</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Review and authorize high-value transfers with full audit trace
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <Users className="h-6 w-6 mb-3 text-primary" />
                <h3>User Management</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Assign roles, permissions, and enforce internal policies
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <Database className="h-6 w-6 mb-3 text-primary" />
                <h3>Data Oversight</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Monitor logs, exports, and system activity in real time
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
            biometric verification, and strict audit compliance
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 px-4">

            <div className="bg-card border rounded-lg p-6">
              <KeyRound className="h-6 w-6 mb-3 text-primary" />
              <h4>Hardware MFA</h4>
              <p className="text-sm text-muted-foreground mt-2">
                FIDO-based authentication for internal systems
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <ScanFace className="h-6 w-6 mb-3 text-primary" />
              <h4>Biometric Verification</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Face authentication for secure approvals
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <ShieldAlert className="h-6 w-6 mb-3 text-primary" />
              <h4>Threat Detection</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Real-time anomaly and fraud monitoring
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