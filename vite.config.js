import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * Vite Proxy Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * ALL traffic is now routed to the Java Spring Boot server (port 8084).
 * The Node.js server (port 3000) is no longer needed.
 *
 * Route mapping:
 *   /login        → Java /fidar/sdk/api/login           (triggers SAML2 → PingOne)
 *   /logout       → Java /fidar/sdk/api/logout          (clears session)
 *   /webauthn/*   → Java /fidar/sdk/api/webauthn/*      (passkey registration/login)
 *   /api/me       → Java /fidar/sdk/api/webauthn/me     (passkey status check)
 *   /api/*        → Java /fidar/sdk/api/ (other API calls)
 */
export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // ── SAML login → Spring Security SAML2 trigger URL ─────────────────────
      "/login": {
        target: "http://localhost:8084",
        changeOrigin: true,
        rewrite: (_path) => "/fidar/sdk/api/saml2/authenticate/pingone",
      },
      "/logout": {
        target: "http://localhost:8084",
        changeOrigin: true,
        rewrite: (_path) => "/fidar/sdk/api/api/logout",
      },

      // ── WebAuthn registration & authentication → Java ──────────────────────
      "/webauthn": {
        target: "http://localhost:8084",
        changeOrigin: true,
        rewrite: (path) => "/fidar/sdk/api" + path,
      },

      // ── All other /api/* → Java ───────────────────────────────────────────────
      "/api": {
        target: "http://localhost:8084",
        changeOrigin: true,
        rewrite: (path) => "/fidar/sdk/api" + path,
      },
    },
  },
});
