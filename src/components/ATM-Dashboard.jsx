import React, { useEffect, useMemo, useState } from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Info,ArrowBigLeft, ArrowBigRight } from "lucide-react";
import logo from "@/assets/banklogo.png";
import ModeToggle from "./theme-provider/mode-toggle";
import Header from "./header/Header";
import { useTranslation } from "react-i18next";

// Constants
const ATM_COLORS = {
  room: "from-[--background] via-[--background] to-[--background]",
  bezel: "bg-card",
  bezelAccent: "bg-muted",
  screen:
    "border border-border bg-gradient-to-b from-[color-mix(in_oklab,var(--card)_90%,var(--primary))] to-[color-mix(in_oklab,var(--card)_100%,var(--primary)_10%)] shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)]",
  screenText: "text-card-foreground",
  accent: "text-primary",
  primary: "bg-primary hover:bg-[color-mix(in_oklab,var(--primary),black_10%)]",
  secondary: "bg-secondary hover:bg-[color-mix(in_oklab,var(--secondary),black_8%)]",
  enter:
    "bg-primary hover:bg-[color-mix(in_oklab,var(--primary),black_10%)] text-primary-foreground",
  clear:
    "bg-accent hover:bg-[color-mix(in_oklab,var(--accent),black_10%)] text-accent-foreground",
  cancel:
    "bg-destructive hover:bg-[color-mix(in_oklab,var(--destructive),black_10%)] text-destructive-foreground",
  ledOn: "text-primary",
  ledOff: "text-muted-foreground",
};

const MIN_WITHDRAW = 20;
const MAX_WITHDRAW = 800;
const DENOM = 20;

// API Configuration
const BASE = "http://localhost:3001/iam";
const deviceId =
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `dev-${(typeof crypto !== "undefined" && crypto.getRandomValues
        ? [...crypto.getRandomValues(new Uint8Array(16))]
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
        : Math.random().toString(16).slice(2))}`;

// Utils
const fmtUSD = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const fmtCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    Number(amount || 0)
  );

const isValidAmount = (amt) => !!amt && amt > 0 && Number.isFinite(amt);

// Session
const sessionState = {
  getToken: () => {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage?.getItem("AtmsessionData")
        : null;
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.token || "";
    } catch {
      return "";
    }
  },
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionState.getToken()}`,
});

// API
async function sendWithdrawNotify({ customerId, amount }) {
  const res = await fetch(`${BASE}/api/notify/token`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      customerId,
      title: "Cash Withdrawal Approval",
      description: "Approval request from Smart ATM",
      body: `Tap to approve withdrawal of ₹${amount}`,
      channel: "HIGH_ALERT",
      data: {
        action: "CASH_WITHDRAW",
        amount: String(amount),
        message: "Approve ATM Cash Withdrawal",
        deepLink: `app://auth/approve?type=withdraw&amount=${amount}`,
      },
    }),
  });
  if (!res.ok) throw new Error(`Notify failed: ${res.status}`);
  return res.json();
}

async function getApprovalStatus(sessionId) {
  const res = await fetch(`${BASE}/api/approval/status/${sessionId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Status failed: ${res.status}`);
  return res.json();
}

async function postWithdraw(amount) {
  const res = await fetch(`${BASE}/transactions/withdraw`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "x-device-id": String(deviceId),
    },
    body: JSON.stringify({ amount: String(amount) }),
  });
  if (!res.ok) throw new Error(`Withdraw failed: ${res.status}`);
  return res.json();
}

async function getWallet() {
  const res = await fetch(`${BASE}/wallets`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Wallet failed: ${res.status}`);
  const data = await res.json();
  const amount = Number(data?.balance?.amount ?? 0);
  const currency = data?.balance?.currency ?? "USD";
  return { amount, currency, raw: data };
}

async function pollApproval({
  sessionId,
  intervalMs = 2000,
  timeoutMs = 300000,
  fetchStatus,
}) {
  const start = Date.now();
  // loop
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { status } = await fetchStatus(sessionId);
    if (status === "APPROVED") return { status };
    if (status === "DECLINED" || status === "EXPIRED") return { status };
    if (Date.now() - start > timeoutMs) return { status: "TIMEOUT" };
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

// Header
export function AtmHeader() {
  const { t } = useTranslation();
  return (
    <CardHeader className="p-0 bg-card">
      <div className="relative p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-normal bg-gradient-to-b from-white/40 to-transparent dark:from-white/5" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-card-foreground">
            <img
              src={logo}
              alt="Smart Bank Logo"
              className="h-10 w-auto rounded-sm"
              loading="eager"
              decoding="async"
            />
            <CardTitle className="text-base sm:text-lg">
              {t("atm-dashboard.header.title")}
            </CardTitle>
          </div>
          <div className="flex items-center">
            <ModeToggle />
          </div>
        </div>
      </div>
      <div className="border-b border-border bg-muted/40" />
    </CardHeader>
  );
}

// Soft key keys (translate at render)
const SOFT_LEFT_KEYS = [
  "atm-dashboard.softkeys.left.accountInfo",
  "atm-dashboard.softkeys.left.withdraw",
  "atm-dashboard.softkeys.left.deposit",
];

const SOFT_RIGHT_KEYS = [
  "atm-dashboard.softkeys.right.pinChange",
  "atm-dashboard.softkeys.right.balance",
  "atm-dashboard.softkeys.right.otherServices",
];

// Screen body
function ScreenBody({
  stage,
  balance,
  currency,
  inputAmount,
  toAccount,
  pin,
  infoMessage,
  onKey,
  busy,
  onChangeAmount,
  onChangeAccount,
  onChangePin,
  onSubmit,
  onCloseToMenu,
  pinVisible,
  onTogglePinVisible,
}) {
  const { t } = useTranslation();

  const Line = ({ children }) => (
    <div className="text-sm sm:text-base text-zinc-800">{children}</div>
  );
  const Hint = ({ children }) => (
    <div className="text-[10px] sm:text-xs text-zinc-500 flex items-center gap-1">
      <Info className="w-4 h-4" />
      <span>{children}</span>
    </div>
  );

  if (stage === "menu") {
    return (
      <div
        className={[
          "w-full px-2 pt-2 sm:p-4",
          ATM_COLORS.screen,
          ATM_COLORS.screenText,
          "rounded-md overflow-hidden",
          "flex flex-col items-center justify-center",
          "min-h-[260px] sm:min-h-[320px]",
          "text-center",
        ].join(" ")}
      >
        <div className={`text-xl sm:text-3xl font-semibold ${ATM_COLORS.accent}`}>
          <div className="text-xl font-semibold">
            {t("atm-dashboard.screen.welcome")}
          </div>
        </div>
        <Separator className="my-3 bg-border" />
        <div className="space-y-2 max-w-[36ch] sm:max-w-[48ch] text-sm sm:text-base text-muted-foreground leading-relaxed">
          <p>{t("atm-dashboard.screen.instructions1")}</p>
          <p>{t("atm-dashboard.screen.instructions2")}</p>
        </div>
        <div className="mt-3 text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
          <Info className="w-4 h-4" />
          <span>{t("atm-dashboard.screen.pressToBegin")}</span>
        </div>
      </div>
    );
  }

  if (stage === "balance") {
  return (
    <div
      className={[
        "w-full px-2 pt-2 sm:p-4",
        ATM_COLORS.screen,
        ATM_COLORS.screenText,
        "flex flex-col rounded-md",
        "min-h-[260px] sm:min-h-[320px]", // same fixed height as menu
      ].join(" ")}
    >
      {/* Header */}
      <div className="text-lg sm:text-2xl font-semibold text-emerald-700">
        {t("atm-dashboard.screen.balanceTitle")}
      </div>

      <Separator className="my-2 sm:my-3 bg-zinc-200" />

      {/* Balance lines */}
      <Line>
        {t("dashboard.yourBalanceIs")}: {fmtCurrency(balance, currency)}
      </Line>
      <Line>
        {t("atm-dashboard.screen.balanceTitle")}: {fmtCurrency(balance, currency)}
      </Line>

      {/* Spacer to push footer down */}
      <div className="flex-grow"></div>

      {/* Footer */}
      <div className="mt-4 flex gap-2 items-center">
        <Button
          onClick={onCloseToMenu}
          className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
        >
          {t("atm-dashboard.screen.close")}
        </Button>
        <Hint>{t("atm-dashboard.screen.useCloseHint")}</Hint>
      </div>
    </div>
  );
}


  if (stage === "account") {
  return (
    <div
      className={[
        "w-full px-2 pt-2 sm:p-4",
        ATM_COLORS.screen,
        ATM_COLORS.screenText,
        "flex flex-col rounded-md",
        "min-h-[260px] sm:min-h-[320px]", // same fixed height as menu
      ].join(" ")}
    >
      {/* Title */}
      <div className="text-lg sm:text-2xl font-semibold text-emerald-700">
        {t("atm-dashboard.screen.accountTitle")}
      </div>

      {/* Separator */}
      <Separator className="my-2 sm:my-3 bg-zinc-200" />

      {/* Account Details */}
      <Line>
        {t("dashboard.yourBalanceIs")}: {fmtCurrency(balance, currency)}
      </Line>
      <Line>
        {t("atm-dashboard.screen.accountTitle")}: {currency}
      </Line>
      <Line>Time: {new Date().toLocaleString()}</Line>

      {/* Spacer to push footer down */}
      <div className="flex-grow"></div>

      {/* Close Button and Hint */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <Button
          onClick={onCloseToMenu}
          className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
        >
          {t("atm-dashboard.screen.close")}
        </Button>
        <Hint>{t("atm-dashboard.screen.useCloseHint")}</Hint>
      </div>
    </div>
  );
}


  if (stage === "other") {
  return (
    <div
      className={[
        "w-full px-2 pt-2 sm:p-4",
        ATM_COLORS.screen,
        ATM_COLORS.screenText,
        "flex flex-col rounded-md",
        "min-h-[260px] sm:min-h-[320px]", // same fixed height as menu
      ].join(" ")}
    >
      {/* Title */}
      <div className="text-lg sm:text-2xl font-semibold text-emerald-700">
        {t("atm-dashboard.screen.otherTitle")}
      </div>

      {/* Separator */}
      <Separator className="my-2 sm:my-3 bg-zinc-200" />

      {/* Message */}
      <Line>{t("atm-dashboard.screen.otherMessage")}</Line>

      {/* Spacer to push footer down */}
      <div className="flex-grow"></div>

      {/* Close Button and Hint */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <Button
          onClick={onCloseToMenu}
          className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
        >
          {t("atm-dashboard.screen.close")}
        </Button>
        <Hint>{t("atm-dashboard.screen.useCloseHint")}</Hint>
      </div>
    </div>
  );
}


  if (
  stage === "withdraw" ||
  stage === "deposit" ||
  stage === "transfer" ||
  stage === "pinchange"
) {
  const title =
    stage === "withdraw"
      ? t("atm-dashboard.screen.withdrawTitle")
      : stage === "deposit"
      ? t("atm-dashboard.screen.depositTitle")
      : stage === "transfer"
      ? t("atm-dashboard.screen.transferTitle")
      : t("atm-dashboard.screen.pinChangeTitle");

  const desc =
    stage === "withdraw"
      ? t("atm-dashboard.screen.withdrawDesc")
      : stage === "deposit"
      ? t("atm-dashboard.screen.depositDesc")
      : stage === "transfer"
      ? t("atm-dashboard.screen.transferDesc")
      : t("atm-dashboard.screen.pinChangeDesc");

  const isMoney =
    stage === "withdraw" || stage === "deposit" || stage === "transfer";

  return (
    <div
      className={[
        "w-full px-2 pt-2 sm:p-4",
        ATM_COLORS.screen,
        ATM_COLORS.screenText,
        "flex flex-col rounded-md",
        "min-h-[260px] sm:min-h-[320px]", // same fixed height
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-lg sm:text-2xl font-semibold text-emerald-700">
          {title}
        </div>
        {busy && (
          <div className="text-xs text-zinc-500">
            {t("atm-dashboard.screen.processing")}
          </div>
        )}
      </div>

      <Separator className="my-2 sm:my-3 bg-zinc-200" />

      {/* Content */}
      <div className="space-y-3">
        <div className="text-sm text-zinc-600">{desc}</div>

        {stage === "transfer" && (
          <>
            <Label className="text-sm">
              {t("atm-dashboard.screen.recipientLabel")}
            </Label>
            <Input
              value={toAccount}
              onChange={(e) => onChangeAccount(e.target.value)}
              placeholder={t("atm-dashboard.screen.recipientLabel")}
              inputMode="numeric"
              autoFocus
            />
          </>
        )}

        {isMoney && (
          <>
            <Label className="text-sm">
              {t("atm-dashboard.screen.amountLabel")} (
              {fmtUSD(0).replace("0.00", "")})
            </Label>
            <Input
              inputMode="numeric"
              value={inputAmount}
              onChange={(e) =>
                onChangeAmount(e.target.value.replace(/[^\d]/g, ""))
              }
              placeholder={t("atm-dashboard.screen.enterAmountPlaceholder")}
            />
            {stage === "withdraw" ? (
              <div className="text-xs text-zinc-500">
                {t("atm-dashboard.screen.denominationInfo", {
                  value: fmtCurrency(DENOM, currency),
                })}
              </div>
            ) : (
              <div className="text-xs text-zinc-500">
                {t("atm-dashboard.screen.useKeypad")}
              </div>
            )}
          </>
        )}

        {stage === "pinchange" && (
          <>
            <Label className="text-sm">
              {t("atm-dashboard.screen.newPinLabel")}
            </Label>
            <div className="relative">
              <Input
                type={pinVisible ? "text" : "password"}
                value={pin}
                onChange={(e) =>
                  onChangePin(e.target.value.replace(/[^\d]/g, ""))
                }
                placeholder={t("atm-dashboard.screen.enterPinPlaceholder")}
                inputMode="numeric"
              />
              <button
                type="button"
                aria-label={pinVisible ? "Hide PIN" : "Show PIN"}
                onClick={onTogglePinVisible}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-600 hover:text-zinc-800"
              >
                {pinVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="text-xs text-zinc-500">
              {t("atm-dashboard.screen.pinChangeDesc")}
            </div>
          </>
        )}
      </div>

      {/* Spacer to push footer down */}
      <div className="flex-grow"></div>

      {/* Footer */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <Button
          onClick={onSubmit}
          className={`${ATM_COLORS.primary} text-white disabled:opacity-60`}
          disabled={busy}
        >
          {t("atm-dashboard.screen.submit")}
        </Button>
        <Button
          onClick={onCloseToMenu}
          className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
          disabled={busy}
        >
          {t("atm-dashboard.screen.close")}
        </Button>
      </div>

      <Separator className="my-3 bg-zinc-200" />
      <Hint>{t("atm-dashboard.screen.keypadHint")}</Hint>
    </div>
  );
}


  if (stage === "receipt") {
    return (
      <div
        className={`w-full px-2 pt-2 sm:p-4 ${ATM_COLORS.screen} ${ATM_COLORS.screenText} flex flex-col rounded-md`}
      >
        <div className="text-lg sm:text-2xl font-semibold text-emerald-700">
          {t("atm-dashboard.screen.receiptTitle")}
        </div>
        <Separator className="my-2 sm:my-3 bg-zinc-200" />
        <pre className="whitespace-pre-wrap text-sm font-mono">
          {infoMessage || t("atm-dashboard.messages.noReceipt")}
        </pre>
        <div className="mt-4 flex gap-2">
          <Button
            onClick={onCloseToMenu}
            className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
          >
            {t("atm-dashboard.screen.close")}
          </Button>
        </div>
        <Hint>{t("atm-dashboard.screen.useCloseHint")}</Hint>
      </div>
    );
  }

  return (
    <div
      className={`w-full px-2 pt-2 sm:p-4 ${ATM_COLORS.screen} ${ATM_COLORS.screenText} flex flex-col rounded-md`}
    >
      <Line>Loading…</Line>
    </div>
  );
}

// Keypad
function NumericKeypad({ onKey }) {
  const { t } = useTranslation();
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", t("atm-dashboard.keypad.clear"), "0", t("atm-dashboard.keypad.enter")];

  useEffect(() => {
    const onDown = (e) => {
      if (e.key >= "0" && e.key <= "9") onKey(e.key);
      if (e.key === "Enter") onKey("Enter");
      if (e.key === "Escape") onKey("Cancel");
      if (e.key === "Backspace") onKey("Clear");
    };
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, [onKey]);

  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {keys.map((k) => (
        <Button
          key={k}
          onClick={() => onKey(k)}
          variant="secondary"
          aria-label={`key ${k}`}
          className={[
            "h-11 sm:h-12 text-base md:text-lg rounded-md shadow-sm px-3",
            k === t("atm-dashboard.keypad.enter") ? ATM_COLORS.enter : "",
            k === t("atm-dashboard.keypad.clear") ? ATM_COLORS.clear : "",
            k !== t("atm-dashboard.keypad.enter") && k !== t("atm-dashboard.keypad.clear")
              ? `${ATM_COLORS.secondary} text-foreground`
              : "",
          ].join(" ")}
        >
          {k}
        </Button>
      ))}
    </div>
  );
}

function SoftKeysLeft({ onSelect }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col w-full gap-12">
      {SOFT_LEFT_KEYS.map((key, i) => {
        const label = t(key);
        return (
          <Button
            key={key}
            onClick={() => onSelect(i)}
            variant="secondary"
            className="bg-secondary hover:bg-[color-mix(in_oklab,var(--secondary),black_8%)] text-foreground min-h-12 md:min-h-16 text-sm font-medium rounded-lg w-full whitespace-normal break-words"
            aria-label={`Soft key left ${label}`}
          >
            <span className="hidden md:inline"><ArrowBigLeft /></span>
            <span className="leading-snug">{label}</span>
          </Button>
        );
      })}
    </div>
  );
}

function SoftKeysRight({ onSelect }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col w-full gap-12">
      {SOFT_RIGHT_KEYS.map((key, i) => {
        const label = t(key);
        return (
          <Button
            key={key}
            onClick={() => onSelect(i)}
            variant="secondary"
            className="bg-secondary hover:bg-[color-mix(in_oklab,var(--secondary),black_8%)] text-foreground min-h-12 md:min-h-16 text-sm font-medium rounded-lg w-full whitespace-normal break-words"
            aria-label={`Soft key right ${label}`}
          >
            <span className="leading-snug">{label}</span>
            <span className="hidden md:inline"><ArrowBigRight /></span>
          </Button>
        );
      })}
    </div>
  );
}

function SoftKeysMobile({ onSelect }) {
  const { t } = useTranslation();
  const items = [
    ...SOFT_LEFT_KEYS.map((key, i) => ({ side: "L", i, label: t(key) })),
    ...SOFT_RIGHT_KEYS.map((key, i) => ({ side: "R", i, label: t(key) })),
  ];
  return (
    <div className="grid grid-cols-3 gap-2 md:hidden py-2">
      {items.map(({ side, i, label }) => (
        <Button
          key={`${side}-${i}`}
          onClick={() => (side === "L" ? onSelect.left(i) : onSelect.right(i))}
          variant="secondary"
          className="h-10 text-sm bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
          aria-label={`soft ${label}`}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

// Footer wrapper
function FooterPanel({ onKeypad }) {
  return (
    <div className="w-full sm:pl-12 sm:pt-1 sm:pb-1">
      <div className="w-full">
        <NumericKeypad onKey={onKeypad} />
      </div>
    </div>
  );
}

function HardwarePanelRight() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row md:flex-col items-stretch p-1.5 gap-1 h-auto md:h-full">
      <div className="relative w-full md:w-auto flex-1">
        <div className="rounded-md p-1.5 md:p-2">
          <div className="relative h-28 md:h-48 rounded-md bg-gradient-to-b from-zinc-700 to-zinc-900 shadow ring-1 ring-zinc-800/40">
            <div className="absolute inset-x-0 top-0 h-[32%] md:h-[34%] rounded-t-md bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <div className="absolute left-8 right-8 md:left-3.5 md:right-3.5 top-[40%] h-[15%] md:h-[23%] rounded-md bg-gradient-to-b from-black/90 via-black/75 to-black/40" />
            <div className="absolute right-2.5 md:right-3 top-2.5 md:top-3 h-3 w-3 md:h-3.5 md:w-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_2px_rgba(16,185,129,0.75)]" />
          </div>
        </div>
        <div className="mt-0.5 text-[10px] text-center text-zinc-600">{t("atm-dashboard.card_slot")}</div>
      </div>
    </div>
  );
}

// Main
export default function ATMDashboard() {
  const { t } = useTranslation();

  const [balance, setBalance] = useState(0);
  const [pin, setPin] = useState("");
  const [stage, setStage] = useState("menu");
  const [infoMessage, setInfoMessage] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [busy, setBusy] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const onTogglePinVisible = () => setPinVisible((v) => !v);
  const [customerId] = useState(() => {
    try {
      const sd = typeof window !== "undefined"
        ? JSON.parse(window.sessionStorage?.getItem("sessionData") || "{}")
        : {};
      return sd?.customerId || "12345";
    } catch {
      return "UNKNOWN";
    }
  });
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const w = await getWallet();
        if (alive) {
          setBalance(w.amount);
          setCurrency(w.currency);
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const maskedPin = useMemo(() => "•".repeat(pin.length), [pin]);

  const resetFlow = () => {
    setPin("");
    setInputAmount("");
    setToAccount("");
  };

  const openReceipt = (title, lines = []) => {
    setInfoMessage([title, "", ...lines].join("\n"));
    setStage("receipt");
  };

  const onCloseToMenu = () => {
    resetFlow();
    setPinVisible(false);
    setStage("menu");
  };

  const onSubmit = () => handleKey("Enter");

  const handleSoftLeft = async (index) => {
    switch (index) {
      case 0: {
        setBusy(true);
        try {
          const w = await getWallet();
          setBalance(w.amount);
          setCurrency(w.currency);
          setStage("account");
        } finally {
          setBusy(false);
        }
        break;
      }
      case 1:
        setStage("withdraw");
        break;
      case 2:
        setStage("deposit");
        break;
      default:
        break;
    }
  };

  const handleSoftRight = async (index) => {
    switch (index) {
      case 0:
        setStage("pinchange");
        break;
      case 1: {
        setBusy(true);
        try {
          const w = await getWallet();
          setBalance(w.amount);
          setCurrency(w.currency);
          setStage("balance");
        } finally {
          setBusy(false);
        }
        break;
      }
      case 2:
        setStage("other");
        break;
      default:
        break;
    }
  };

  const handleKey = async (k) => {
    if (k === "Cancel") {
      resetFlow();
      setStage("menu");
      return;
    }
    if (k === "Clear") {
      if (stage === "pinchange") setPin("");
      else setInputAmount("");
      return;
    }
    if (k === "Enter") {
      if (stage === "withdraw") {
        const amt = Number(inputAmount);
        if (!isValidAmount(amt)) return;
        if (amt % DENOM !== 0) {
          openReceipt(t("atm-dashboard.messages.withdrawFailed"), [
            t("atm-dashboard.screen.denominationInfo", {
              value: fmtCurrency(DENOM, currency),
            }),
          ]);
        } else if (amt < MIN_WITHDRAW) {
          openReceipt(t("atm-dashboard.messages.withdrawFailed"), [
            `${t("atm-dashboard.screen.amountLabel")}: ${fmtCurrency(
              MIN_WITHDRAW,
              currency
            )}`,
          ]);
        } else if (amt > MAX_WITHDRAW) {
          openReceipt(t("atm-dashboard.messages.withdrawFailed"), [
            `${t("atm-dashboard.screen.amountLabel")}: ${fmtCurrency(
              MAX_WITHDRAW,
              currency
            )}`,
          ]);
        } else if (amt > balance) {
          openReceipt(t("atm-dashboard.messages.withdrawFailed"), [
            t("atm-dashboard.messages.transferFailed"),
          ]);
        } else {
          setBusy(true);
          try {
            const notifyRes = await sendWithdrawNotify({ customerId, amount: amt });
            const sessionId = notifyRes.sessionId;

            const { status } = await pollApproval({
              sessionId,
              fetchStatus: getApprovalStatus,
            });

            if (status === "APPROVED") {
              await postWithdraw(amt);
              const w = await getWallet();
              setBalance(w.amount);
              setCurrency(w.currency);
              openReceipt(t("atm-dashboard.messages.withdrawSuccessful"), [
                `${t("atm-dashboard.screen.withdrawTitle")}:   ${fmtCurrency(
                  amt,
                  w.currency
                )}`,
                `${t("dashboard.yourBalanceIs")}: ${fmtCurrency(
                  w.amount,
                  w.currency
                )}`,
              ]);
            } else if (status === "DECLINED") {
              openReceipt(t("atm-dashboard.messages.withdrawDeclined"), [
                t("atm-dashboard.screen.pressToBegin"),
              ]);
            } else if (status === "EXPIRED" || status === "TIMEOUT") {
              openReceipt(t("atm-dashboard.messages.withdrawTimeout"), [
                t("atm-dashboard.screen.pressToBegin"),
              ]);
            } else {
              openReceipt(t("atm-dashboard.messages.withdrawFailed"), [
                "Unexpected approval status.",
              ]);
            }
          } catch (err) {
            openReceipt(t("atm-dashboard.messages.withdrawError"), [
              String(err?.message || err),
            ]);
          } finally {
            setBusy(false);
          }
        }
        resetFlow();
        setStage("menu");
        return;
      } else if (stage === "deposit") {
        const amt = Number(inputAmount);
        if (!isValidAmount(amt)) return;
        setBalance((b) => b + amt);
        openReceipt(t("atm-dashboard.messages.depositSuccessful"), [
          `${t("atm-dashboard.screen.depositTitle")}:   ${fmtUSD(amt)}`,
          `${t("dashboard.yourBalanceIs")}: ${fmtUSD(balance + amt)}`,
        ]);
        resetFlow();
        setStage("menu");
      } else if (stage === "transfer") {
        const amt = Number(inputAmount);
        if (!isValidAmount(amt) || !toAccount.trim()) return;
        if (amt > balance) {
          openReceipt(t("atm-dashboard.messages.transferFailed"), [
            t("atm-dashboard.messages.transferFailed"),
          ]);
        } else {
          setBalance((b) => b - amt);
          openReceipt(t("atm-dashboard.messages.transferSuccessful"), [
            `To:          ${toAccount}`,
            `Amount:      ${fmtUSD(amt)}`,
            `${t("dashboard.yourBalanceIs")}: ${fmtUSD(balance - amt)}`,
          ]);
        }
        resetFlow();
        setStage("menu");
      } else if (stage === "pinchange") {
        if (pin.length < 4 || pin.length > 6) {
          openReceipt(t("atm-dashboard.messages.pinChangeFailed"), [
            t("atm-dashboard.screen.pinChangeDesc"),
          ]);
        } else {
          openReceipt(t("atm-dashboard.messages.pinChanged"), [
            t("atm-dashboard.messages.pinChanged"),
          ]);
        }
        resetFlow();
        setStage("menu");
      }
      return;
    }
    if (/^\d$/.test(k)) {
      if (stage === "pinchange") {
        if (pin.length < 6) setPin((p) => p + k);
      } else {
        if (inputAmount.length < 7)
          setInputAmount((s) => (s === "0" ? k : s + k));
      }
    }
  };

  return (
    <div
      className={`h-screen w-screen overflow-hidden bg-gradient-to-b ${ATM_COLORS.room} text-foreground grid grid-rows-[auto_1fr]`}
    >
      <div className="w-full border-b border-border bg-muted">
        <Header type={"atm"} />
      </div>

      <div className="h-full grid grid-rows-[1fr_auto]">
        <div className="grid grid-cols-12 gap-3 p-2 sm:p-3 md:p-4">
          <div className="col-span-12 lg:col-span-9 h-full">
            <div className="grid grid-cols-12 h-full">
              <div className="col-span-2 hidden md:flex items-stretch">
                <SoftKeysLeft onSelect={handleSoftLeft} />
              </div>

              <div className="col-span-12 md:col-span-8 flex md:px-4">
                <div className="w-full flex flex-col">
                  <SoftKeysMobile
                    onSelect={{ left: handleSoftLeft, right: handleSoftRight }}
                  />
                  <div className="flex-1 min-h-0">
                    <ScreenBody
                      stage={stage}
                      balance={balance}
                      currency={currency}
                      inputAmount={inputAmount}
                      toAccount={toAccount}
                      pin={pin}
                      infoMessage={infoMessage}
                      onKey={handleKey}
                      busy={busy}
                      onChangeAmount={setInputAmount}
                      onChangeAccount={setToAccount}
                      onChangePin={setPin}
                      onSubmit={() => handleKey("Enter")}
                      onCloseToMenu={onCloseToMenu}
                      pinVisible={pinVisible}
                      onTogglePinVisible={onTogglePinVisible}
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2 hidden md:flex items-stretch">
                <SoftKeysRight onSelect={handleSoftRight} />
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-3 h-full">
            <div className="h-full min-h-0 overflow-hidden">
              <HardwarePanelRight />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 p-2 sm:p-3 md:p-4 border-t border-border bg-card/40">
          <div className="hidden lg:block lg:col-span-7" />
          <div className="col-span-12 lg:col-span-5">
            <FooterPanel onKeypad={handleKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
