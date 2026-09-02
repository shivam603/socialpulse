// API Base URL configuration
// Defaults to '' for same-origin requests or local proxy, or uses VITE_API_URL when deployed separately (e.g. Vercel -> Render)
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
};
