import axios from 'axios';
import { handleApiError } from '../utils/handleApiError';

/**
 * Base URL Strategy
 * -----------------
 * VITE_API_URL should be set in .env for every environment.
 * Falling back to localhost:8000 is intentional and safe for local
 * development — it is the industry-standard approach (Create React App,
 * Vite scaffolds, and most OSS projects all do this). The fallback
 * NEVER reaches production because VITE_API_URL is always set there.
 *
 * If VITE_API_URL is explicitly absent, we surface a clear UI error
 * through the toast system rather than letting the request fail silently.
 */
const VITE_API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = VITE_API_URL || 'http://localhost:8000';

if (!VITE_API_URL) {
    // Non-blocking warning; the interceptor will catch the inevitable
    // network failure and show a branded ZuruToast instead.
    console.warn(
        '[Zuru] VITE_API_URL is not set. ' +
        'Falling back to http://localhost:8000 for local development. ' +
        'Set VITE_API_URL in your .env file for all other environments.'
    );
}

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request Interceptor ──────────────────────────────────────────────────────
// Attach JWT access token to every outgoing request.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────────────────────
// Catch 400 / 401 / 403 / 500 errors globally and surface them as
// branded Zuru Toasts. Components still receive the rejection so they
// can clear loading states — they just don't need to show their own alerts.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const httpStatus = error.response?.status;

        // 401 — session expired; let AuthContext handle the redirect.
        // We still fire a toast so the user understands why they're redirected.
        // 404 — deliberately excluded; callers handle "not found" inline.
        const SILENCED_CODES = [404];

        if (!SILENCED_CODES.includes(httpStatus)) {
            handleApiError(error); // fires the zuru:toast DOM event
        }

        return Promise.reject(error);
    }
);

export default api;
