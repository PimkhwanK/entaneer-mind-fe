// src/config/api.config.ts

export const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
    /* ================= AUTH ================= */
    AUTH: {
        CMU_ENTRANCE: `${API_BASE_URL}/auth/cmu`,
        LOGIN: `${API_BASE_URL}/auth/login`,
        LOGOUT: `${API_BASE_URL}/auth/logout`,
    },

    /* ================= USERS ================= */
    USERS: {
        ME: `${API_BASE_URL}/users/me`,
        PROFILE: `${API_BASE_URL}/users/profile`,
        ALL: `${API_BASE_URL}/users`,
    },

    /* ================= BOOKINGS ================= */
    BOOKINGS: {
        COUNSELORS: `${API_BASE_URL}/bookings/counselors`,

        SESSIONS: (roomId: number, dateYYYYMMDD: string) =>
            `${API_BASE_URL}/bookings/sessions?roomId=${encodeURIComponent(
                String(roomId)
            )}&date=${encodeURIComponent(dateYYYYMMDD)}`,

        BOOK: `${API_BASE_URL}/bookings/book`,

        // new api endpoints (keep if you have backend)
        ACTIVE: (clientId: string) =>
            `${API_BASE_URL}/bookings/active/${encodeURIComponent(clientId)}`,
        HISTORY: (clientId: string) =>
            `${API_BASE_URL}/bookings/history/${encodeURIComponent(clientId)}`,

        // old api endpoints (keep if other pages use them)
        CREATE: `${API_BASE_URL}/bookings`,
        CANCEL: (caseId: number) =>
            `${API_BASE_URL}/bookings/${encodeURIComponent(String(caseId))}/cancel`,
    },

    SESSION_PORTAL: {
        ROOMS: `${API_BASE_URL}/session-portal/rooms`,
        CREATE_ROOM: `${API_BASE_URL}/session-portal/rooms`,
        DELETE_ROOM: (roomId: number | string) =>
            `${API_BASE_URL}/session-portal/rooms/${encodeURIComponent(String(roomId))}`,

        SCHEDULE: (roomId: number | string, weekStartYYYYMMDD: string) =>
            `${API_BASE_URL}/session-portal/schedule?roomId=${encodeURIComponent(String(roomId))}&weekStart=${encodeURIComponent(weekStartYYYYMMDD)}`,

        TOGGLE_SLOT: `${API_BASE_URL}/session-portal/slots/toggle`,
        CANCEL_BOOKING: (sessionId: number) =>
            `${API_BASE_URL}/session-portal/slots/${encodeURIComponent(String(sessionId))}/cancel`,

        BULK_WEEK: `${API_BASE_URL}/session-portal/week/bulk`,
    },

    /* ================= APPOINTMENTS ================= */
    APPOINTMENTS: {
        MY: `${API_BASE_URL}/appointments/my`,
        BOOK: `${API_BASE_URL}/appointments/book`,
        COUNSELOR_TODAY: `${API_BASE_URL}/appointments/counselor/today`,
    },

    /* ================= CASE / QUEUE ================= */
    QUEUE: {
        STATUS: `${API_BASE_URL}/cases/status`,
        MY_QUEUE: `${API_BASE_URL}/cases/my-queue`,
        VERIFY_CODE: `${API_BASE_URL}/cases/verify-code`,
    },

    /* ================= SESSIONS ================= */
    SESSIONS: {
        // keep your existing ones if used elsewhere
        CREATE: `${API_BASE_URL}/sessions`,
        UPDATE: (id: number) => `${API_BASE_URL}/sessions/${id}`,
        DETAIL: (id: number) => `${API_BASE_URL}/sessions/${id}`,

        // client history page
        HISTORY: `${API_BASE_URL}/sessions/history`,
        CANCEL: (sessionId: number) => `${API_BASE_URL}/sessions/${sessionId}/cancel`,

        // ✅ counselor case-note system
        COUNSELOR_RECORDS: `${API_BASE_URL}/sessions/counselor/records`,
        GET_CASE_NOTE: (sessionId: number) =>
            `${API_BASE_URL}/sessions/${encodeURIComponent(String(sessionId))}/case-note`,
        UPDATE_CASE_NOTE: (sessionId: number) =>
            `${API_BASE_URL}/sessions/${encodeURIComponent(String(sessionId))}/case-note`,
        GET_CASE_NOTE_BY_CODE: (caseCode: string) =>
            `${API_BASE_URL}/sessions/case-note/by-code/${encodeURIComponent(caseCode)}`,
    },

    /* ================= PROBLEM TAGS ================= */
    PROBLEM_TAGS: {
        ALL: `${API_BASE_URL}/problem-tags`,
        CREATE: `${API_BASE_URL}/problem-tags`,
        DELETE: (id: number) => `${API_BASE_URL}/problem-tags/${encodeURIComponent(String(id))}`,
    },

    /* ================= ADMIN ================= */
    ADMIN: {
        STATS: `${API_BASE_URL}/admin/stats`,
    },

    /* ================= CLIENT HOME ================= */
    CLIENT_HOME: {
        HOME: `${API_BASE_URL}/client-home`,
    },

    /* ================= COUNSELOR ================= */
    COUNSELOR: {
        TOKENS: `${API_BASE_URL}/counselor/tokens`,
        REPORT: (from: string, to: string) => `${API_BASE_URL}/counselor/report?startDate=${from}&endDate=${to}`,
        SCHEDULE: `${API_BASE_URL}/counselor/schedule`,
    },
};


export const getAuthHeader = (): Record<string, string> => {
    try {
        const token = localStorage.getItem('token');
        const base = { 'Content-Type': 'application/json' };
        if (!token) return base;

        return {
            ...base,
            Authorization: `Bearer ${token}`,
        };
    } catch (error) {
        console.error('Error getting auth header:', error);
        return { 'Content-Type': 'application/json' };
    }
};

/** Normalize role name for consistent comparison */
export const normalizeRole = (role: string | null | undefined): string => {
    return (role || '').toLowerCase().trim();
};