/**
 * Global API Base Configuration
 * - In local development (Vite), we leave this empty so requests hit the Vite dev server proxy (avoiding CORS).
 * - In production (Nginx), there is no proxy, so we must point directly to the backend URL.
 */
export const FIDAR_API_BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_FIDAR_SERVER_URL || "https://sdk.fidar.io");
export const APP_API_BASE = "https://4nxp8cahmx.ap-south-1.awsapprunner.com";
