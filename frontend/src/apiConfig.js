// Centralized API configuration for local dev and cloud deployment
const RAW_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://cloud-computing-a3c2.onrender.com');

// Remove trailing slash to prevent double slashes in paths like `${API_BASE}/api/...`
export const API_BASE = RAW_URL.replace(/\/+$/, '');

