/**
 * Auth Routes: SAML SSO + Server-Rendered Dashboard
 * ---------------------------------------------------
 * Mirrors the sample app pattern exactly:
 *   - GET  /login           → passport.authenticate('saml') → PingOne
 *   - POST /login/callback  → verify assertion → session → redirect /dashboard
 *   - GET  /dashboard       → server-rendered HTML with passkey UI
 *   - GET  /api/me          → JSON for React frontend (optional)
 *   - GET  /logout          → destroy session → redirect /
 *
 * After SAML login the user stays on the Express server (port 3000),
 * not redirected back to the React app. This matches the sample app architecture.
 */

const express = require('express');
const passport = require('passport');
const store = require('../db/store');
const router = express.Router();

// ── Home (if accessed directly via Express) ───────────────────────────────────
router.get('/', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/dashboard');
    res.redirect('http://localhost:5173');
});

// ── Step 1: Send user to PingOne via SAML ─────────────────────────────────────
router.get('/login', (req, res, next) => {
    if (req.isAuthenticated()) return res.redirect('/dashboard');
    passport.authenticate('saml', {
        additionalParams: { RelayState: '/dashboard' },
    })(req, res, next);
});

// ── Step 2: PingOne posts SAML assertion here ──────────────────────────────────
router.post('/login/callback',
    (req, res, next) => {
        passport.authenticate('saml', (err, user, info) => {
            if (err) { console.error('❌ SAML error:', err); return res.redirect('http://localhost:5173/?saml_error=1'); }
            if (!user) { console.error('❌ No user:', info); return res.redirect('http://localhost:5173/?saml_error=1'); }

            req.logIn(user, (loginErr) => {
                if (loginErr) { console.error('❌ Session error:', loginErr); return res.redirect('http://localhost:5173/'); }

                // Save user in our in-memory store
                store.getOrCreateUser(user.nameID, user.nameID, user.nameID);
                req.session.user = { id: user.nameID, nameID: user.nameID, email: user.nameID };
                console.log('✅ SAML session created for:', user.nameID);

                // Redirect back to the React app dashboard, passing email in URL
                const email = encodeURIComponent(user.nameID);
                res.redirect(`http://localhost:5173/saml-dashboard?saml_email=${email}`);
            });
        })(req, res, next);
    }
);

// ── Step 3: Express-served dashboard with passkey UI ─────────────────────────
router.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/login');

    const user = req.user;
    const userId = user.nameID;
    const userCreds = store.getUserCredentials(userId);
    const hasPasskey = userCreds.length > 0;

    const idpLabel = (userId || '').endsWith('@fidar.io')
        ? '🔐 Authenticated via Keycloak → PingOne'
        : '🔐 Authenticated via PingOne';

    // ── Passkey section HTML ───────────────────────────────────────────────────
    const passkeySection = hasPasskey
        ? `<div class="card passkey-ok">
        <span>✅ Passkey registered — next time you can sign in with biometrics.</span>
        <span class="badge-ok">FIDO2 Active</span>
       </div>`
        : `<div class="card passkey-prompt" id="passkeyPrompt">
        <div class="passkey-icon">🗝️</div>
        <div class="passkey-text">
          <strong>Register a Passkey</strong>
          <p>Sign in faster next time using Face ID, Touch ID, or your device PIN.</p>
        </div>
        <button id="registerPasskeyBtn" class="btn-passkey">Register Passkey</button>
        <span id="passkeyStatus" class="passkey-status"></span>
       </div>`;

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Dashboard — MyCPX</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;background:#f3f4f6;min-height:100vh}
    header{background:#4f46e5;color:#fff;padding:18px 40px;display:flex;justify-content:space-between;align-items:center}
    header h1{font-size:20px}
    .logout{background:#ef4444;color:#fff;padding:9px 18px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px}
    .logout:hover{background:#dc2626}
    .wrap{padding:36px 40px;max-width:1100px;margin:auto}
    .card{background:#fff;padding:24px 28px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.08);margin-bottom:24px}
    .idp-badge{display:inline-block;background:#ede9fe;color:#5b21b6;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:bold}
    /* Passkey banner */
    .passkey-prompt{border:2px solid #818cf8;background:linear-gradient(135deg,#eef2ff,#f5f3ff);display:flex;align-items:center;gap:18px;flex-wrap:wrap}
    .passkey-ok{border:2px solid #86efac;background:#f0fdf4;display:flex;align-items:center;justify-content:space-between;gap:12px;color:#166534;font-weight:600}
    .badge-ok{background:#dcfce7;color:#166534;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:bold}
    .passkey-icon{font-size:32px}
    .passkey-text p{font-size:13px;color:#6b7280;margin-top:4px}
    .btn-passkey{margin-left:auto;background:#4f46e5;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-weight:bold;font-size:14px;cursor:pointer;transition:background .2s}
    .btn-passkey:hover{background:#4338ca}
    .btn-passkey:disabled{background:#a5b4fc;cursor:not-allowed}
    .passkey-status{font-size:13px;font-weight:600;margin-left:8px}
    .passkey-status.success{color:#16a34a}
    .passkey-status.error{color:#dc2626}
    /* Table */
    table{width:100%;border-collapse:collapse;margin-top:12px}
    th{background:#4f46e5;color:#fff;padding:11px 14px;text-align:left;font-size:14px}
    td{padding:11px 14px;font-size:14px;border-bottom:1px solid #f3f4f6}
    tr:hover td{background:#eef2ff}
    pre{background:#0f172a;color:#4ade80;padding:20px;border-radius:8px;overflow-x:auto;font-size:13px;line-height:1.6}
    h2{font-size:17px;margin-bottom:4px;color:#1f2937}
  </style>
</head>
<body>
  <header>
    <h1>MyCPX Dashboard</h1>
    <a href="/logout" class="logout">Logout</a>
  </header>
  <div class="wrap">

    <!-- User info -->
    <div class="card">
      <p style="font-size:17px;margin-bottom:8px">Welcome, <strong>${user.nameID}</strong></p>
      <span class="idp-badge">${idpLabel}</span>
    </div>

    <!-- Passkey section -->
    ${passkeySection}

    <!-- Employee directory -->
    <div class="card">
      <h2>Employee Directory</h2>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Dept</th><th>Email</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>101</td><td>Aamir Khan</td><td>Software Engineer</td><td>IT</td><td>aamir@cpx.com</td><td><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold">Active</span></td></tr>
          <tr><td>102</td><td>Sara Ali</td><td>HR Manager</td><td>HR</td><td>sara@cpx.com</td><td><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold">Active</span></td></tr>
          <tr><td>103</td><td>Rahul Verma</td><td>DevOps Engineer</td><td>Infrastructure</td><td>rahul@cpx.com</td><td><span style="background:#fef3c7;color:#92400e;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold">On Leave</span></td></tr>
          <tr><td>104</td><td>Fatima Noor</td><td>UI/UX Designer</td><td>Design</td><td>fatima@cpx.com</td><td><span style="background:#dcfce7;color:#166534;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold">Active</span></td></tr>
          <tr><td>105</td><td>Zubair Ahmed</td><td>QA Engineer</td><td>Testing</td><td>zubair@cpx.com</td><td><span style="background:#fee2e2;color:#991b1b;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold">Inactive</span></td></tr>
        </tbody>
      </table>
    </div>

    <!-- SAML assertion -->
    <div class="card">
      <h2>SAML Assertion Attributes</h2>
      <pre>${JSON.stringify(user, null, 2)}</pre>
    </div>
  </div>

  <!-- WebAuthn registration script (only injected when no passkey yet) -->
  ${!hasPasskey ? `<script>
  // ── base64url helpers ──────────────────────────────────────────────────────
  function b64url(buf) {
    const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
    let s = '';
    for (const b of bytes) s += String.fromCodePoint(b);
    return btoa(s).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  }
  function fromB64url(str) {
    const base64 = str.replaceAll('-', '+').replaceAll('_', '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const binary = atob(padded);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.codePointAt(i);
    return bytes;
  }

  document.getElementById('registerPasskeyBtn').addEventListener('click', async () => {
    const btn    = document.getElementById('registerPasskeyBtn');
    const status = document.getElementById('passkeyStatus');
    btn.disabled = true;
    btn.textContent = 'Registering…';
    status.textContent = '';
    status.className = 'passkey-status';

    try {
      // 1. Get registration options from server
      const optRes = await fetch('/webauthn/register/options', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!optRes.ok) throw new Error((await optRes.json()).error || 'Options failed');
      const options = await optRes.json();

      // 2. Decode challenge + user.id for navigator.credentials
      options.challenge = fromB64url(options.challenge);
      options.user.id   = fromB64url(options.user.id);
      if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map(c => ({ ...c, id: fromB64url(c.id) }));
      }

      // 3. Browser passkey dialog
      const cred = await navigator.credentials.create({ publicKey: options });

      // 4. Send attestation to server
      const verifyRes = await fetch('/webauthn/register/verify', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cred.id, rawId: b64url(cred.rawId), type: cred.type,
          response: {
            attestationObject: b64url(cred.response.attestationObject),
            clientDataJSON:    b64url(cred.response.clientDataJSON),
            transports:        cred.response.getTransports?.() || []
          },
          clientExtensionResults: cred.getClientExtensionResults?.() || {}
        })
      });
      const result = await verifyRes.json();
      if (!result.verified) throw new Error(result.error || 'Verification failed');

      status.textContent = '✅ Passkey registered! This page will refresh.';
      status.className   = 'passkey-status success';
      setTimeout(() => location.reload(), 1800);

    } catch (err) {
      console.error(err);
      const msg = err.name === 'NotAllowedError' ? 'Cancelled by user.' : err.message;
      status.textContent = '❌ ' + msg;
      status.className   = 'passkey-status error';
      btn.disabled = false;
      btn.textContent = 'Try Again';
    }
  });
  </script>` : ''}

</body>
</html>`);
});

// ── JSON API — used by React frontend if needed ───────────────────────────────
router.get('/api/me', (req, res) => {
    if (!req.isAuthenticated() && !req.session?.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = req.user || req.session?.user;
    const userId = user?.nameID || user?.id || '';
    const creds = store.getUserCredentials(userId);
    res.json({ id: userId, email: userId, nameID: userId, hasPasskey: creds.length > 0, passkeyCount: creds.length });
});

// ── Logout ────────────────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
    req.logout(() => {
        req.session.destroy(() => res.redirect('http://localhost:5173/'));
    });
});

module.exports = router;
