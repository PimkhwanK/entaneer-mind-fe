import { useState, useEffect, useCallback } from 'react';
import { LandingPage } from './components/LandingPage';
import { Layout } from './components/Layout';
import { PDPAModal } from './components/PDPAModal';
import { TokenModal } from './components/TokenModal';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AlertCircle } from 'lucide-react';

import { API_ENDPOINTS, getAuthHeader } from './config/api.config';
import type { UserRole, Appointment, WaitingStudent, TodayAppointment, TimeBlock } from './types';

// Components
import { StudentHome } from './components/student/StudentHome';
import { BookingPage } from './components/student/BookingPage';
import { StudentHistory } from './components/student/StudentHistory';
import { StudentProfile } from './components/student/StudentProfile';
import { CounselorDashboard } from './components/counselor/CounselorDashboard';
import { CaseNotePage } from './components/counselor/CaseNotePage';
import { ManageSchedule } from './components/counselor/ManageSchedule';
import { AdminHome } from './components/admin/AdminHome';
import { UserManagement } from './components/admin/UserManagement';

type AppState = 'landing' | 'app' | 'error';

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userData, setUserData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [showPDPA, setShowPDPA] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // สถานะจำลองสำหรับทดสอบข้ามหน้า Waiting
  const [debugForceShowHome, setDebugForceShowHome] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [waitingStudents, setWaitingStudents] = useState<WaitingStudent[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [counselorSchedule, setCounselorSchedule] = useState<TimeBlock[]>([]);
  const [scheduleDate, setScheduleDate] = useState(new Date());

  const createHeaders = (additional: Record<string, string> = {}) => {
    return { ...additional, ...(getAuthHeader() as Record<string, string>) } as HeadersInit;
  };

  const fetchStudentData = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.APPOINTMENTS.MY, { headers: createHeaders() });
      if (res.ok) {
        setAppointments(await res.json());
      } else if (res.status === 404) {
        console.warn("API /sessions/my not found. Using empty array.");
        setAppointments([]);
      }
    } catch (e) {
      console.error("Appointments Fetch Error:", e);
      setAppointments([]);
    }
  };

  const fetchCounselorData = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.APPOINTMENTS.COUNSELOR_TODAY, { headers: createHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTodayAppointments(data.appointments || []);
        setWaitingStudents(data.waiting || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchAdminData = async () => {
    try {
      const statsRes = await fetch(API_ENDPOINTS.ADMIN.STATS, { headers: createHeaders() });
      if (statsRes.ok) setAdminStats(await statsRes.json());
      const usersRes = await fetch(API_ENDPOINTS.USERS.ALL, { headers: createHeaders() });
      if (usersRes.ok) setAllUsers(await usersRes.json());
    } catch (e) { console.error(e); }
  };

  const loadInitialData = useCallback((role: string) => {
    const r = role.toLowerCase();
    if (r === 'student') {
      setCurrentPage('student-home');
      fetchStudentData();
    }
    else if (r === 'counselor') {
      setCurrentPage('counselor-dashboard');
      fetchCounselorData();
    }
    else if (r === 'admin') {
      setCurrentPage('admin-home');
      fetchAdminData();
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      setAppState('landing');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.USERS.ME, {
        headers: createHeaders({ 'Content-Type': 'application/json' })
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        const role = (data.roleName || '').toLowerCase() as UserRole;
        setUserRole(role);

        const pdpaAccepted = localStorage.getItem('pdpa_accepted') === 'true';
        const tokenSubmitted = localStorage.getItem('token_submitted') === 'true';

        if (!pdpaAccepted) {
          setShowPDPA(true);
        } else if (!tokenSubmitted) {
          setShowToken(true);
        } else {
          if (role) loadInitialData(role);
        }
        setAppState('app');
      } else {
        localStorage.removeItem('token');
        setAppState('landing');
      }
    } catch (error) {
      setAppState('error');
      setErrorMessage('การเชื่อมต่อล้มเหลว');
    } finally {
      setIsLoading(false);
    }
  }, [loadInitialData]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const errorFromUrl = urlParams.get('error');

    if (errorFromUrl) {
      setAppState('error');
      setErrorMessage('การเข้าสู่ระบบล้มเหลว: ' + errorFromUrl);
      setIsLoading(false);
      return;
    }

    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname === '/login-success' ? '/' : window.location.pathname);
      checkAuth();
    } else {
      checkAuth();
    }
  }, [checkAuth]);

  const handleLogout = () => {
    localStorage.clear();
    setAppState('landing');
    setUserRole(null);
    setUserData(null);
    setCurrentPage('');
    setDebugForceShowHome(false);
  };

  const renderContent = () => {
    if (!userRole || !userData || showPDPA || showToken) return null;

    if (userRole === 'student') {
      // ตรวจสอบว่ามี Case หรือไม่ (ถ้าไม่มีให้แสดงหน้า Waiting)
      // เพิ่มเงื่อนไข debugForceShowHome เพื่อให้กดปุ่มข้ามหน้า waiting ได้
      const hasCase = (userData.studentProfile?.cases?.length || 0) > 0;
      const shouldShowWaiting = !hasCase && !debugForceShowHome;

      switch (currentPage) {
        case 'student-home':
          return (
            <StudentHome
              appointments={appointments}
              onBookSession={() => setCurrentPage('student-booking')}
              isWaitingForQueue={shouldShowWaiting}
              queuePosition={1} // ตัวอย่างลำดับคิว
              onDebugSkipWaiting={() => setDebugForceShowHome(true)}
            />
          );
        case 'student-booking': return <BookingPage onBook={() => { }} onNavigateToHistory={() => setCurrentPage('student-history')} />;
        case 'student-history': return <StudentHistory appointments={appointments} />;
        case 'student-profile': return <StudentProfile profile={{ name: `${userData.firstName} ${userData.lastName}`, email: userData.cmuAccount || '', studentId: userData.studentProfile?.studentId || '', department: userData.studentProfile?.department || '', phone: userData.phoneNum || '-', enrollmentDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '-' }} onSave={() => { }} />;
        default: return <StudentHome appointments={appointments} onBookSession={() => setCurrentPage('student-booking')} />;
      }
    }

    if (userRole === 'counselor') {
      switch (currentPage) {
        case 'counselor-dashboard': return <CounselorDashboard waitingStudents={waitingStudents} todayAppointments={todayAppointments} totalCasesCount={0} onGenerateToken={() => ''} onScheduleAppointment={() => setCurrentPage('counselor-schedule')} />;
        case 'counselor-notes': return <CaseNotePage />;
        case 'counselor-schedule': return <ManageSchedule schedule={counselorSchedule} currentDate={scheduleDate} onScheduleChange={setCounselorSchedule} onDateChange={setScheduleDate} />;
        default: return <CounselorDashboard waitingStudents={waitingStudents} todayAppointments={todayAppointments} totalCasesCount={0} onGenerateToken={() => ''} onScheduleAppointment={() => setCurrentPage('counselor-schedule')} />;
      }
    }

    if (userRole === 'admin') {
      const defaultStats = { totalUsers: 0, activeStudents: 0, activeCounselors: 0, pendingApprovals: 0, totalSessions: 0, sessionsThisMonth: 0, upcomingSessions: 0, averageWaitTime: '0', topIssueTags: [] };
      switch (currentPage) {
        case 'admin-home': return <AdminHome stats={adminStats || defaultStats} onNavigateToApprovals={() => setCurrentPage('admin-users')} />;
        case 'admin-users': return <UserManagement users={allUsers} onApprove={fetchAdminData} onSuspend={fetchAdminData} />;
        default: return <AdminHome stats={adminStats || defaultStats} />;
      }
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-sans text-gray-500">กำลังตรวจสอบสิทธิ์...</div>;

  if (appState === 'error') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 font-sans text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <p className="text-xl font-bold mb-4">{errorMessage}</p>
      <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="bg-[#522d80] text-white px-6 py-2 rounded-xl">กลับไปหน้าหลัก</button>
    </div>
  );

  if (appState === 'landing') return <LandingPage onLoginSuccess={() => { window.location.href = API_ENDPOINTS.AUTH.CMU_ENTRANCE; }} />;

  return (
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID">
      <Layout userRole={userRole} currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
        {renderContent()}
      </Layout>
      {showPDPA && <PDPAModal onAccept={() => { localStorage.setItem('pdpa_accepted', 'true'); setShowPDPA(false); setShowToken(true); }} />}
      {showToken && <TokenModal onSubmit={() => { localStorage.setItem('token_submitted', 'true'); setShowToken(false); if (userRole) loadInitialData(userRole); }} />}
    </GoogleOAuthProvider>
  );
}