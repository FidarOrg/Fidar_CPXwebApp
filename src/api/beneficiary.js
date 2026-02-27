import { fidar } from "@/lib/fidar";

const API_BASE = "https://app.fidar.io";

/* ---------------------------------
   INITIATE BENEFICIARY SIGN
---------------------------------- */
export async function initiateBeneficiarySign(payload) {
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
      }),
    }
  );

  const json = await res.json();

  if (!json || !json.txnId || !json.challenge) {
    throw {
      code: "INVALID_REQUEST",
      message: "Invalid initiate beneficiary sign response",
      meta: { response: json },
    };
  }

  return {
    txnId: String(json.txnId),
    challenge: String(json.challenge),
  };
}

/* ---------------------------------
   ADD BENEFICIARY (SIGNED)
---------------------------------- */
export async function addBeneficiary(payload) {
  const res = await fetch(`${API_BASE}/iam/beneficiaries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${fidar.getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw {
      code: "SERVER_ERROR",
      message: "Failed to parse add-beneficiary response",
      meta: { original: String(err), payload },
    };
  }

  if (!res.ok) {
    throw {
      code: "ADD_BENEFICIARY_FAILED",
      message: json?.message || "Failed to add beneficiary",
      meta: json,
    };
  }

  return json;
}
