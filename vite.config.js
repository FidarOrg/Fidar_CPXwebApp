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
      // ── Dev server API routing ──────────────────────────────────────────────
      // Frontend natively uses `/fidar/sdk/api/...` paths now, so we just proxy them.
      // In production, Nginx serves the static files without a proxy, so the React code directly hits the target domain.
      "/fidar/sdk/api": {
        target: "https://sdk.fidar.io",
        changeOrigin: true,
      },
    },
  },
});
