import { fidar } from "@/lib/fidar";

/**
 * Must match backend base
 * backend uses: /iam/api/...
 */
const API_BASE = "https://app.fidar.io";

/* ---------------------------------
   INITIATE TRANSACTION SIGN
   POST /iam/api/transactions/sign/initiate
---------------------------------- */
export async function initiateSign(payload) {
  const res = await fetch(
    `${API_BASE}/iam/api/transactions/sign/initiate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${fidar.getToken()}`,
      },
      body: JSON.stringify({
        userId: payload.userId,
        amount: payload.amount,
        currency: payload.currency || "USD",
        toAccount: payload.toAccount,
        remark: payload.remark,
      }),
    }
  );

  const json = await res.json();

  // Match backend validation strictly
  if (!json || json.txnId == null || json.challenge == null) {
    throw {
      code: "INVALID_REQUEST",
      message: "Invalid response from initiate sign",
      meta: { response: json },
    };
  }

  return {
    txnId: String(json.txnId),
    challenge: String(json.challenge),
  };
}

/* ---------------------------------
   COMPLETE SIGNATURE
   POST /iam/api/transactions/signature/complete
---------------------------------- */
export async function completeSignature({ txnId, realm, userId, assertionJson }) {
  const res = await fetch(
    `${API_BASE}/iam/api/transactions/sign/complete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${fidar.getToken()}`,
      },
      body: JSON.stringify({
        txnId,
        realm,
        userId,
        assertionJson,
      }),
    }
  );

  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw {
      code: "SERVER_ERROR",
      message: "Failed to parse completeSignature response",
      meta: { original: String(err) },
    };
  }

  if (!res.ok) {
    throw {
      code: "COMPLETE_SIGNATURE_FAILED",
      message: json?.message || "Signature completion failed",
      meta: json,
    };
  }

  return json;
}

/* ---------------------------------
   TRANSFER (SIGNED)
   POST /iam/transactions/transfer
---------------------------------- */
export async function transfer(payload) {
  const res = await fetch(
    `${API_BASE}/iam/transactions/transfer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${fidar.getToken()}`,
      },
      body: JSON.stringify(payload),
    }
  );

  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw {
      code: "SERVER_ERROR",
      message: "Failed to parse transfer response",
      meta: { original: String(err), payload },
    };
  }

  if (!res.ok) {
    throw {
      code: "TRANSFER_FAILED",
      message: json?.message || "Transfer request failed",
      meta: json,
    };
  }

  return json;
}
