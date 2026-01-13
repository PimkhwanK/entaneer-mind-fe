import { API_ENDPOINTS, getAuthHeader } from '../config/api.config';
// ✅ เพมิ่ ตัวแปรนี้
const BASE_URL = 'http://localhost:3000/api';
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
    },
    // ✅ เพมิ่ ฟงัก์ชนั นี้
    async verifyCaseCode(code: string) {
        const res = await fetch(`${BASE_URL}/cases/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(getAuthHeader() as HeadersInit)
            },
            body: JSON.stringify({ code })
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to verify code');
        }
        return res.json();
    }
};