import { fidar } from "@/lib/fidar";

/**
 * Must match backend base
 * backend uses: /iam/api/...
 */
const API_BASE = "https://sdk.fidar.io";
const API_IAM = "https://app.fidar.io";


/* ---------------------------------
   INITIATE TRANSACTION SIGN
   POST /iam/api/transactions/sign/initiate
---------------------------------- */
export async function initiateSign(payload) {
  const res = await fetch(
    `${API_BASE}/fidar/sdk/api/transaction/signature/initiate`,
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
    `${API_BASE}/fidar/sdk/api/transaction/signature/complete`,
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
        assertionJson: typeof assertionJson === "string" ? assertionJson : JSON.stringify(assertionJson),
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

/* ---------------------------------
   CRITICAL TASK — PHASE 1 (INITIATE)
   POST /iam/transactions/critical_task
   Returns: { sessionId, ... }
---------------------------------- */
export async function initiateCriticalTask({ taskType, taskDescription, targetResourceId, targetResourceType, deviceId }) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(
    `${API_IAM}/iam/transactions/critical_task`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ taskType, taskDescription, targetResourceId, targetResourceType, deviceId }),
    }
  );

  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw { code: "SERVER_ERROR", message: "Failed to parse critical task initiate response", meta: { original: String(err) } };
  }

  if (!res.ok) {
    throw { code: "CRITICAL_TASK_INITIATE_FAILED", message: json?.message || "Critical task initiation failed", meta: json };
  }

  return json; // contains sessionId
}

/* ---------------------------------
   CRITICAL TASK — POLL APPROVAL STATUS
   GET /iam/api/approval/status/<sessionId>
   Returns: { status: "PENDING" | "APPROVED" | "REJECTED" }
---------------------------------- */
export async function getApprovalStatus(sessionId) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(
    `${API_IAM}/iam/api/approval/status/${encodeURIComponent(sessionId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw { code: "SERVER_ERROR", message: "Failed to parse approval status response", meta: { original: String(err) } };
  }

  if (!res.ok) {
    throw { code: "APPROVAL_STATUS_FAILED", message: json?.message || "Failed to fetch approval status", meta: json };
  }

  return json;
}

/* ---------------------------------
   CRITICAL TASK — PHASE 2 (COMPLETE)
   POST /iam/transactions/critical_task  (+ sessionId)
   Returns: { status: "CRITICAL_TASK_EXECUTED", ... }  →  201 Created
---------------------------------- */
export async function completeCriticalTask({ taskType, taskDescription, targetResourceId, targetResourceType, deviceId, sessionId }) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(
    `${API_IAM}/iam/transactions/critical_task`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ taskType, taskDescription, targetResourceId, targetResourceType, deviceId, sessionId }),
    }
  );

  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw { code: "SERVER_ERROR", message: "Failed to parse critical task complete response", meta: { original: String(err) } };
  }

  if (res.status !== 201 && !res.ok) {
    throw { code: "CRITICAL_TASK_COMPLETE_FAILED", message: json?.message || "Critical task completion failed", meta: json };
  }

  return json; // { status: "CRITICAL_TASK_EXECUTED", ... }
}
