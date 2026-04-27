import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/cpx.png";
import ModeToggle from "@/components/theme-provider/mode-toggle";
import { QRCodeSVG } from "qrcode.react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Loader2, ShieldCheck, Bluetooth } from "lucide-react";
import { LanguageSwitcher } from "./language-swicther/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// ── QR-BLE constants (temp: no SDK) ──────────────────────────────────────────
const REALM = "FIDAR_WEBAUTH_V2";
const CLIENT_ID = "cpx";
const DEVICE_AUTH_BASE = "https://sdk.fidar.io/fidar/sdk/api/cpx/device-bind";
const QR_REFRESH_MS = 2000;   // refresh QR image every 2s
const POLL_INTERVAL_MS = 3000; // status poll every 3s
const SLOW_DOWN_MS = 10000;
const BLE_SERVICE_UUID  = "0000abcd-0000-1000-8000-00805f9b34fb";
const BLE_CHAR_UUID     = "0000dcba-0000-1000-8000-00805f9b34fb";

function QrPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const customerId = location.state?.customerId;

  // "idle" | "loading" | "qr" | "error"
  const [phase, setPhase] = useState("idle");
  // PENDING_QR | PENDING_BLE | PENDING | AUTHORIZED | EXPIRED
  const [pollStatus, setPollStatus] = useState("PENDING_QR");
  const [qrToken, setQrToken] = useState(null);
  const [error, setError] = useState("");
  const [passkeyLink, setPasskeyLink] = useState(null);
  const [bleLoading, setBleLoading] = useState(false);
  const [expiresIn, setExpiresIn] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);

  const sessionRef = useRef(null);
  const pollTimerRef = useRef(null);
  const qrRefreshTimerRef = useRef(null);
  const bleStartedRef = useRef(false); // prevent double-trigger

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      if (qrRefreshTimerRef.current) clearInterval(qrRefreshTimerRef.current);
    };
  }, []);

  // ⏳ Countdown — only during QR phase
  useEffect(() => {
    if (phase !== "qr") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // 📡 BLE flow — web delivers challenge to phone via BLE, phone calls /verify itself
  const runBleFlow = useCallback(async () => {
    setBleLoading(true);
    setError("");
    console.log("[QR-BLE] runBleFlow triggered");
    try {
      const sessionId = sessionRef.current?.sessionId;
      if (!sessionId) throw new Error("No active session");

      // Generate random challenge component
      const random = crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
      const payload = `${sessionId}:${random}`;

      // Web Bluetooth — must come from user gesture (button click)
      console.log("[QR-BLE] Requesting BLE device...");
      window.__fidarBlePickerOpen = true;
      let device;
      try {
        device = await navigator.bluetooth.requestDevice({
          filters: [{ services: [BLE_SERVICE_UUID] }],
          optionalServices: [BLE_SERVICE_UUID],
        });
      } finally {
        window.__fidarBlePickerOpen = false;
      }

      const server = await device.gatt?.connect();
      if (!server) throw new Error("Unable to connect to Bluetooth device");

      const service = await server.getPrimaryService(BLE_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(BLE_CHAR_UUID);

      // Write challenge to characteristic
      console.log("[QR-BLE] Writing payload to characteristic:", payload);
      const encoded = new TextEncoder().encode(payload);

      try {
        if (characteristic.properties?.write) {
          await characteristic.writeValue(encoded);
        } else if (
          characteristic.properties?.writeWithoutResponse &&
          characteristic.writeValueWithoutResponse
        ) {
          await characteristic.writeValueWithoutResponse(encoded);
        } else {
          throw new Error("BLE characteristic does not support write");
        }

        // Read back phone's signed response
        if (characteristic.properties?.read) {
          const responseValue = await characteristic.readValue();
          console.log(
            "[QR-BLE] Phone response received:",
            new TextDecoder().decode(responseValue)
          );
        }
      } finally {
        if (device.gatt?.connected) device.gatt.disconnect();
      }

      // Phone calls /bluetooth-proximity/verify with qrSessionId — poll picks this up.
      console.log("[QR-BLE] BLE pairing complete ✅");
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      if (qrRefreshTimerRef.current) clearInterval(qrRefreshTimerRef.current);
      toast.success("Device Paired Successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error("[QR-BLE] BLE flow error:", err);
      setError(err.message || "Bluetooth connection failed");
      bleStartedRef.current = false; // allow retry
    } finally {
      setBleLoading(false);
    }
  }, [navigate]);

  // �🔄 Refresh QR token every 1s via GET /device-auth/qr/{sessionId}
  const startQrRefresh = useCallback((sessionId) => {
    const refresh = async () => {
      try {
        const res = await fetch(`${DEVICE_AUTH_BASE}/qr/${sessionId}`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          // const fresh = data.qr ?? data.qrToken ?? data.token ?? null;
          if (data.qr) setQrToken(JSON.stringify(data));
        }
      } catch (err) {
        console.warn("[QR-BLE] QR token refresh error:", err);
      }
    };

    qrRefreshTimerRef.current = setInterval(refresh, QR_REFRESH_MS);
  }, []);

  // 🔄 Poll /device-auth/qr-ble/poll until AUTHORIZED or EXPIRED
  const startPolling = useCallback(
    (session) => {
      const poll = async () => {
        try {
          const res = await fetch(`${DEVICE_AUTH_BASE}/poll`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: session.sessionId,
              realm: REALM,
              clientId: CLIENT_ID,
            }),
          });

          let data = {};
          try { data = await res.json(); } catch (_) {}

          if (res.status === 200 && data.status === "AUTHORIZED") {
            setPollStatus("AUTHORIZED");
            if (qrRefreshTimerRef.current) clearInterval(qrRefreshTimerRef.current);
            setPasskeyLink(data.passkeyLink ?? null);
            return;
          }

          if (data.status === "DENIED") {
            setPollStatus("DENIED");
            if (qrRefreshTimerRef.current) clearInterval(qrRefreshTimerRef.current);
            setError("Manager denied the request");
            return;
          }

          if (res.status === 410 || data.status === "EXPIRED") {
            setPollStatus("EXPIRED");
            if (qrRefreshTimerRef.current) clearInterval(qrRefreshTimerRef.current);
            return;
          }

          if (res.status === 429) {
            // Server asked us to slow down
            pollTimerRef.current = setTimeout(poll, SLOW_DOWN_MS);
            return;
          }

          // 202 — track status
          if (data.status) {
            setPollStatus(data.status);
            // When PENDING_BLE: stop QR refresh, but BLE is triggered by user button click
            if (data.status === "PENDING_BLE" && !bleStartedRef.current) {
              bleStartedRef.current = true;
              if (qrRefreshTimerRef.current) clearInterval(qrRefreshTimerRef.current);
            }
          }
          pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        } catch (err) {
          console.error("[QR-BLE] Poll error:", err);
          pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        }
      };

      poll();
    },
    [navigate]
  );

  // 🚀 Start QR-BLE session — calls /device-auth/qr-ble/start-session
  const handleStart = async () => {
    setPhase("loading");
    setError("");

    try {
      const res = await fetch(`${DEVICE_AUTH_BASE}/start-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ realm: REALM, clientId: CLIENT_ID }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}`);
      }

      const { sessionId, qrToken: token, deviceCode, codeVerifier, expiresIn: exp } = await res.json();

      sessionRef.current = { sessionId, deviceCode, codeVerifier };
      setQrToken(token);
      setExpiresIn(exp ?? 60);
      setTimeLeft(exp ?? 60);
      setPollStatus("PENDING_QR");
      setPhase("qr");

      startQrRefresh(sessionId);
      startPolling({ sessionId, deviceCode, codeVerifier });
    } catch (err) {
      console.error("[QR-BLE] Start session error:", err);
      setPhase("error");
      setError(err.message || t("bankQRPage.Connectionissue"));
    }
  };

  const isExpired = timeLeft === 0 || pollStatus === "EXPIRED";
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (phase === "error") {
    return (
      <main className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">
              {t("bankQRPage.Session.cancelled")}
            </CardTitle>
            <CardDescription>
              {t("bankQRPage.Session.cancelled_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert variant="destructive">
              <AlertTitle>{t("bankQRPage.Security.warning")}</AlertTitle>
              <AlertDescription>
                {error || t("bankQRPage.Session.window_switch_detected")}
              </AlertDescription>
            </Alert>
            <Button className="passkey-btn" onClick={() => navigate("/Emp-login")}>
              {t("bankQRPage.login.backbutton")}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!customerId) {
    return (
      <main className="relative flex justify-center items-center min-h-screen bg-muted/30 p-4">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
          <ModeToggle />
          <LanguageSwitcher />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <CardTitle>{t("bankQRPage.Session.error")}</CardTitle>
            <CardDescription>
              {t("bankQRPage.Session.error_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-36 w-full rounded-lg" />
            <div className="mt-3 flex justify-end">
              <Button className="passkey-btn" onClick={() => navigate("/")}>
                {t("bankQRPage.login.backbutton")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-muted/30 p-3">
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
        <ModeToggle />
        <LanguageSwitcher />
      </div>

      <div className="relative w-full max-w-sm">
        <div
          className="pointer-events-none absolute -inset-[1.5px] rounded-2xl bg-gradient-to-br from-blue-400/40 via-cyan-400/35 to-emerald-400/40 blur-sm z-0"
          aria-hidden="true"
        />
        <Card className="relative shadow-md border rounded-2xl z-10">
          <CardHeader className="pt-4 px-5 pb-2">
            <div className="w-full flex justify-center mb-2">
              <img
                src={logo}
                alt="CPX"
                className="w-16 sm:w-20 rounded-md shadow select-none"
                draggable={false}
              />
            </div>
            <div className="text-center">
              <CardTitle className="text-base sm:text-lg font-semibold">
                {t("bankQRPage.title")}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t("bankQRPage.subtitle")}
              </CardDescription>
            </div>
          </CardHeader>

          <Separator className="mx-5" />

          <CardContent className="flex flex-col items-center gap-3 py-4">

            {/* ── Idle: start button ── */}
            {phase === "idle" && (
              <Button onClick={handleStart} className="clear-btn w-full rounded-lg">
                {t("bankQRPage.title")}
              </Button>
            )}

            {/* ── Loading: starting QR-BLE session ── */}
            {phase === "loading" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t("bankQRPage.status")}…
                </p>
              </div>
            )}

            {/* ── QR: show code + timer ── */}
            {phase === "qr" && isExpired && (
              <div className="flex flex-col items-center gap-4 py-4 w-full">
                <p className="text-lg font-bold text-destructive">Session expired</p>
                <p className="text-sm text-muted-foreground text-center">
                  Return to login to start a new QR session
                </p>
                <Button
                  className="w-full bg-[#E11D48] hover:bg-[#be123c] text-white font-semibold rounded-lg"
                  onClick={() => navigate("/Emp-login")}
                >
                  Back to login
                </Button>
              </div>
            )}

            {phase === "qr" && !isExpired && (
              <>
                {/* ── QR code: only show while waiting to be scanned ── */}
                {pollStatus === "PENDING_QR" && (
                  <div className="w-[180px] sm:w-[200px]">
                    <AspectRatio ratio={1}>
                      <div className="p-1.5 rounded-lg bg-white shadow-sm h-full w-full flex items-center justify-center">
                        {qrToken ? (
                          <QRCodeSVG
                            value={qrToken}
                            size={192}
                            className="h-full w-full"
                          />
                        ) : (
                          <Skeleton className="h-full w-full rounded-md" />
                        )}
                      </div>
                    </AspectRatio>
                  </div>
                )}

                {/* ── Status label ── */}
                {pollStatus === "PENDING_QR" && (
                  <p className="text-sm font-semibold text-emerald-500">
                    Waiting for phone to scan QR...
                  </p>
                )}
                {pollStatus === "PENDING_BLE" && (
                  <div className="flex flex-col items-center gap-3">
                    <Bluetooth className="h-8 w-8 text-blue-500" />
                    <p className="text-sm font-semibold text-blue-500 text-center">
                      Waiting for BLE pairing...
                    </p>
                    <Button
                      className="passkey-btn w-full"
                      onClick={() => runBleFlow()}
                      disabled={bleLoading}
                    >
                      {bleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {bleLoading ? "Connecting via Bluetooth…" : "Connect via Bluetooth"}
                    </Button>
                    {error && (
                      <p className="text-xs text-destructive text-center">{error}</p>
                    )}
                  </div>
                )}
                {pollStatus === "PENDING_NFC_VERIFY" && (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-7 w-7 animate-spin text-purple-500" />
                    <p className="text-sm font-semibold text-purple-500 text-center">
                      Waiting for employee NFC tap + OTP...
                    </p>
                  </div>
                )}
                {pollStatus === "PENDING_APPROVAL" && (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-7 w-7 animate-spin text-yellow-500" />
                    <p className="text-sm font-semibold text-yellow-500 text-center">
                      Waiting for manager to approve...
                    </p>
                  </div>
                )}
                {pollStatus === "AUTHORIZED" && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <ShieldCheck className="h-10 w-10 text-emerald-500" />
                    <p className="text-sm font-semibold text-emerald-500 text-center">
                      Device authorized successfully!
                    </p>
                    {passkeyLink && (
                      <a
                        href={passkeyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button className="passkey-btn w-full">Open Passkey Link</Button>
                      </a>
                    )}
                  </div>
                )}
                {pollStatus === "DENIED" && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-semibold text-destructive text-center">
                      {error || "Manager denied the request"}
                    </p>
                  </div>
                )}

                <div className="w-full max-w-xs text-center">
                  <p className="text-xs mb-1">
                    {t("bankQRPage.expire_timer")} {minutes}:{seconds.toString().padStart(2, "0")}
                  </p>
                  <Progress
                    value={(timeLeft / expiresIn) * 100}
                    className="h-2 rounded-full"
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="w-full p-2 text-xs">
                    <AlertTitle className="text-sm">
                      {t("bankQRPage.Connectionissue")}
                    </AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </>
            )}

            <div className="w-full rounded-md border p-3 bg-background/60">
              <p className="font-medium mb-2 text-xs">
                {t("bankQRPage.login.guide_title")}
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex gap-1 items-start">
                  <ShieldCheck className="h-3 w-3 mt-0.5 text-emerald-600 shrink-0" />
                  <span>{t("bankQRPage.login.subtitle_1")}</span>
                </li>
                <li className="flex gap-1 items-start">
                  <ShieldCheck className="h-3 w-3 mt-0.5 text-emerald-600 shrink-0" />
                  <span>{t("bankQRPage.login.Condition")}</span>
                </li>
              </ul>
            </div>

            <div className="flex w-full justify-end">
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                {t("bankQRPage.login.backbutton")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default QrPage;