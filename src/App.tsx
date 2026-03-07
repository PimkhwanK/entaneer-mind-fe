import { useState, useEffect, useCallback, useMemo } from 'react';
import { LandingPage } from './components/LandingPage';
import { Layout } from './components/Layout';
import { PDPAModal } from './components/PDPAModal';
import { TokenModal } from './components/TokenModal';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AlertCircle, Timer, ArrowRight } from 'lucide-react';

import { API_ENDPOINTS, API_BASE_URL, getAuthHeader } from './config/api.config';
import type { UserRole, Appointment, WaitingClient, TodayAppointment, TimeBlock } from './types';

// ── Client Components (จาก Pimpit) ──
import { BookingPage } from './components/Client/BookingPage';
import { ClientHistory } from './components/Client/ClientHistory';
import { ClientProfile } from './components/Client/ClientProfile';
import { ClientHome } from './components/Client/ClientHome';

// ── Counselor Components ──
import { CounselorDashboard } from './components/counselor/CounselorDashboard';
import { CaseNotePage } from './components/counselor/CaseNotePage';
import { ManageSchedule } from './components/counselor/ManageSchedule';
import { CounselorUserManagement } from './components/counselor/CounselorUserManagement';
import { ReportGenerator } from './components/counselor/ReportGenerator';

// ── Admin Components ──
import { AdminHome } from './components/admin/AdminHome';
import { UserManagement } from './components/admin/UserManagement';

// ── Modal Components (จาก Pimpit) ──
import { UrgencyModal } from './components/ClientUrgencyPage';
// ── App ──
type AppState = 'loading' | 'landing' | 'app' | 'error';

function createHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { ...getAuthHeader(), ...extra };
}

export default function App() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<{ id: string; date: string; time: string; counselor: string }[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [counselorCount, setCounselorCount] = useState(0);
  const [appState, setAppState] = useState<AppState>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userData, setUserData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [showUrgency, setShowUrgency] = useState(false);
  const [showPDPA, setShowPDPA] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [debugForceShowHome, setDebugForceShowHome] = useState(false);

  const [appointments] = useState<Appointment[]>([]);
  const [waitingClients] = useState<WaitingClient[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [counselorSchedule, setCounselorSchedule] = useState<TimeBlock[]>([]);
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [adminStats, setAdminStats] = useState<any>(null);
  const [allUsers] = useState<any[]>([]);

  const hasUpcomingBooking = useMemo(() => upcomingAppointments.length > 0, [upcomingAppointments]);

  const counselorTodayAppointments = useMemo(() => {
    return todayAppointments.map((apt) => ({
      id: apt.id,
      time: apt.time,
      studentName: (apt as TodayAppointment & { studentName?: string }).studentName ?? apt.clientName,
      status: apt.status,
      caseCode: apt.caseCode,
    }));
  }, [todayAppointments]);

  const fetchClientData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/client-home`, { headers: createHeaders() });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'โหลดข้อมูลหน้าหลักไม่สำเร็จ');
      }

      setUpcomingAppointments(Array.isArray(data?.upcomingAppointments) ? data.upcomingAppointments : []);
      setCompletedCount(Number(data?.completedCount ?? 0));
      setCounselorCount(Number(data?.counselorCount ?? 0));
    } catch (e) {
      console.error(e);
      setUpcomingAppointments([]);
      setCompletedCount(0);
      setCounselorCount(0);
    }
  }, []);

  const fetchCounselorData = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.APPOINTMENTS.COUNSELOR_TODAY, { headers: createHeaders() });
      if (res.ok) setTodayAppointments(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchAdminData = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN.STATS, { headers: createHeaders() });
      if (res.ok) setAdminStats(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const loadInitialData = useCallback((role: string) => {
    const r = role.toLowerCase();
    if (r === 'client') { setCurrentPage('client-home'); fetchClientData(); }
    else if (r === 'counselor') { setCurrentPage('counselor-dashboard'); fetchCounselorData(); }
    else if (r === 'admin') { setCurrentPage('admin-home'); fetchAdminData(); }
  }, [fetchClientData, fetchCounselorData, fetchAdminData]);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setIsLoading(false); setAppState('landing'); return; }
    try {
      const response = await fetch(API_ENDPOINTS.USERS.ME, { headers: createHeaders({ 'Content-Type': 'application/json' }) });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        const role = (data.roleName || '').toLowerCase() as UserRole;
        setUserRole(role);
        // counselor ไม่ผ่าน urgency/PDPA/token flow → ไป dashboard เลย
        if (role === 'counselor') {
          loadInitialData(role);
        } else {
          if (localStorage.getItem('urgency_submitted') !== 'true') setShowUrgency(true);
          else if (localStorage.getItem('pdpa_accepted') !== 'true') setShowPDPA(true);
          else if (localStorage.getItem('token_submitted') !== 'true') setShowToken(true);
          else if (role) loadInitialData(role);
        }
        setAppState('app');
      } else { localStorage.removeItem('token'); setAppState('landing'); }
    } catch (error) { setAppState('error'); setErrorMessage('การเชื่อมต่อล้มเหลว'); }
    finally { setIsLoading(false); }
  }, [loadInitialData]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname === '/login-success' ? '/' : window.location.pathname);
    }
    checkAuth();
  }, [checkAuth]);

  const handleUrgencySubmit = async (text: string) => {
    try {
      const urgencyValue = text.trim() ? text.trim() : 'ไม่ได้ระบุ';
      localStorage.setItem('user_urgency', urgencyValue);
      localStorage.setItem('urgency_submitted', 'true');
      setShowUrgency(false);
      setShowPDPA(true);
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleTokenSubmit = async (code: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/cases/verify-code`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'รหัสไม่ถูกต้อง');
      }
      localStorage.setItem('token_submitted', 'true');
      setShowToken(false);
      alert('ลงทะเบียนสำเร็จ! กำลังเข้าสู่ระบบ...');
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'รหัสไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setAppState('landing');
    setUserRole(null);
    setUserData(null);
    setCurrentPage('');
    setDebugForceShowHome(false);
  };

  const renderContent = () => {
    if (!userRole || !userData || showUrgency || showPDPA || showToken) return null;

    // ── Client ──
    if (userRole === 'client') {
      const clientProfile = userData?.clientProfile || {};
      const cases = clientProfile.cases || [];
      const hasCase = cases.length > 0;
      const shouldShowWaiting = !hasCase && !debugForceShowHome;

      // หน้า Waiting: แสดงแทนทุก page ถ้ายังไม่มี case
      if (shouldShowWaiting) {
        return (
          <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center font-sans">
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <Timer className="w-12 h-12 text-[var(--color-accent-blue)] animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">ได้รับข้อมูลของคุณเรียบร้อยแล้ว</h1>
            <p className="text-lg text-gray-600 max-w-md mb-8 leading-relaxed">
              พี่ป๊อปกำลังพิจารณาและจัดสรรผู้ให้คำปรึกษาที่เหมาะสมกับคุณ
              เราจะแจ้งเตือนคุณผ่านทางหน้าเพจ, เว็บไซต์ และ Google Calendar เมื่อตารางเวลาลงตัว
            </p>
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 max-w-lg mb-8">
              <p className="text-amber-800 text-sm italic">"ระหว่างรอ... อย่าลืมใจดีกับตัวเองให้มากๆ นะครับ"</p>
            </div>
            <button
              onClick={() => setDebugForceShowHome(true)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-[var(--color-accent-blue)] transition-colors"
            >
              เข้าสู่หน้าหลักชั่วคราว (เพื่อการทดสอบ) <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );
      }

      switch (currentPage) {
        case 'client-home': return (
          <ClientHome
            upcomingAppointments={upcomingAppointments}
            completedCount={completedCount}
            counselorCount={counselorCount}
            onBookSession={() => setCurrentPage('client-booking')}
            onViewHistory={() => setCurrentPage('client-history')}
            isWaitingForQueue={shouldShowWaiting}
            onDebugSkipWaiting={() => setDebugForceShowHome(true)}
            hasExistingBooking={hasUpcomingBooking}
          />
        );
        case 'client-booking': return (
          <BookingPage
            onBook={() => { fetchClientData(); setCurrentPage('client-history'); }}
            onNavigateToHistory={() => setCurrentPage('client-history')}
            hasExistingBooking={hasUpcomingBooking}
          />
        );
        case 'client-history': return <ClientHistory appointments={appointments} />;
        case 'client-profile': return (
          <ClientProfile
            profile={{
              name: `${userData.firstName} ${userData.lastName}`,
              email: userData.cmuAccount || '',
              clientId: userData.clientProfile?.clientId || '',
              department: userData.clientProfile?.department || '',
              phone: userData.phoneNum || '-',
              enrollmentDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '-'
            }}
            onSave={() => { }}
          />
        );
        default: return (
          <ClientHome
            upcomingAppointments={appointments.filter(a => new Date(a.date) >= new Date()).map(a => ({
              id: a.id,
              date: a.date,
              time: a.time,
              counselor: a.counselor || ''
            }))}
            completedCount={appointments.filter(a => new Date(a.date) < new Date()).length}
            counselorCount={new Set(appointments.map(a => a.counselor)).size}
            onBookSession={() => setCurrentPage('client-booking')}
            onViewHistory={() => setCurrentPage('client-history')}
            hasExistingBooking={hasUpcomingBooking}
          />
        );
      }
    }

    // ── Counselor ──
    if (userRole === 'counselor') {

      // approve waiting → เรียก API PATCH case status
      const handleApproveWaiting = async (studentId: string) => {
        try {
          const res = await fetch(`${API_ENDPOINTS.USERS.ME.replace('/users/me', '')}/cases/${studentId}/appointment-status`, {
            method: 'PATCH',
            headers: createHeaders(),
            body: JSON.stringify({ status: 'active' }),
          });
          if (res.ok) fetchCounselorData();
        } catch (e) { console.error(e); }
      };

      // fetch report data จาก backend
      const handleFetchReport = async (from: string, to: string) => {
        const res = await fetch(
          `${API_BASE_URL}/counselor/report?startDate=${from}&endDate=${to}`,
          { headers: createHeaders() }
        );
        if (!res.ok) throw new Error('ดึงข้อมูล report ไม่สำเร็จ');
        const json = await res.json();
        const d = json.data;
        // Map backend format → ReportData
        return {
          period: { from, to },
          summary: {
            totalSessions: d.sessionStats?.total ?? 0,
            completedSessions: d.sessionStats?.byStatus?.completed ?? 0,
            cancelledSessions: d.sessionStats?.byStatus?.cancelled ?? 0,
            newClients: d.userStats?.byRole?.client ?? 0,
            averageWaitDays: d.caseStats?.byStatus?.waiting_confirmation ?? 0,
          },
          topTags: (d.topProblemTags ?? []).map((t: any) => ({ tag: t.label, count: t.count })),
          byDepartment: [],
          counselorWorkload: (d.counselorStats ?? []).map((c: any) => ({ name: c.name, sessions: c.sessionsCreated ?? 0 })),
          monthlySessions: [],
        };
      };

      switch (currentPage) {
        case 'counselor-dashboard': return (
          <CounselorDashboard
            waitingStudents={waitingClients.length > 0 ? waitingClients : undefined}
            todayAppointments={counselorTodayAppointments.length > 0 ? counselorTodayAppointments : undefined}
            totalCasesCount={128}
            onScheduleAppointment={() => setCurrentPage('counselor-schedule')}
            onNavigateToReport={() => setCurrentPage('counselor-report')}
            onApproveWaiting={handleApproveWaiting}
          />
        );
        case 'counselor-notes': return <CaseNotePage />;
        case 'counselor-schedule': return (
          <ManageSchedule
            schedule={counselorSchedule}
            currentDate={scheduleDate}
            onScheduleChange={setCounselorSchedule}
            onDateChange={setScheduleDate}
          />
        );
        case 'counselor-users': return <CounselorUserManagement />;
        case 'counselor-report': return <ReportGenerator onFetchReportData={handleFetchReport} />;
        default: return (
          <CounselorDashboard
            waitingStudents={waitingClients.length > 0 ? waitingClients : undefined}
            todayAppointments={counselorTodayAppointments.length > 0 ? counselorTodayAppointments : undefined}
            totalCasesCount={128}
            onScheduleAppointment={() => setCurrentPage('counselor-schedule')}
            onNavigateToReport={() => setCurrentPage('counselor-report')}
            onApproveWaiting={handleApproveWaiting}
          />
        );
      }
    }

    // ── Admin ──
    if (userRole === 'admin') {
      const stats = adminStats || {
        totalUsers: 0, activeClients: 0, activeCounselors: 0,
        pendingApprovals: 0, totalSessions: 0, sessionsThisMonth: 0,
        upcomingSessions: 0, averageWaitTime: '0', topIssueTags: []
      };
      switch (currentPage) {
        case 'admin-home': return <AdminHome stats={stats} onNavigateToApprovals={() => setCurrentPage('admin-users')} />;
        case 'admin-users': return <UserManagement users={allUsers} onApprove={fetchAdminData} onSuspend={fetchAdminData} />;
        default: return <AdminHome stats={stats} />;
      }
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">กำลังตรวจสอบสิทธิ์...</div>;
  if (appState === 'error') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <p className="text-xl font-bold mb-4">{errorMessage}</p>
      <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="bg-[#522d80] text-white px-6 py-2 rounded-xl">กลับไปหน้าหลัก</button>
    </div>
  );
  if (appState === 'landing') return <LandingPage onLoginSuccess={() => { window.location.href = API_ENDPOINTS.AUTH.CMU_ENTRANCE; }} />;

  return (
    <GoogleOAuthProvider clientId="633019458862-cfrtd22t900o6595dqou4v9os1ba800q.apps.googleusercontent.com">
      <Layout userRole={userRole} currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
        {renderContent()}
      </Layout>
      {showUrgency && <UrgencyModal onSubmit={(text: string) => handleUrgencySubmit(text)} />}
      {showPDPA && <PDPAModal onAccept={() => { localStorage.setItem('pdpa_accepted', 'true'); setShowPDPA(false); setShowToken(true); }} />}
      {showToken && <TokenModal onSubmit={handleTokenSubmit} />}
    </GoogleOAuthProvider>
  );
}