// src/config/api.config.ts

// 1. กำหนด Base URL ตามพอร์ตที่ Backend รันอยู่ (จากรูปคือพอร์ต 3000)
export const API_BASE_URL = 'http://localhost:3000/api';

// 2. รวม Endpoints ทั้งหมดไว้ที่เดียว ง่ายต่อการแก้ไขภายหลัง
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        LOGOUT: `${API_BASE_URL}/auth/logout`,
    },
    USERS: {
        ME: `${API_BASE_URL}/users/me`, // สำหรับดึงโปรไฟล์ตัวเองมาเช็คสถานะ
        PROFILE: `${API_BASE_URL}/users/profile`,
    },
    APPOINTMENTS: {
        LIST: `${API_BASE_URL}/appointments`,
        CREATE: `${API_BASE_URL}/appointments/book`,
    }
};

// 3. ฟังก์ชันสำหรับดึง Token จาก LocalStorage (Helper)
export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};