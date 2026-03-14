/**
 * CPX Auth Server — Entry Point
 * ==============================
 * HTTPS Express server (port 3000)
 * - SAML SSO via PingOne (passport-saml)
 * - WebAuthn passkey registration & authentication (@simplewebauthn/server)
 * - CORS configured for Vite dev server (port 5173)
 *
 * Before starting:
 *   1. Copy server.cert, server.key, ping.crt from the reference app into ./certs/
 *   2. Run: npm install
 *   3. Run: node index.js
 */

'use strict';

const path = require('path');
const fs = require('fs');
const https = require('https');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const cors = require('cors');

const samlStrategy = require('./config/saml');
const authRouter = require('./routes/auth');
const webauthnRouter = require('./routes/webauthn');

// ── App setup ─────────────────────────────────────────────────────────────────
const app = express();

// ── CORS — allow Vite dev server + same-origin Express ───────────────────────
app.use(cors({
    origin: ['http://localhost:5173', 'https://localhost:5173', 'https://localhost:3000'],
    credentials: true,
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ── Session (matches sample app settings) ─────────────────────────────────────
app.use(session({
    secret: process.env.SESSION_SECRET || 'cpx_session_secret_change_in_prod',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,    // HTTPS only
        httpOnly: true,
        sameSite: 'lax',   // lax = works for same-origin HTTPS redirect from SAML
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
    },
}));

// ── Passport ──────────────────────────────────────────────────────────────────
passport.use('saml', samlStrategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/', authRouter);
app.use('/webauthn', webauthnRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ── HTTPS server ──────────────────────────────────────────────────────────────
const certsDir = path.join(__dirname, 'certs');

let tlsOptions;
try {
    tlsOptions = {
        key: fs.readFileSync(path.join(certsDir, 'server.key')),
        cert: fs.readFileSync(path.join(certsDir, 'server.cert')),
    };
} catch {
    console.error('❌  TLS certs not found in ./certs/');
    console.error('   Copy server.key and server.cert from the reference app into server/certs/');
    process.exit(1);
}

https.createServer(tlsOptions, app).listen(3000, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   CPX Auth Server  ·  https://localhost:3000   ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('');
    console.log('  🔐  SAML login:    https://localhost:3000/login');
    console.log('  🗝️   WebAuthn reg:  POST /webauthn/register/options');
    console.log('  🗝️   WebAuthn auth: POST /webauthn/login/options');
    console.log('  ❤️   Health:        https://localhost:3000/health');
    console.log('');
});
