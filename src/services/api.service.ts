import { API_ENDPOINTS, getAuthHeader } from '../config/api.config';

export const apiService = {
    async getUserProfile() {
        const res = await fetch(API_ENDPOINTS.USERS.ME, {
            headers: getAuthHeader() as HeadersInit
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
    },
    async getAdminStats() {
        const res = await fetch(API_ENDPOINTS.ADMIN.STATS, {
            headers: getAuthHeader() as HeadersInit
        });
        if (!res.ok) throw new Error('Failed to fetch admin stats');
        return res.json();
    }
};