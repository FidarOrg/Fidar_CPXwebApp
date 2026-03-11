/**
 * In-memory Data Store for WebAuthn Credentials
 * -----------------------------------------------
 * Production replacement: swap Maps for DB queries (SQLite/PostgreSQL)
 *
 * Structures:
 *   users:             userId → { nameID, email, credentials: [credentialId, ...] }
 *   credentials:       credentialId → AuthenticatorDevice
 *   currentChallenges: userId → base64url challenge string
 */

/** @type {Map<string, { nameID: string, email: string, credentials: string[] }>} */
const users = new Map();

/**
 * @type {Map<string, {
 *   credentialID: string,
 *   credentialPublicKey: Uint8Array,
 *   counter: number,
 *   transports: string[],
 *   userId: string
 * }>}
 */
const credentials = new Map();

/** @type {Map<string, string>} */
const currentChallenges = new Map();

// ── User helpers ─────────────────────────────────────────────────────────────

function getUser(userId) {
  return users.get(userId) || null;
}

function getOrCreateUser(userId, nameID, email) {
  if (!users.has(userId)) {
    users.set(userId, { nameID, email, credentials: [] });
  }
  return users.get(userId);
}

function getUserCredentials(userId) {
  const user = users.get(userId);
  if (!user) return [];
  return user.credentials.map((id) => credentials.get(id)).filter(Boolean);
}

// ── Credential helpers ───────────────────────────────────────────────────────

function saveCredential(userId, credentialData) {
  const { credentialID } = credentialData;
  credentials.set(credentialID, { ...credentialData, userId });
  const user = users.get(userId);
  if (user && !user.credentials.includes(credentialID)) {
    user.credentials.push(credentialID);
  }
}

function getCredentialById(credentialID) {
  return credentials.get(credentialID) || null;
}

function updateCredentialCounter(credentialID, newCounter) {
  const cred = credentials.get(credentialID);
  if (cred) {
    cred.counter = newCounter;
    credentials.set(credentialID, cred);
  }
}

// ── Challenge helpers ────────────────────────────────────────────────────────

function setChallenge(userId, challenge) {
  currentChallenges.set(userId, challenge);
}

function getChallenge(userId) {
  return currentChallenges.get(userId) || null;
}

function clearChallenge(userId) {
  currentChallenges.delete(userId);
}

module.exports = {
  getUser,
  getOrCreateUser,
  getUserCredentials,
  saveCredential,
  getCredentialById,
  updateCredentialCounter,
  setChallenge,
  getChallenge,
  clearChallenge,
};
