// Central place for the backend API base URL.
//
// Locally this keeps working exactly as before (falls back to
// http://127.0.0.1:8000 when no env var is set). In production, set
// VITE_API_BASE_URL in the deployment environment (e.g. Vercel project
// settings) to the deployed backend's URL, with no trailing slash.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
