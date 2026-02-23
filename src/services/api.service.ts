import { API_ENDPOINTS, getAuthHeader } from '../config/api.config';

export const apiService = {
    /* ================= USER ================= /
    async getUserProfile() {
        const res = await fetch(API_ENDPOINTS.USERS.ME, {
            headers: getAuthHeader() as HeadersInit
        });

        if (!res.ok) {
            throw new Error('Failed to fetch profile');
        }

        return res.json();
    },

    / ================= ADMIN ================= /
    async getAdminStats() {
        const res = await fetch(API_ENDPOINTS.ADMIN.STATS, {
            headers: getAuthHeader() as HeadersInit
        });

        if (!res.ok) {
            throw new Error('Failed to fetch admin stats');
        }

        return res.json();
    },

    / ================= QUEUE / CASE ================= */
    async verifyCaseCode(code: string) {
        const res = await fetch(API_ENDPOINTS.QUEUE.VERIFY_CODE, {
            method: 'POST',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to verify code');
        }

        return data;
    }
};