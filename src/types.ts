export type UserRole = 'student' | 'counselor' | 'admin' | null;

export interface StudentProfile {
    name: string;
    studentId: string;
    caseCode: string;
    department: string;
    previousSessions: number;
    consentSigned: boolean;
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

export interface Appointment {
    id: string;
    date: string;
    time: string;
    counselor: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    notes?: string;
    googleEventId?: string;
}