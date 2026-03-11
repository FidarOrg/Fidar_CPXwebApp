import { fidar } from "@/lib/fidar";
import { startAuthentication } from "@/lib/webauthn";
import { initiateSign } from "@/api/transaction";

async function getSessionProfile() {
  const res = await fetch("/api/me", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to read session profile" }));
    throw new Error(error.error || "Failed to read session profile");
  }

  return res.json();
}

function getFidarUserId(profile) {
  return (
    profile?.["user-id"] ||
    profile?.userId ||
    profile?.email ||
    profile?.username ||
    profile?.id ||
    null
  );
}

async function approveWithLocalPasskey(task) {
  const profile = await getSessionProfile();
  const email = profile?.email || profile?.id;

  if (!email) {
    throw new Error("No authenticated session found for passkey approval.");
  }

  const assertion = await startAuthentication(email);
  const verifyRes = await fetch("/webauthn/login/verify", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...assertion, email }),
  });

  const result = await verifyRes.json().catch(() => ({}));
  if (!verifyRes.ok || !result.verified) {
    throw new Error(result.error || `Passkey approval failed for task "${task.title}".`);
  }

  return {
    method: "local-passkey",
    verifier: email,
    signedAt: new Date().toISOString(),
    assertionId: assertion.id,
  };
}

async function approveWithFidarPasskey(task) {
  const profile = await fidar.getMyProfile();
  const userId = getFidarUserId(profile);

  if (!userId) {
    throw new Error("Unable to resolve the FIDAR user identity for signing.");
  }

  const { txnId, challenge } = await initiateSign({
    userId,
    amount: task.signing?.amount ?? 1,
    currency: task.signing?.currency ?? "INR",
    toAccount: task.signing?.toAccount ?? `TASK-${task.id}`,
    remark: task.signing?.remark ?? `Approve task: ${task.title}`,
  });

  const assertion = await fidar.signChallenge(challenge);

  return {
    method: "fidar-passkey",
    verifier: userId,
    txnId,
    signedAt: new Date().toISOString(),
    assertionId: assertion.id,
  };
}

export async function signTaskApproval(task) {
  const authToken = localStorage.getItem("authToken");
  const hasFidarSession =
    !!authToken && authToken !== "saml-session" && authToken !== "passkey-session";

  if (hasFidarSession) {
    return approveWithFidarPasskey(task);
  }

  return approveWithLocalPasskey(task);
}
