import { fidar } from "@/lib/fidar";
import { initiateSign } from "@/api/transaction";

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
  const approved =
    assertion === true ||
    assertion?.verified === true ||
    assertion?.assertion === true ||
    Boolean(assertion);

  return {
    method: "fidar-passkey",
    verifier: userId,
    txnId,
    signedAt: new Date().toISOString(),
    assertion,
    assertionId: assertion?.id ?? null,
    approved,
  };
}

export async function signTaskApproval(task) {
  return approveWithFidarPasskey(task);
}