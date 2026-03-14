/**
 * Browser-side WebAuthn Helpers
 * ------------------------------
 * Provides typed wrappers around navigator.credentials.create() and
 * navigator.credentials.get(), handling the base64url ↔ ArrayBuffer
 * encoding that the WebAuthn API requires.
 *
 * Usage:
 *   import { startRegistration, startAuthentication } from '@/lib/webauthn';
 */

// ── Encoding helpers ──────────────────────────────────────────────────────────

/**
 * Converts a base64url string to a Uint8Array (ArrayBuffer)
 * @param {string} base64url
 * @returns {Uint8Array}
 */
export function base64urlToBuffer(base64url) {
    const base64 = base64url.replaceAll('-', '+').replaceAll('_', '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (const [i, char] of [...binary].entries()) {
        bytes[i] = char.codePointAt(0);
    }
    return bytes;
}

/**
 * Converts an ArrayBuffer or Uint8Array to a base64url string
 * @param {ArrayBuffer|Uint8Array} buffer
 * @returns {string}
 */
export function bufferToBase64url(buffer) {
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCodePoint(byte);
    }
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

// ── Registration ──────────────────────────────────────────────────────────────

/**
 * Run the full passkey registration ceremony.
 * 1. Fetches PublicKeyCredentialCreationOptions from the server
 * 2. Calls navigator.credentials.create()
 * 3. Serializes the response for the server
 *
 * @returns {Promise<{ attResp: object, rawCredential: PublicKeyCredential }>}
 * @throws  Will throw if the server returns an error or the user cancels
 */
export async function startRegistration() {
    // 1. Get options from server
    const optRes = await fetch('/webauthn/register/options', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });

    if (!optRes.ok) {
        const err = await optRes.json().catch(() => ({ error: optRes.statusText }));
        throw new Error(err.error || 'Failed to get registration options');
    }

    const options = await optRes.json();

    // 2. Decode base64url fields to ArrayBuffer
    const publicKeyOptions = {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        user: {
            ...options.user,
            id: base64urlToBuffer(options.user.id),
        },
        excludeCredentials: (options.excludeCredentials || []).map((c) => ({
            ...c,
            id: base64urlToBuffer(c.id),
        })),
    };

    // 3. Call the browser WebAuthn API
    const credential = await navigator.credentials.create({ publicKey: publicKeyOptions });
    if (!credential) throw new Error('navigator.credentials.create() returned null');

    // 4. Serialize for the server
    const attResp = {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
            attestationObject: bufferToBase64url(credential.response.attestationObject),
            clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
            transports: credential.response.getTransports?.() || [],
        },
        clientExtensionResults: credential.getClientExtensionResults?.() || {},
    };

    return { attResp, rawCredential: credential };
}

// ── Authentication ────────────────────────────────────────────────────────────

/**
 * Run the full passkey authentication ceremony.
 * 1. Fetches PublicKeyCredentialRequestOptions from the server
 * 2. Calls navigator.credentials.get()
 * 3. Serializes the assertion for the server
 *
 * @param {string} email - User email to look up credentials
 * @returns {Promise<object>} serialized assertion response
 * @throws  Will throw if the server returns an error or the user cancels
 */
export async function startAuthentication(email) {
    // 1. Get options from server
    const optRes = await fetch('/webauthn/login/options', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    if (!optRes.ok) {
        const err = await optRes.json().catch(() => ({ error: optRes.statusText }));
        throw new Error(err.error || 'Failed to get authentication options');
    }

    const options = await optRes.json();

    // 2. Decode base64url fields
    const publicKeyOptions = {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        allowCredentials: (options.allowCredentials || []).map((c) => ({
            ...c,
            id: base64urlToBuffer(c.id),
        })),
    };

    // 3. Call the browser WebAuthn API
    const assertion = await navigator.credentials.get({ publicKey: publicKeyOptions });
    if (!assertion) throw new Error('navigator.credentials.get() returned null');

    // 4. Serialize for the server
    return {
        id: assertion.id,
        rawId: bufferToBase64url(assertion.rawId),
        type: assertion.type,
        response: {
            authenticatorData: bufferToBase64url(assertion.response.authenticatorData),
            clientDataJSON: bufferToBase64url(assertion.response.clientDataJSON),
            signature: bufferToBase64url(assertion.response.signature),
            userHandle: assertion.response.userHandle
                ? bufferToBase64url(assertion.response.userHandle)
                : null,
        },
        clientExtensionResults: assertion.getClientExtensionResults?.() || {},
    };
}
