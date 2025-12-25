import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { PDPAModal } from './components/PDPAModal';
import { TokenModal } from './components/TokenModal';

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
type UserRole = 'student' | 'counselor' | 'admin' | null;

// Mock Data
const mockAppointments = [
  {
    id: '1',
    date: 'Dec 28, 2024',
    time: '10:00 AM',
    counselor: 'Dr. Sarah Chen',
    status: 'upcoming' as const,
    notes: 'Academic stress discussion',
  },
  {
    id: '2',
    date: 'Dec 20, 2024',
    time: '2:00 PM',
    counselor: 'Dr. Michael Torres',
    status: 'completed' as const,
    notes: 'Anxiety management techniques',
  },
  {
    id: '3',
    date: 'Jan 5, 2025',
    time: '3:00 PM',
    counselor: 'Dr. Emily Watson',
    status: 'upcoming' as const,
  },
];

const mockProfile = {
  name: 'Alex Johnson',
  email: 'alex.johnson@cmu.ac.th',
  phone: '+66 81 234 5678',
  studentId: 'CMU640610001',
  department: 'Computer Science',
  enrollmentDate: 'Aug 15, 2021',
};

const mockWaitingStudents = [
  { id: '1', name: 'John Doe', waitingSince: '2 hours ago', urgency: 'high' as const },
  { id: '2', name: 'Jane Smith', waitingSince: '1 day ago', urgency: 'medium' as const },
  { id: '3', name: 'Bob Wilson', waitingSince: '3 hours ago', urgency: 'low' as const },
];

const mockTodayAppointments = [
  { id: '1', time: '10:00 AM', studentName: 'Alice Brown', status: 'completed' as const },
  { id: '2', time: '2:00 PM', studentName: 'Charlie Davis', status: 'in-progress' as const },
  { id: '3', time: '4:00 PM', studentName: 'Diana Lee', status: 'pending' as const },
];

const mockCaseNoteStudent = {
  name: 'Alex Johnson',
  studentId: 'CMU640610001',
  department: 'Computer Science',
  previousSessions: 3,
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

const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@cmu.ac.th',
    role: 'student' as const,
    status: 'pending' as const,
    registeredDate: 'Dec 20, 2024',
    department: 'Engineering',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@cmu.ac.th',
    role: 'student' as const,
    status: 'active' as const,
    registeredDate: 'Dec 15, 2024',
    department: 'Business',
  },
  {
    id: '3',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@cmu.ac.th',
    role: 'counselor' as const,
    status: 'active' as const,
    registeredDate: 'Nov 10, 2024',
  },
  {
    id: '5',
    name: 'Main Admin',
    email: 'admin@cmu.ac.th',
    role: 'admin' as const,
    status: 'active' as const,
    registeredDate: 'Jan 1, 2025',
  },
];

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentPage, setCurrentPage] = useState('');
  const [showPDPA, setShowPDPA] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [appointments, setAppointments] = useState(mockAppointments);
  const [users, setUsers] = useState<any[]>(mockUsers);

  const handleLogin = (email: string, password: string, role: UserRole) => {
    /* setUserRole(role);
    if (role === 'student') {
      setShowPDPA(true);
    } else {
      setAppState('app');
      setCurrentPage(role === 'counselor' ? 'counselor-dashboard' : 'admin-home');
    }
    */

    // Mock for Design/Test 
    console.log("Login triggered with role:", role); // ไว้เช็คใน F12 ว่าปุ่มทำงานไหม

    if (!role) {
      alert("กรุณาเลือก Role ก่อนครับ");
      return;
    }

    // บังคับเปลี่ยนสถานะ App เป็น 'app' ทันที
    setUserRole(role);
    setAppState('app');

    // บังคับเลือกหน้าเริ่มต้นตาม Role
    if (role === 'student') {
      setCurrentPage('student-home');
      setShowPDPA(true); // ถ้าไม่อยากให้ติด PDPA ให้คอมเมนต์บรรทัดนี้ทิ้ง
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

  const handleTokenSubmit = (token: string) => {
    // Verify token (mock)
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
    const newAppointment = {
      id: String(appointments.length + 1),
      date,
      time,
      counselor: 'Dr. Sarah Chen',
      status: 'upcoming' as const,
      notes: description,
    };
    setAppointments([...appointments, newAppointment]);
    setCurrentPage('student-home');
  };

  const handleGenerateToken = () => {
    return `ENT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  };

  const handleSaveCaseNote = (caseNote: any) => {
    console.log('Case note saved:', caseNote);
    alert('Case note saved successfully!');
  };

  const handleSaveProfile = (profile: any) => {
    console.log('Profile updated:', profile);
    alert('Profile updated successfully!');
  };

  const handleApproveUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: 'active' as const } : user
      )
    );
  };

  const handleSuspendUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: 'suspended' as const } : user
      )
    );
  };

  const renderContent = () => {
    if (!userRole) return null;

    // Student Pages
    if (userRole === 'student') {
      switch (currentPage) {
        case 'student-home':
          return (
            <StudentHome
              appointments={appointments}
              onBookSession={() => setCurrentPage('student-booking')}
            />
          );
        case 'student-booking':
          return <BookingPage onBook={handleBookSession} />;
        case 'student-history':
          return <StudentHistory appointments={appointments} />;
        case 'student-profile':
          return <StudentProfile profile={mockProfile} onSave={handleSaveProfile} />;
        default:
          return (
            <StudentHome
              appointments={appointments}
              onBookSession={() => setCurrentPage('student-booking')}
            />
          );
      }
    }

    // Counselor Pages
    if (userRole === 'counselor') {
      switch (currentPage) {
        case 'counselor-dashboard':
          return (
            <CounselorDashboard
              waitingStudents={mockWaitingStudents}
              todayAppointments={mockTodayAppointments}
              onGenerateToken={handleGenerateToken}
            />
          );
        case 'counselor-notes':
          return (
            <CaseNotePage student={mockCaseNoteStudent} onSave={handleSaveCaseNote} />
          );
        case 'counselor-schedule':
          return <ManageSchedule />;
        default:
          return (
            <CounselorDashboard
              waitingStudents={mockWaitingStudents}
              todayAppointments={mockTodayAppointments}
              onGenerateToken={handleGenerateToken}
            />
          );
      }
    }

    // Admin Pages
    if (userRole === 'admin') {
      switch (currentPage) {
        case 'admin-home':
          return <AdminHome stats={mockAdminStats} />;
        case 'admin-users':
          return (
            <UserManagement
              users={users}
              onApprove={handleApproveUser}
              onSuspend={handleSuspendUser}
            />
          );
        default:
          return <AdminHome stats={mockAdminStats} />;
      }
    }

    return null;
  };

  if (appState === 'landing') {
    return <LandingPage onLogin={() => setAppState('login')} />;
  }

  if (appState === 'login') {
    return <LoginPage onLogin={handleLogin} onBack={() => setAppState('landing')} />;
  }

  return (
    <>
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
    </>
  );
}
