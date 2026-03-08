import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LandingPage } from './components/LandingPage';
import { Layout } from './components/Layout';
import { PDPAModal } from './components/PDPAModal';
import { TokenModal } from './components/TokenModal';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AlertCircle } from 'lucide-react';

import { API_ENDPOINTS, API_BASE_URL, getAuthHeader } from './config/api.config';
import type { UserRole, Appointment, TodayAppointment, TimeBlock } from './types';

import { BookingPage } from './components/Client/BookingPage';
import { ClientHistory } from './components/Client/ClientHistory';
import { ClientProfile } from './components/Client/ClientProfile';
import { ClientHome } from './components/Client/ClientHome';

import { CounselorDashboard } from './components/counselor/CounselorDashboard';
import { CaseNotePage } from './components/counselor/CaseNotePage';
import { ManageSchedule } from './components/counselor/ManageSchedule';
import { CounselorUserManagement } from './components/counselor/CounselorUserManagement';
import { ReportGenerator } from './components/counselor/ReportGenerator';

import { AdminHome } from './components/admin/AdminHome';
import { UserManagement } from './components/admin/UserManagement';
import { UrgencyModal } from './components/ClientUrgencyPage';
import { WaitingPage } from './components/Client/WaitingPage';

type AppState = 'loading' | 'landing' | 'app' | 'error';

function createHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { ...getAuthHeader(), ...extra };
}

const PAGE_KEY = 'em_current_page';
const getSavedPage = () => { try { return localStorage.getItem(PAGE_KEY) || ''; } catch { return ''; } };
const savePage = (p: string) => { try { localStorage.setItem(PAGE_KEY, p); } catch { } };

export default function App() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<{ id: string; date: string; time: string; counselor: string }[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [counselorCount, setCounselorCount] = useState(0);
  const [appState, setAppState] = useState<AppState>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userData, setUserData] = useState<any>(null);
  const [currentPage, _setCurrentPage] = useState(getSavedPage());
  const [errorMessage, setErrorMessage] = useState('');
  const [showUrgency, setShowUrgency] = useState(false);
  const [showPDPA, setShowPDPA] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [debugForceShowHome, setDebugForceShowHome] = useState(false);
  const [appointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [counselorSchedule, setCounselorSchedule] = useState<TimeBlock[]>([]);
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [adminStats, setAdminStats] = useState<any>(null);
  const [allUsers] = useState<any[]>([]);
  const [waitingCases, setWaitingCases] = useState<any[]>([]);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const setCurrentPage = useCallback((page: string) => {
    _setCurrentPage(page);
    savePage(page);
  }, []);

  const hasUpcomingBooking = useMemo(() => upcomingAppointments.length > 0, [upcomingAppointments]);

  const counselorTodayAppointments = useMemo(() => {
    return todayAppointments.map((apt) => ({
      id: apt.id,
      time: apt.time,
      studentName: (apt as any).studentName ?? apt.clientName,
      status: apt.status,
      caseCode: apt.caseCode,
    }));
  }, [todayAppointments]);

  const fetchClientData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/client-home`, { headers: createHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'โหลดข้อมูลหน้าหลักไม่สำเร็จ');
      setUpcomingAppointments(Array.isArray(data?.upcomingAppointments) ? data.upcomingAppointments : []);
      setCompletedCount(Number(data?.completedCount ?? 0));
      setCounselorCount(Number(data?.counselorCount ?? 0));
    } catch (e) {
      console.error(e);
      setUpcomingAppointments([]); setCompletedCount(0); setCounselorCount(0);
    }
  }, []);

  const fetchCounselorData = useCallback(async () => {
    // ดึง today appointments จาก /counselor/schedule (endpoint เดียวที่มีจริง)
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_BASE_URL}/counselor/schedule?startDate=${today}&endDate=${today}`, { headers: createHeaders() });
      if (res.ok) {
        const json = await res.json();
        const sessions: any[] = json.data?.sessions ?? [];
        const mapped: TodayAppointment[] = sessions
          .filter((s: any) => ['booked', 'completed'].includes(s.status))
          .map((s: any) => ({
            id: String(s.sessionId),
            time: s.timeStart ? new Date(s.timeStart).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-',
            clientName: s.case?.client?.name ?? '-',
            studentName: s.case?.client?.name ?? '-',
            status: (s.status === 'completed' ? 'completed' : 'pending') as 'pending' | 'in-progress' | 'completed',
            caseCode: s.case ? `CASE-${s.case.caseId}` : '-',
          }));
        setTodayAppointments(mapped);
      }
    } catch (e) { console.error(e); }

    try {
      // ดึง waiting clients จาก /counselor/users
      // getAllUsers ส่งมาในรูป { success, data: { summary, users: [...] } }
      // แต่ละ client user มี waitingCaseId ที่ backend เพิ่มให้แล้ว
      const res = await fetch(`${API_BASE_URL}/counselor/users?role=client`, { headers: createHeaders() });
      if (res.ok) {
        const json = await res.json();
        const users: any[] = json.data?.users ?? json.users ?? [];
        const waiting = users
          .filter((u: any) => u.waitingCaseId != null)
          .map((u: any) => ({
            id: String(u.userId),
            name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
            waitingSince: u.createdAt
              ? new Date(u.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
              : '-',
            urgency: 'medium' as const,
            caseId: u.waitingCaseId,
            caseStats: u.caseStats,
          }));
        setWaitingCases(waiting);
      }
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
    const saved = getSavedPage();
    const validMap: Record<string, string[]> = {
      client: ['client-home', 'client-booking', 'client-history', 'client-profile'],
      counselor: ['counselor-dashboard', 'counselor-notes', 'counselor-schedule', 'counselor-users', 'counselor-report'],
      admin: ['admin-home', 'admin-users'],
    };
    const defaults: Record<string, string> = { client: 'client-home', counselor: 'counselor-dashboard', admin: 'admin-home' };
    const initialPage = (saved && validMap[r]?.includes(saved)) ? saved : (defaults[r] ?? '');
    setCurrentPage(initialPage);
    if (r === 'client') fetchClientData();
    else if (r === 'counselor') fetchCounselorData();
    else if (r === 'admin') fetchAdminData();
  }, [fetchClientData, fetchCounselorData, fetchAdminData, setCurrentPage]);

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
        if (role === 'counselor') {
          loadInitialData(role);
        } else if (role === 'client') {
          const flowStatus = (data.flowStatus ?? 'normal') as string;
          // Flow: login → urgency → PDPA → token → waiting → home
          if (flowStatus === 'require_consent') {
            // ยังไม่ยอมรับ PDPA → ต้องผ่าน urgency ก่อน แล้วค่อย PDPA
            localStorage.removeItem('pdpa_accepted');
            localStorage.removeItem('urgency_submitted');
            setShowUrgency(true);
          } else if (flowStatus === 'require_token') {
            // ยอมรับ PDPA แล้ว แต่ยังไม่มี token
            localStorage.removeItem('token_submitted');
            setShowToken(true);
          } else if (flowStatus === 'waiting_approval') {
            // มี token แล้ว รอ counselor ยืนยัน → เข้า app แต่จะเห็น waiting screen
            loadInitialData(role);
          } else {
            // normal — เข้าแอปได้เลย
            loadInitialData(role);
          }
        } else {
          if (role) loadInitialData(role);
        }
        setAppState('app');
      } else { localStorage.removeItem('token'); setAppState('landing'); }
    } catch { setAppState('error'); setErrorMessage('การเชื่อมต่อล้มเหลว'); }
    finally { setIsLoading(false); }
  }, [loadInitialData]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      window.history.replaceState({}, document.title,
        window.location.pathname === '/login-success' ? '/' : window.location.pathname);
    }
    checkAuth();
  }, [checkAuth]);

  // auto-refresh ทุก 30 วินาที
  useEffect(() => {
    if (appState !== 'app') return;
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    refreshTimer.current = setInterval(() => {
      if (userRole === 'client') fetchClientData();
      else if (userRole === 'counselor') fetchCounselorData();
    }, 30_000);
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [appState, userRole, fetchClientData, fetchCounselorData]);

  const handleUrgencySubmit = async (urgencyLevel: string, urgencyDetails: string) => {
    // บันทึก urgency ไป backend (PATCH case priority)
    try {
      await fetch(`${API_BASE_URL}/cases/urgency`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ urgencyLevel, urgencyDetails }),
      });
    } catch (e) {
      console.warn('urgency submit failed (non-blocking):', e);
    }
    localStorage.setItem('urgency_submitted', 'true');
    setShowUrgency(false);
    setShowPDPA(true);
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
      // สำเร็จ → ปิด modal แล้ว re-fetch userData ใหม่ (flowStatus จะเปลี่ยนเป็น waiting_approval)
      setShowToken(false);
      setIsLoading(true);
      await checkAuth();
    } catch (error: any) {
      alert(error.message || 'รหัสไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    savePage('');
    setAppState('landing');
    setUserRole(null);
    setUserData(null);
    _setCurrentPage('');
    setDebugForceShowHome(false);
  };

  const renderContent = () => {
    if (!userRole || !userData || showUrgency || showPDPA || showToken) return null;

    // ── Client ──────────────────────────────────────────────────────────────
    if (userRole === 'client') {
      const clientProfile = userData?.clientProfile || {};
      const cases = clientProfile.cases || [];
      const flowStatus = userData?.flowStatus ?? 'normal';
      // waiting screen ถ้า: ไม่มี case หรือ case อยู่ในสถานะ waiting_confirmation
      const shouldShowWaiting = (cases.length === 0 || flowStatus === 'waiting_approval') && !debugForceShowHome;

      if (shouldShowWaiting) {
        return null; // จะ render WaitingPage นอก Layout แทน
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
            userPhone={userData?.phoneNum ?? ''}
            onPhoneUpdate={async (phone: string) => {
              try {
                await fetch(`${API_BASE_URL}/client/profile`, {
                  method: 'PUT',
                  headers: createHeaders(),
                  body: JSON.stringify({
                    name: `${userData?.firstName ?? ''} ${userData?.lastName ?? ''}`.trim(),
                    phone,
                  }),
                });
                setUserData((prev: any) => ({ ...prev, phoneNum: phone }));
              } catch (e) { console.error(e); }
            }}
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
            onSave={async (updated?: any) => {
              if (updated?.phone) {
                setUserData((prev: any) => ({ ...prev, phoneNum: updated.phone }));
              }
            }}
          />
        );
        default: return (
          <ClientHome
            upcomingAppointments={upcomingAppointments}
            completedCount={completedCount}
            counselorCount={counselorCount}
            onBookSession={() => setCurrentPage('client-booking')}
            onViewHistory={() => setCurrentPage('client-history')}
            hasExistingBooking={hasUpcomingBooking}
          />
        );
      }
    }

    // ── Counselor ────────────────────────────────────────────────────────────
    if (userRole === 'counselor') {

      const handleApproveWaiting = async (userId: string) => {
        try {
          // ใช้ caseId ที่เก็บไว้ใน waitingCases แล้วตั้งแต่ตอน fetch
          const target = waitingCases.find((w: any) => String(w.id) === String(userId));
          const activeCaseId = target?.caseId ?? null;

          if (!activeCaseId) {
            alert('ไม่พบ case ที่รอการยืนยัน กรุณา refresh แล้วลองใหม่');
            return;
          }

          const res = await fetch(`${API_BASE_URL}/cases/${activeCaseId}/appointment-status`, {
            method: 'PATCH', headers: createHeaders(),
            body: JSON.stringify({ status: 'confirmed' }),
          });
          if (res.ok) {
            setWaitingCases(prev => prev.filter((w: any) => String(w.id) !== String(userId)));
            await fetchCounselorData();
          }
          else { const err = await res.json().catch(() => ({})); alert(err?.message || 'ยืนยันไม่สำเร็จ'); }
        } catch (e) { console.error(e); }
      };

      const handleFetchReport = async (from: string, to: string) => {
        const res = await fetch(`${API_BASE_URL}/counselor/report?startDate=${from}&endDate=${to}`, { headers: createHeaders() });
        if (!res.ok) throw new Error('ดึงข้อมูล report ไม่สำเร็จ');
        const json = await res.json();
        const d = json.data;
        return {
          period: { from, to },
          summary: {
            totalSessions: d.sessionStats?.total ?? 0,
            completedSessions: d.sessionStats?.byStatus?.completed ?? 0,
            cancelledSessions: d.sessionStats?.byStatus?.cancelled ?? 0,
            newClients: d.userStats?.byRole?.client ?? 0,
            averageWaitDays: d.averageWaitDays ?? d.caseStats?.averageWaitDays ?? 0,
          },
          topTags: (d.topProblemTags ?? []).map((t: any) => ({ tag: t.label, count: t.count })),
          byDepartment: [],
          counselorWorkload: (d.counselorStats ?? []).map((c: any) => ({ name: c.name, sessions: c.sessionsCreated ?? 0 })),
          monthlySessions: [],
        };
      };

      // สร้าง registration token → POST /api/counselor/tokens
      // TODO: Uro ต้องเพิ่ม POST /api/counselor/tokens ใน counselorController+Routes
      //       ให้ create RegistrationCode ใน DB แล้ว return { id, token/code, isUsed }
      // ⚠️ NOTE FOR URO: ต้องเพิ่ม POST /api/counselor/tokens ใน counselorRoutes.ts
      // Body: { code: string } → บันทึกลง RegistrationCode table
      // ตอนนี้ถ้า endpoint ยังไม่มี token จะ save แค่ local state (หายตอน refresh)
      const handleCreateToken = async (tokenCode: string) => {
        try {
          const res = await fetch(`${API_BASE_URL}/counselor/tokens`, {
            method: 'POST',
            headers: createHeaders(),
            body: JSON.stringify({ code: tokenCode }),
          });
          if (res.ok) return res.json();
          console.warn('POST /counselor/tokens ยังไม่มี endpoint → save local only');
          return { success: true, code: tokenCode };
        } catch (e) {
          console.warn('handleCreateToken error:', e);
          return { success: true, code: tokenCode };
        }
      };

      switch (currentPage) {
        case 'counselor-dashboard': return (
          <CounselorDashboard
            waitingStudents={waitingCases.length > 0 ? waitingCases : undefined}
            todayAppointments={counselorTodayAppointments.length > 0 ? counselorTodayAppointments : undefined}
            totalCasesCount={waitingCases.length}
            onScheduleAppointment={() => setCurrentPage('counselor-schedule')}
            onNavigateToReport={() => setCurrentPage('counselor-report')}
            onApproveWaiting={handleApproveWaiting}
            onCreateToken={handleCreateToken}
          />
        );
        case 'counselor-notes': return <CaseNotePage />;
        case 'counselor-schedule': return (
          <ManageSchedule
            schedule={counselorSchedule}
            currentDate={scheduleDate}
            onScheduleChange={setCounselorSchedule}
            onDateChange={setScheduleDate}
            currentCounselorId={userData?.counselorProfile?.counselorId ?? null}
          />
        );
        case 'counselor-users': return (
          <CounselorUserManagement
            onApprove={async (id) => { await handleApproveWaiting(id); fetchCounselorData(); }}
            onRoleChange={async (id, newRole) => {
              try {
                await fetch(`${API_BASE_URL}/counselor/users/${id}/role`, {
                  method: 'PATCH', headers: createHeaders(),
                  body: JSON.stringify({ roleName: newRole }),
                });
                fetchCounselorData();
              } catch (e) { console.error(e); }
            }}
          />
        );
        case 'counselor-report': return <ReportGenerator onFetchReportData={handleFetchReport} />;
        default: return (
          <CounselorDashboard
            waitingStudents={waitingCases.length > 0 ? waitingCases : undefined}
            todayAppointments={counselorTodayAppointments.length > 0 ? counselorTodayAppointments : undefined}
            totalCasesCount={waitingCases.length}
            onScheduleAppointment={() => setCurrentPage('counselor-schedule')}
            onNavigateToReport={() => setCurrentPage('counselor-report')}
            onApproveWaiting={handleApproveWaiting}
            onCreateToken={handleCreateToken}
          />
        );
      }
    }

    // ── Admin ────────────────────────────────────────────────────────────────
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

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin opacity-50" />
    </div>
  );
  if (appState === 'error') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <p className="text-xl font-bold mb-4">{errorMessage}</p>
      <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="bg-[#522d80] text-white px-6 py-2 rounded-xl">กลับไปหน้าหลัก</button>
    </div>
  );
  if (appState === 'landing') return <LandingPage onLoginSuccess={() => { window.location.href = API_ENDPOINTS.AUTH.CMU_ENTRANCE; }} />;

  // WaitingPage — render นอก Layout (ไม่มี navbar)
  if (userRole === 'client' && !showUrgency && !showPDPA && !showToken) {
    const clientProfile = userData?.clientProfile || {};
    const cases = clientProfile?.cases || [];
    const flowStatus = userData?.flowStatus ?? 'normal';
    const shouldShowWaiting = (cases.length === 0 || flowStatus === 'waiting_approval') && !debugForceShowHome;
    if (shouldShowWaiting) {
      return (
        <WaitingPage
          userName={userData?.firstName ?? userData?.name ?? undefined}
        />
      );
    }
  }

  return (
    <GoogleOAuthProvider clientId="633019458862-cfrtd22t900o6595dqou4v9os1ba800q.apps.googleusercontent.com">
      <Layout userRole={userRole} currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
        {renderContent()}
      </Layout>
      {showUrgency && <UrgencyModal onSubmit={(level: string, details: string) => handleUrgencySubmit(level, details)} />}
      {showPDPA && <PDPAModal onAccept={async () => {
        try {
          await fetch(`${API_BASE_URL}/users/accept-consent`, {
            method: 'POST',
            headers: createHeaders(),
          });
        } catch (e) {
          console.warn('accept-consent failed:', e);
        }
        setShowPDPA(false);
        setShowToken(true);
      }} />}
      {showToken && <TokenModal onSubmit={handleTokenSubmit} />}
    </GoogleOAuthProvider>
  );
}