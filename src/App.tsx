import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { PDPAModal } from './components/PDPAModal';
import { TokenModal } from './components/TokenModal';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AlertCircle, RefreshCw } from 'lucide-react';

// API Config
import { API_ENDPOINTS, getAuthHeader } from './config/api.config';

// Types
import type { UserRole, Appointment, WaitingStudent, TodayAppointment, TimeBlock } from './types';

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

type AppState = 'landing' | 'login' | 'app' | 'error';

export default function App() {
  // --- States ---
  const [appState, setAppState] = useState<AppState>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userData, setUserData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('');
  const [showPDPA, setShowPDPA] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [appointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // --- Counselor States ---
  const [waitingStudents] = useState<WaitingStudent[]>([]);
  const [todayAppointments] = useState<TodayAppointment[]>([]);
  const [totalCasesCount] = useState(0);
  const [counselorSchedule, setCounselorSchedule] = useState<TimeBlock[]>([]);
  const [scheduleDate, setScheduleDate] = useState(new Date());

  // --- 1. Authentication Logic ---
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      setAppState('landing');
      return;
    }

    try {
      const authHeader = getAuthHeader();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(authHeader as Record<string, string>)
      };

      const response = await fetch(API_ENDPOINTS.USERS.ME, { headers });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        const role = data.roleName.toLowerCase() as UserRole;
        setUserRole(role);
        setAppState('app');

        // Initial Page Routing
        if (role === 'student') {
          setCurrentPage('student-home');
        } else if (role === 'counselor') {
          setCurrentPage('counselor-dashboard');
          fetchCounselorData();
        } else if (role === 'admin') {
          setCurrentPage('admin-home');
        }
      } else {
        localStorage.removeItem('token');
        setAppState('landing');
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAppState('error');
      setErrorMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ในขณะนี้');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. Data Fetching for Counselor ---
  const fetchCounselorData = async () => {
    try {
      const authHeader = getAuthHeader();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(authHeader as Record<string, string>)
      };
      // ใช้งาน headers เพื่อป้องกัน warning unused variable
      console.log("Fetching data with headers:", headers);
    } catch (error) {
      console.error("Failed to fetch counselor data:", error);
    }
  };

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
      window.history.replaceState({}, document.title, "/");
      checkAuth();
    } else {
      checkAuth();
    }
  }, []);

  // --- 3. Handlers ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    setAppState('landing');
    setUserRole(null);
    setUserData(null);
    setCurrentPage('');
  };

  const handleBookSession = (date: string, time: string, description: string) => {
    console.log("Booking requested:", { date, time, description });
    setCurrentPage('student-home');
  };

  const handleGenerateToken = () => {
    return 'T-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  // --- 4. Render Logic ---
  const renderContent = () => {
    if (!userRole || !userData) return null;

    if (userRole === 'student') {
      const hasCase = userData.studentProfile?.cases && userData.studentProfile.cases.length > 0;
      switch (currentPage) {
        case 'student-home':
          return (
            <StudentHome
              appointments={appointments}
              onBookSession={() => setCurrentPage('student-booking')}
              isWaitingForQueue={!hasCase}
            />
          );
        case 'student-booking':
          return <BookingPage onBook={handleBookSession} onNavigateToHistory={() => setCurrentPage('student-history')} />;
        case 'student-history':
          return <StudentHistory appointments={appointments} />;
        case 'student-profile':
          return (
            <StudentProfile
              profile={{
                name: `${userData.firstName} ${userData.lastName}`,
                email: userData.cmuAccount || '',
                studentId: userData.studentProfile?.studentId || '',
                department: userData.studentProfile?.department || '',
                phone: userData.phoneNum || '-',
                enrollmentDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '-',
              }}
              onSave={(p) => console.log(p)}
            />
          );
        default:
          return <StudentHome appointments={appointments} onBookSession={() => setCurrentPage('student-booking')} />;
      }
    }

    if (userRole === 'counselor') {
      switch (currentPage) {
        case 'counselor-dashboard':
          return (
            <CounselorDashboard
              waitingStudents={waitingStudents}
              todayAppointments={todayAppointments}
              totalCasesCount={totalCasesCount}
              onGenerateToken={handleGenerateToken}
              onScheduleAppointment={(studentId) => {
                console.log("Schedule for student:", studentId);
                setCurrentPage('counselor-schedule');
              }}
            />
          );
        case 'counselor-notes':
          return <CaseNotePage />;
        case 'counselor-schedule':
          return (
            <ManageSchedule
              schedule={counselorSchedule}
              currentDate={scheduleDate}
              onScheduleChange={setCounselorSchedule}
              onDateChange={setScheduleDate}
            />
          );
        default:
          return (
            <CounselorDashboard
              waitingStudents={waitingStudents}
              todayAppointments={todayAppointments}
              totalCasesCount={totalCasesCount}
              onGenerateToken={handleGenerateToken}
              onScheduleAppointment={() => setCurrentPage('counselor-schedule')}
            />
          );
      }
    }

    if (userRole === 'admin') {
      // แก้ไข: เพิ่ม topIssueTags ให้ครบตาม Interface AdminStats
      const adminStats = {
        totalUsers: 0,
        activeStudents: 0,
        activeCounselors: 0,
        pendingApprovals: 0,
        totalSessions: 0,
        sessionsThisMonth: 0,
        upcomingSessions: 0,
        averageWaitTime: '0',
        topIssueTags: [] // เพิ่มฟิลด์นี้เพื่อแก้ Error
      };

      switch (currentPage) {
        case 'admin-home': return <AdminHome stats={adminStats} onNavigateToApprovals={() => setCurrentPage('admin-users')} />;
        case 'admin-users': return <UserManagement users={[]} onApprove={() => { }} onSuspend={() => { }} />;
        default: return <AdminHome stats={adminStats} />;
      }
    }
  };

  // --- Loading & Error Screens ---
  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="w-12 h-12 border-4 border-[#522d80] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">กำลังตรวจสอบสิทธิ์...</p>
    </div>
  );

  if (appState === 'error') return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-red-50">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-gray-600 mb-8">{errorMessage}</p>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            setAppState('landing');
            window.location.href = '/';
          }}
          className="w-full flex items-center justify-center gap-2 bg-[#522d80] text-white py-4 rounded-2xl font-bold hover:bg-[#432468] transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          กลับไปหน้าหลัก
        </button>
      </div>
    </div>
  );

  if (appState === 'landing') return <LandingPage onLoginSuccess={checkAuth} />;
  if (appState === 'login') return <LoginPage onLogin={() => { }} onBack={() => setAppState('landing')} />;

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

      {showPDPA && <PDPAModal onAccept={() => { setShowPDPA(false); setShowToken(true); }} />}
      {showToken && <TokenModal onSubmit={() => setShowToken(false)} />}
    </GoogleOAuthProvider>
  );
}