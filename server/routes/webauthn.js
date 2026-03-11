/**
 * WebAuthn Routes — Registration & Authentication
 * -----------------------------------------------
 * Uses @simplewebauthn/server for all RP-side operations.
 *
 * Registration:
 *   POST /webauthn/register/options  → generate PublicKeyCredentialCreationOptions
 *   POST /webauthn/register/verify   → verify attestation + store credential
 *
 * Authentication:
 *   POST /webauthn/login/options     → generate PublicKeyCredentialRequestOptions
 *   POST /webauthn/login/verify      → verify assertion + create session
 */

const express = require('express');
const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const store = require('../db/store');
const router = express.Router();

// ── RP identity ───────────────────────────────────────────────────────────────
const RP_NAME = 'CPX Employee Portal';
const RP_ID = 'localhost';
const RP_ORIGIN = 'http://localhost:5173'; // Vite dev server origin

// ── Auth guard middleware ─────────────────────────────────────────────────────
function requireSession(req, res, next) {
    if (!req.session?.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// ═══════════════════════════════════════════════════════════════════════════
//  REGISTRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /webauthn/register/options
 * Generates PublicKeyCredentialCreationOptions for the authenticated user.
 * Requires an active SAML session.
 */
router.post('/register/options', requireSession, async (req, res) => {
    try {
        const { id: userId, email } = req.session.user;

        // Get existing credentials so we can exclude them (prevent re-registration)
        const userCredentials = store.getUserCredentials(userId);
        const excludeCredentials = userCredentials.map((cred) => ({
            id: Buffer.from(cred.credentialID, 'base64url'),
            type: 'public-key',
            transports: cred.transports || [],
        }));

        const options = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: RP_ID,
            userID: Buffer.from(userId),
            userName: email,
            userDisplayName: email,
            timeout: 60000,
            attestationType: 'none',
            excludeCredentials,
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'platform', // prefer built-in authenticator
            },
            supportedAlgorithmIDs: [-7, -257], // ES256, RS256
        });

        // Store challenge server-side (tied to user session)
        store.setChallenge(userId, options.challenge);

        res.json(options);
    } catch (err) {
        console.error('❌ /webauthn/register/options error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /webauthn/register/verify
 * Verifies the attestation response from navigator.credentials.create()
 * and stores the new credential.
 */
router.post('/register/verify', requireSession, async (req, res) => {
    try {
        const { id: userId } = req.session.user;
        const body = req.body;

        const expectedChallenge = store.getChallenge(userId);
        if (!expectedChallenge) {
            return res.status(400).json({ error: 'No challenge found. Start registration first.' });
        }

        const verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: RP_ORIGIN,
            expectedRPID: RP_ID,
            requireUserVerification: false,
        });

        const { verified, registrationInfo } = verification;

        if (verified && registrationInfo) {
            const {
                credentialID,
                credentialPublicKey,
                counter,
                credentialDeviceType,
                credentialBackedUp,
            } = registrationInfo;

            store.saveCredential(userId, {
                credentialID: Buffer.from(credentialID).toString('base64url'),
                credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64'),
                counter,
                transports: body.response?.transports || [],
                deviceType: credentialDeviceType,
                backedUp: credentialBackedUp,
            });

            // Challenge used — clear it
            store.clearChallenge(userId);

            console.log(`✅ Passkey registered for user: ${req.session.user.email}`);
            res.json({ verified: true });
        } else {
            res.status(400).json({ verified: false, error: 'Verification failed' });
        }
    } catch (err) {
        console.error('❌ /webauthn/register/verify error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
//  AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /webauthn/login/options
 * Generates PublicKeyCredentialRequestOptions.
 * Body: { email } — used to look up existing credentials.
 */
router.post('/login/options', async (req, res) => {
    try {
        const { email } = req.body;

        // Look up user by email (email == userId in our store)
        const userId = email;
        const userCredentials = store.getUserCredentials(userId);

        const allowCredentials = userCredentials.map((cred) => ({
            id: Buffer.from(cred.credentialID, 'base64url'),
            type: 'public-key',
            transports: cred.transports || [],
        }));

        const options = await generateAuthenticationOptions({
            rpID: RP_ID,
            timeout: 60000,
            allowCredentials,
            userVerification: 'preferred',
        });

        // Store challenge keyed by email (userId)  — session may not exist yet
        store.setChallenge(userId, options.challenge);
        // Also stash email in session so verify route can look it up
        req.session.passkeyLoginUserId = userId;

        res.json(options);
    } catch (err) {
        console.error('❌ /webauthn/login/options error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /webauthn/login/verify
 * Verifies the assertion from navigator.credentials.get().
 * On success, creates a session (same shape as SAML login).
 */
router.post('/login/verify', async (req, res) => {
    try {
        const body = req.body;
        const userId = req.session?.passkeyLoginUserId;

        if (!userId) {
            return res.status(400).json({ error: 'No login attempt in progress.' });
        }

        const expectedChallenge = store.getChallenge(userId);
        if (!expectedChallenge) {
            return res.status(400).json({ error: 'Challenge expired or missing.' });
        }

        // Find the matching credential
        const credentialId = body.id;
        const credential = store.getCredentialById(credentialId);
        if (!credential) {
            return res.status(400).json({ error: 'Credential not found.' });
        }

        const verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: RP_ORIGIN,
            expectedRPID: RP_ID,
            authenticator: {
                credentialID: Buffer.from(credential.credentialID, 'base64url'),
                credentialPublicKey: Buffer.from(credential.credentialPublicKey, 'base64'),
                counter: credential.counter,
                transports: credential.transports,
            },
            requireUserVerification: false,
        });

        const { verified, authenticationInfo } = verification;

        if (verified) {
            // Update counter to prevent replay attacks
            store.updateCredentialCounter(credentialId, authenticationInfo.newCounter);
            store.clearChallenge(userId);

            const user = store.getUser(userId);

            // Establish session
            req.session.user = {
                id: userId,
                nameID: user?.nameID || userId,
                email: user?.email || userId,
                loginMethod: 'passkey',
            };

            console.log(`✅ Passkey login verified for: ${userId}`);
            res.json({ verified: true, email: userId });
        } else {
            res.status(400).json({ verified: false, error: 'Verification failed' });
        }
    } catch (err) {
        console.error('❌ /webauthn/login/verify error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
