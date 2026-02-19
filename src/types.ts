export type UserRole = 'client' | 'counselor' | 'admin' | null;

// --- สำหรับ Counselor Dashboard (UI ที่เราเพิ่งแก้ไป) ---
export interface WaitingClient {
    id: string;
    name: string;
    waitingSince: string;
    urgency: 'low' | 'medium' | 'high';
}

export interface TodayAppointment {
    id: string;
    time: string;
    clientName: string;
    status: 'pending' | 'in-progress' | 'completed';
    caseCode: string;
}

export interface TimeBlock {
    day: string;
    time: string;
    available: boolean;
    bookedBy?: string;
    clientName?: string;
}

export interface UserData {
    userId: number;
    firstName: string;
    lastName: string;
    cmuAccount: string;
    roleName: string;
    phoneNum?: string;
    gender?: string;
    clientProfile?: {
        clientId: string;
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
    clientId: string;
    clientName: string;
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