import { useState } from 'react'; // ลบ React ออกเพราะไม่ได้ใช้โดยตรง
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { PDPAModal } from './components/PDPAModal';
import { TokenModal } from './components/TokenModal';
import { GoogleOAuthProvider } from '@react-oauth/google';

// ใช้ import type สำหรับ TypeScript 5.0+ (verbatimModuleSyntax)
import type { UserRole, Appointment } from './types';

// Student Components
import { StudentHome } from './components/student/StudentHome';
import { BookingPage } from './components/student/BookingPage';
import { StudentHistory } from './components/student/StudentHistory';
import { StudentProfile } from './components/student/StudentProfile';

// Counselor Components
import { CounselorDashboard } from './components/counselor/CounselorDashboard';
import { CaseNotePage } from './components/counselor/CaseNotePage';
import { ManageSchedule } from './components/counselor/ManageSchedule';

// Admin Components
import { AdminHome } from './components/admin/AdminHome';
import { UserManagement } from './components/admin/UserManagement';

type AppState = 'landing' | 'login' | 'app';

// --- Mock Data ---
const mockAppointments: Appointment[] = [
  { id: '1', date: '2026-01-15', time: '10:00 AM', counselor: 'Dr. Sarah Chen', status: 'upcoming', notes: 'Academic stress' },
  { id: '2', date: '2025-12-20', time: '02:00 PM', counselor: 'Dr. Michael Torres', status: 'completed', notes: 'Anxiety management' },
];

const mockProfile = {
  name: 'Alex Johnson',
  email: 'alex.johnson@cmu.ac.th',
  phone: '+66 81 234 5678',
  studentId: 'CMU640610001',
  department: 'Computer Science',
  enrollmentDate: 'Aug 15, 2021',
};

const mockAdminStats = {
  totalUsers: 248,
  activeStudents: 189,
  activeCounselors: 12,
  pendingApprovals: 7,
  totalSessions: 1456,
  sessionsThisMonth: 87,
  upcomingSessions: 24,
  averageWaitTime: '2.5 days',
};

const mockCaseNoteStudent = {
  name: 'Alex Johnson',
  studentId: 'CMU640610001',
  caseCode: 'CASE-64-001', // เพิ่มตาม Requirement
  department: 'Computer Science',
  previousSessions: 3,
  consentSigned: true
};

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentPage, setCurrentPage] = useState('');
  const [showPDPA, setShowPDPA] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  // --- Handlers ---
  const handleLogin = (_email: string, _password: string, role: UserRole) => {
    if (!role) {
      alert("กรุณาเลือก Role ก่อนครับ");
      return;
    }
    setUserRole(role);
    setAppState('app');

    if (role === 'student') {
      setCurrentPage('student-home');
      setShowPDPA(true);
    } else if (role === 'counselor') {
      setCurrentPage('counselor-dashboard');
    } else {
      setCurrentPage('admin-home');
    }
  };

  const handlePDPAAccept = () => {
    setShowPDPA(false);
    setShowToken(true);
  };

  const handleTokenSubmit = (_token: string) => {
    setShowToken(false);
    setAppState('app');
    setCurrentPage('student-home');
  };

  const handleLogout = () => {
    setAppState('landing');
    setUserRole(null);
    setCurrentPage('');
  };

  const handleBookSession = (date: string, time: string, description: string) => {
    const newApp: Appointment = {
      id: String(appointments.length + 1),
      date,
      time,
      counselor: 'Dr. Sarah Chen',
      status: 'upcoming',
      notes: description,
    };
    setAppointments([...appointments, newApp]);
    setCurrentPage('student-home');
  };

  const renderContent = () => {
    if (!userRole) return null;

    if (userRole === 'student') {
      switch (currentPage) {
        case 'student-home':
          return <StudentHome appointments={appointments} onBookSession={() => setCurrentPage('student-booking')} />;
        case 'student-booking':
          return (
            <BookingPage
              onBook={handleBookSession}
              onNavigateToHistory={() => setCurrentPage('student-history')}
            />
          );
        case 'student-history':
          return <StudentHistory appointments={appointments} />;
        case 'student-profile':
          return <StudentProfile profile={mockProfile} onSave={(p) => console.log(p)} />;
        default:
          return <StudentHome appointments={appointments} onBookSession={() => setCurrentPage('student-booking')} />;
      }
    }

    if (userRole === 'counselor') {
      switch (currentPage) {
        case 'counselor-dashboard':
          return (
            <CounselorDashboard
              waitingStudents={[]}
              todayAppointments={[]}
              onGenerateToken={() => 'TOKEN-123'}
            />
          );
        case 'counselor-notes':
          return <CaseNotePage />; // แก้เหลือแค่นี้ครับ
        case 'counselor-schedule':
          return <ManageSchedule />;
        default:
          return (
            <CounselorDashboard
              waitingStudents={[]}
              todayAppointments={[]}
              onGenerateToken={() => 'TOKEN-123'}
            />
          );
      }
    }

    if (userRole === 'admin') {
      switch (currentPage) {
        case 'admin-home':
          return <AdminHome stats={mockAdminStats} />;
        case 'admin-users':
          return <UserManagement users={[]} onApprove={() => { }} onSuspend={() => { }} />;
        default:
          return <AdminHome stats={mockAdminStats} />;
      }
    }
  };

  if (appState === 'landing') return <LandingPage onLogin={() => setAppState('login')} />;
  if (appState === 'login') return <LoginPage onLogin={handleLogin} onBack={() => setAppState('landing')} />;

  return (
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID">
      <Layout
        userRole={userRole}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>

      {showPDPA && <PDPAModal onAccept={handlePDPAAccept} />}
      {showToken && <TokenModal onSubmit={handleTokenSubmit} />}
    </GoogleOAuthProvider>
  );
}