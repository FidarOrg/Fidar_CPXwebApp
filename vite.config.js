import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

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
      // SAML auth routes
      "/login": {
        target: "https://localhost:3000",
        changeOrigin: true,
        secure: false,       // self-signed cert in dev
      },
      "/logout": {
        target: "https://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      // Session/profile API
      "/api": {
        target: "https://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      // WebAuthn registration & authentication
      "/webauthn": {
        target: "https://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
