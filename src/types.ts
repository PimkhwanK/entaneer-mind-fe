export type UserRole = 'student' | 'counselor' | 'admin' | null;

// --- สำหรับ Counselor Dashboard (UI ที่เราเพิ่งแก้ไป) ---
export interface WaitingStudent {
    id: string;
    name: string;
    waitingSince: string;
    urgency: 'low' | 'medium' | 'high';
}

export interface TodayAppointment {
    id: string;
    time: string;
    studentName: string;
    status: 'pending' | 'in-progress' | 'completed';
    caseCode: string;
}

export interface TimeBlock {
    day: string;
    time: string;
    available: boolean;
    bookedBy?: string;
    studentName?: string;
}

export interface UserData {
    userId: number;
    firstName: string;
    lastName: string;
    cmuAccount: string;
    roleName: string;
    phoneNum?: string;
    gender?: string;
    studentProfile?: {
        studentId: string;
        major?: string;
        department?: string;
        cases?: any[];
    };
}

export interface Appointment {
    id: string;
    date: string;
    time: string;
    counselor: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    notes?: string;
    googleEventId?: string;
}

export interface CaseNote {
    id: string;
    caseCode: string;
    studentId: string;
    studentName: string;
    department: string;
    sessionDate: string;
    sessionTime: string;
    moodScale: number;
    selectedTags: string[];
    sessionSummary: string;
    interventions: string;
    followUp: string;
    createdAt: string;
}