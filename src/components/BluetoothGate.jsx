import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Bluetooth, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { fidar } from "@/lib/fidar";
import { ErrorCode } from "fidar-web-sdk";
import { handleSecurityError } from "@/lib/handleSecurityError";
import { useNavigate } from "react-router-dom";

export default function BluetoothGate({ onReady }) {
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [bluetoothAvailable, setBluetoothAvailable] = useState(null);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const navigate = useNavigate();

  /* ---------- Detect Bluetooth ON / OFF ---------- */

  useEffect(() => {
    if (!navigator.bluetooth || !navigator.bluetooth.getAvailability) {
      setUnsupported(true);
      return;
    }

    navigator.bluetooth.getAvailability()
      .then(setBluetoothAvailable)
      .catch(() => setUnsupported(true));
  }, []);

  /* ---------- Main Action ---------- */

  const handleAction = async () => {
    setBlocked(false);
    setUnsupported(false);
    setLoading(true);

    // Browser support
    if (!navigator.bluetooth) {
      setUnsupported(true);
      toast.error("This browser does not support Bluetooth.");
      setLoading(false);
      return;
    }

    // Bluetooth OFF
    if (bluetoothAvailable === false) {
      toast.error("Bluetooth is OFF. Please enable Bluetooth and try again.");
      setLoading(false);
      return;
    }

    try {
      /**
       * 🔐 FULL BLE FLOW (SDK)
       * - starts BLE session
       * - pairs with Android
       * - polls backend
       * - stores BLE session for QR
       *
       * We intercept navigator.bluetooth.requestDevice to capture
       * the selected device name before the SDK consumes it.
       */
      let capturedDeviceName = null;
      const originalRequestDevice = navigator.bluetooth.requestDevice.bind(navigator.bluetooth);
      navigator.bluetooth.requestDevice = async (options) => {
        const device = await originalRequestDevice(options);
        capturedDeviceName = device.name || null;
        return device;
      };

      try {
        await fidar.startBluetoothProximity();
      } finally {
        navigator.bluetooth.requestDevice = originalRequestDevice;
      }

      const displayName = capturedDeviceName || "your primary device";
      setConnectedDevice(displayName);
      toast.success(`Connected to ${displayName}`);
      onReady(); // ✅ QR flow unlocked

    } catch (err) {
      console.error("Bluetooth proximity error:", err);

      // 🔐 IP RISK / VPN BLOCK
      if (
        handleSecurityError(err, {
          redirect: navigate,
        })
      ) {
        return;
      }

      // ⛔ Existing Bluetooth errors
      if (err?.error?.code === ErrorCode.UNSUPPORTED) {
        setUnsupported(true);
        toast.error("Web Bluetooth is not supported in this browser.");
        return;
      }

      if (err?.name === "NotAllowedError" || err?.name === "SecurityError") {
        setBlocked(true);
        toast.error(
          "Bluetooth permission is blocked. Allow it in browser settings and reload.",
          { duration: 6000 }
        );
        return;
      }

      if (err?.name === "NotFoundError") {
        toast.error("No primary device found. Please open the app on your phone.");
        return;
      }

      if (err?.error?.code === ErrorCode.EXPIRED) {
        toast.error("Bluetooth approval timed out. Please try again.");
        return;
      }

      toast.error("Unable to verify your primary device.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI Copy ---------- */

  let title = "Checking Bluetooth…";
  let description = "Please wait while we check Bluetooth availability.";
  let buttonLabel = "Checking…";

  if (unsupported) {
    title = "Bluetooth Unavailable";
    description = "This browser does not allow secure Bluetooth pairing.";
  } else if (blocked) {
    title = "Bluetooth Blocked";
    description = "Bluetooth access is blocked for this site.";
  } else if (bluetoothAvailable === false) {
    title = "Bluetooth is Off";
    description = "Turn ON Bluetooth on your device to continue.";
    buttonLabel = "Enable Bluetooth";
  } else if (bluetoothAvailable === true) {
    title = "Verify Primary Device";
    description =
      "Open the app on your primary Android device and approve this login.";
    buttonLabel = "Verify Primary Device";
  }

  /* ---------- Render ---------- */

  return (
    <div className="flex flex-col gap-4 items-center text-center px-4 py-6">

      {(blocked || unsupported) ? (
        <ShieldAlert className="h-10 w-10 text-red-600" />
      ) : (
        <Bluetooth className="h-10 w-10 text-blue-600" />
      )}

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="text-sm text-muted-foreground max-w-xs">
        {description}
      </p>

      {connectedDevice && (
        <p className="text-sm font-medium text-green-500">
          Connected to: <span className="font-bold">{connectedDevice}</span>
        </p>
      )}

      {!unsupported && !blocked && (
        <Button className="passkey-btn" onClick={handleAction} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {buttonLabel}
        </Button>
      )}

      {blocked && (
        <p className="text-xs text-muted-foreground max-w-xs">
          Open browser settings → Privacy & Security → Bluetooth → Allow,
          then reload this page.
        </p>
      )}

      {unsupported && (
        <p className="text-xs text-muted-foreground max-w-xs">
          Please open this page in
          <span className="font-semibold"> Google Chrome </span>
          or
          <span className="font-semibold"> Microsoft Edge</span>.
        </p>
      )}
    </div>
  );
}
