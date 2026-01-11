export const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
    AUTH: {
        CMU_ENTRANCE: `${API_BASE_URL}/auth/cmu`,
        LOGIN: `${API_BASE_URL}/auth/login`,
        LOGOUT: `${API_BASE_URL}/auth/logout`,
    },
    USERS: {
        ME: `${API_BASE_URL}/users/me`,
        PROFILE: `${API_BASE_URL}/users/profile`,
        ALL: `${API_BASE_URL}/users`,
    },
    APPOINTMENTS: {
        // หากลอง /appointments/my แล้วยัง 404 ให้ลองเปลี่ยนเป็น `${API_BASE_URL}/sessions/my`
        MY: `${API_BASE_URL}/appointments/my`,
        BOOK: `${API_BASE_URL}/appointments/book`,
        COUNSELOR_TODAY: `${API_BASE_URL}/appointments/counselor/today`,
    },
    // เพิ่มส่วนของ QUEUE เผื่อไว้สำหรับระบบ Waiting List ตามใน Prisma
    QUEUE: {
        STATUS: `${API_BASE_URL}/cases/status`,
        MY_QUEUE: `${API_BASE_URL}/cases/my-queue`,
    },
    ADMIN: {
        STATS: `${API_BASE_URL}/admin/stats`,
    }
};

/**
 * ฟังก์ชันสำหรับดึง Auth Header พร้อมตรวจสอบความถูกต้องของ Token
 */
export const getAuthHeader = (): Record<string, string> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return {};

        // ตรวจสอบเบื้องต้นว่า token ไม่ได้หมดอายุหรือผิดรูปแบบ (Optional)
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    } catch (error) {
        console.error("Error getting auth header:", error);
        return {};
    }
};

/**
 * Helper สำหรับจัดการชื่อ Role ให้เป็นมาตรฐานเดียวกัน (Lower Case)
 */
export const normalizeRole = (role: string | null | undefined): string => {
    return (role || '').toLowerCase().trim();
};