import { fidar } from "@/lib/fidar";
import { initiateSign, completeSignature } from "@/api/transaction";

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

async function approveWithFidarPasskey(task) {
  // const profile = await fidar.getMyProfile();
  // const userId = getFidarUserId(profile);
  const userId = "3433c3c3-1a69-4feb-a6f0-64dccf466ca9";

  if (!userId) {
    throw new Error("Unable to resolve the FIDAR user identity for signing.");
  }

  // const { txnId:txnId: signed?.initResult.txnId, challenge } = await initiateSign({
  //   userId,
  //   amount: task.signing?.amount ?? 1,
  //   currency: task.signing?.currency ?? "INR",
  //   toAccount: task.signing?.toAccount ?? `TASK-${task.id}`,
  //   remark: task.signing?.remark ?? `Approve task: ${task.title}`,
  // });

  // signChallenge returns { assertion: object, initResult: T } or null
  const signed = await fidar.signChallenge(
    "transfer",
    () => initiateSign({
      userId,
      amount: task.signing?.amount ?? 1,
      currency: task.signing?.currency ?? "INR",
      toAccount: task.signing?.toAccount ?? `TASK-${task.id}`,
      remark: task.signing?.remark ?? `Approve task: ${task.title}`
    })
  );

  if (!signed) {
    throw new Error("User cancelled the signing process.");
  }

  const txnId = signed.initResult?.txnId;

  const result = await completeSignature({
    txnId,
    realm: "FIDAR_WEBAUTH_V2",
    userId,
    assertionJson: signed.assertion, // only the WebAuthn assertion, not the full wrapper
  });

  if (result?.status === "FAILED" || result?.success === false) {
    throw new Error(result?.message || "Signature verification failed");
  }

  return {
    method: "fidar-passkey",
    verifier: userId,
    txnId,
    signedAt: new Date().toISOString(),
    approved: true
  };
}

export async function signTaskApproval(task) {
  return approveWithFidarPasskey(task);
}