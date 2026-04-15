/**
 * handleApiError — Zuru's central API error extraction utility.
 *
 * Usage (inside a React component):
 *   import { handleApiError } from '../utils/handleApiError';
 *   import { useToast } from '../context/ToastContext';
 *
 *   const { showToast } = useToast();
 *   ...
 *   } catch (err) {
 *     handleApiError(err, showToast);
 *   }
 *
 * Usage (outside React, e.g. Axios interceptor):
 *   handleApiError(err);   // fires the 'zuru:toast' DOM event
 */

/**
 * Extracts the most human-readable error message from an Axios error.
 * Priority: backend `.error` field > first DRF field error > status text.
 *
 * @param {import('axios').AxiosError} err
 * @returns {{ message: string, code: string | null, status: number | null }}
 */
export function extractApiError(err) {
    // Network / no-response scenario
    if (err.request && !err.response) {
        return {
            message: 'Server unreachable. Please check your internet or Zuru status.',
            code: 'NETWORK_ERROR',
            status: null,
        };
    }

    // Server responded with an error body
    if (err.response) {
        const { status: httpStatus, data } = err.response;

        // Zuru-structured: { error: '...', code: '...' }
        if (data?.error) {
            return {
                message: data.error,
                code: data.code || null,
                status: httpStatus,
            };
        }

        // DRF field errors: { field_name: ['message'] }
        if (typeof data === 'object' && data !== null) {
            for (const key of Object.keys(data)) {
                const msgs = data[key];
                if (Array.isArray(msgs) && msgs.length > 0) {
                    return {
                        message: `${key}: ${msgs[0]}`,
                        code: null,
                        status: httpStatus,
                    };
                }
            }
        }

        // DRF detail field
        if (data?.detail) {
            return { message: data.detail, code: null, status: httpStatus };
        }

        // Generic fallback by HTTP status
        const fallbacks = {
            400: 'Invalid request. Please review your input.',
            401: 'Your session has expired. Please log in again.',
            403: 'You do not have permission to perform this action.',
            404: 'The requested resource was not found.',
            500: 'Internal server error. Our team has been notified.',
        };
        return {
            message: fallbacks[httpStatus] || `Unexpected error (HTTP ${httpStatus}).`,
            code: null,
            status: httpStatus,
        };
    }

    // Completely unexpected (e.g. JS runtime error)
    return {
        message: 'An unexpected error occurred. Please try again.',
        code: 'UNKNOWN_ERROR',
        status: null,
    };
}

/**
 * Shows a Zuru Toast for the given error.
 *
 * @param {Error} err - Axios or native error
 * @param {Function | null} showToast - from useToast(); if null, fires DOM event
 */
export function handleApiError(err, showToast = null) {
    const { message } = extractApiError(err);

    if (typeof showToast === 'function') {
        showToast(message, 'error');
    } else {
        // Fired from outside React (e.g. Axios interceptor)
        window.dispatchEvent(new CustomEvent('zuru:toast', {
            detail: { message, type: 'error' },
        }));
    }
}
