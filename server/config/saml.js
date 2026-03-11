/**
 * SAML Strategy Configuration
 * ----------------------------
 * Mirrors the reference sample app (sampleapp 2) SAML setup for PingOne.
 * The PEM cert is read from /certs/ping.crt with headers stripped,
 * as required by passport-saml.
 */

const path = require('path');
const fs = require('fs');
const { Strategy: SamlStrategy } = require('passport-saml');

const certPath = path.join(__dirname, '..', 'certs', 'ping.crt');

let rawCert;
try {
    rawCert = fs.readFileSync(certPath, 'utf-8')
        .replace(/-----BEGIN CERTIFICATE-----/g, '')
        .replace(/-----END CERTIFICATE-----/g, '')
        .replace(/\s/g, '')
        .trim();
} catch {
    console.warn('⚠️  ping.crt not found at', certPath,
        '-- copy it from the reference app into server/certs/');
    rawCert = 'PLACEHOLDER_CERT';
}

const samlStrategy = new SamlStrategy(
    {
        // ── Endpoint configuration ──────────────────────────────────────────────
        callbackUrl: 'https://localhost:3000/login/callback',
        entryPoint: 'https://auth.pingone.sg/2a79dba5-b2e3-4891-825f-ededa55d3ad3/saml20/idp/sso',
        issuer: 'https://localhost:3000',

        // ── Certificate (IdP public key for assertion verification) ─────────────
        cert: rawCert,

        // ── Options matching reference app ──────────────────────────────────────
        identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        disableRequestedAuthnContext: true,
        wantAssertionsSigned: true,
        validateInResponseTo: false,
        additionalParams: {},
    },
    (profile, done) => {
        console.log('✅ SAML authenticated:', profile.nameID);
        return done(null, {
            id: profile.nameID,   // use email as unique user ID
            nameID: profile.nameID,
            email: profile.nameID,
            attributes: profile.attributes || {},
        });
    }
);

module.exports = samlStrategy;
