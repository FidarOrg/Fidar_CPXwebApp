import toast from "react-hot-toast";
import { ErrorCode, isFidarException } from "fidar-web-sdk";

export function handleSecurityError(err, options) {
  // 1️⃣ Must be a Fidar exception
  if (!isFidarException(err)) return false;

  // 2️⃣ Defensive access (JS-safe)
  const code = err?.error?.code;
  if (code !== ErrorCode.SECURITY) return false;

  const reasons = err?.error?.meta?.reasons ?? [];

  // 3️⃣ User-facing toast
  toast.error(
    reasons.includes("VPN detected") ||
    reasons.includes("ANONYMOUS detected")
      ? "VPN or anonymous network detected. Please disable it and try again."
      : "Access blocked due to network security risk.",
    { duration: 6000 }
  );

  // 4️⃣ Cleanup
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {}

  // 5️⃣ Delay destructive actions (CRITICAL)
  setTimeout(() => {
    options?.onBlocked?.();
    options?.redirect?.("/Emp-login");
  }, 250);

  return true; // ✅ handled
}
