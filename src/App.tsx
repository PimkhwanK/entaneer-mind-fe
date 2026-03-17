import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LandingPage } from './components/LandingPage';
import { Layout } from './components/Layout';
import { PDPAModal } from './components/PDPAModal';
import { TokenModal } from './components/TokenModal';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AlertCircle } from 'lucide-react';

<<<<<<< HEAD
import { API_ENDPOINTS, API_BASE_URL, getAuthHeader } from './config/api.config';
import type { UserRole, TodayAppointment, TimeBlock } from './types';

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

type ClientHistoryAppointment = {
  id: string;
  date?: string;
  time?: string;
  timeStart?: string | null;
  counselor: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  sessionToken?: string;
};

function createHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { ...getAuthHeader(), ...extra };
}

const PAGE_KEY = 'em_current_page';
const getSavedPage = () => {
  try {
    return localStorage.getItem(PAGE_KEY) || '';
  } catch {
    return '';
=======
import { API_ENDPOINTS, getAuthHeader } from './config/api.config';
import type { UserRole, Appointment, WaitingClient, TodayAppointment, TimeBlock } from './types';

// Components
import { BookingPage } from './components/Client/BookingPage';
import { ClientHistory } from './components/Client/ClientHistory';
import { ClientProfile } from './components/Client/ClientProfile';
import { CounselorDashboard } from './components/counselor/CounselorDashboard';
import { CaseNotePage } from './components/counselor/CaseNotePage';
import { ManageSchedule } from './components/counselor/ManageSchedule';
import { UrgencyModal } from './components/ClientUrgencyPage'; 

// --- Interface & Component: ClientHome ---
interface ClientHomeProps {
  onBookSession: () => void;
  onViewHistory: () => void;
  appointments: Appointment[];
  isWaitingForQueue?: boolean;
  queuePosition?: number;
  onDebugSkipWaiting?: () => void;
  hasExistingBooking: boolean;
}

const dailyQuotes = [
  "สุขภาพจิตของคุณคือสิ่งสำคัญ ความสุขของคุณเป็นเรื่องจำเป็น การดูแลตัวเองเป็นเรื่องที่ต้องทำ",
  "ความคิดบวกเพียงเล็กน้อยสามารถเปลี่ยนวันทั้งวันของคุณได้",
  "ไม่เป็นไรถ้าคุณจะรู้สึกไม่โอเค เราพร้อมรับฟังและอยู่ตรงนี้เพื่อคุณ",
  "การเยียวยาต้องใช้เวลา ให้ความพยายามกับตัวเองอย่างใจเย็นนะ",
  "คุณเข้มแข็งกว่าที่คุณคิด และกล้าหาญกว่าที่คุณเชื่อ",
];

export function ClientHome({
  onBookSession,
  onViewHistory,
  appointments: initialAppointments,
  isWaitingForQueue = false,
  onDebugSkipWaiting,
  hasExistingBooking
}: ClientHomeProps) {
  const appointments: Appointment[] = initialAppointments?.length > 0 ? initialAppointments : [
    { id: '1', date: '15 ม.ค. 2569', time: '10:00', counselor: 'พี่ป๊อป (ห้อง 1)', status: 'upcoming' },
    { id: '2', date: '12 ม.ค. 2569', time: '14:30', counselor: 'พี่ป๊อป (ห้อง 1)', status: 'completed' },
    { id: '3', date: '05 ม.ค. 2569', time: '09:00', counselor: 'พี่น้ำขิง (ห้อง 2)', status: 'completed' }
  ];

  const todayQuote = dailyQuotes[new Date().getDay() % dailyQuotes.length];
  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');

  if (isWaitingForQueue) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <div className="relative">
            <Timer className="w-12 h-12 text-[var(--color-accent-blue)] animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">ได้รับข้อมูลของคุณเรียบร้อยแล้ว</h1>
        <p className="text-lg text-gray-600 max-w-md mb-8 leading-relaxed">
          พี่ป๊อปกำลังพิจารณาและจัดสรรผู้ให้คำปรึกษาที่เหมาะสมกับคุณ
          เราจะแจ้งเตือนคุณผ่านทางหน้าเพจ, เว็บไซต์ และ Google Calendar เมื่อตารางเวลาลงตัว
        </p>
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 max-w-lg mb-8">
          <p className="text-amber-800 text-sm italic">"ระหว่างรอ... อย่าลืมใจดีกับตัวเองให้มากๆ นะครับ"</p>
        </div>
        <button onClick={onDebugSkipWaiting} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[var(--color-accent-blue)]">
          เข้าสู่หน้าหลักชั่วคราว (เพื่อการทดสอบ) <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
  }
};
const savePage = (p: string) => {
  try {
    localStorage.setItem(PAGE_KEY, p);
  } catch {}
};

export default function App() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    { id: string; date: string; time: string; counselor: string }[]
  >([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [counselorCount, setCounselorCount] = useState(0);
  const [appState, setAppState] = useState<AppState>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userData, setUserData] = useState<any>(null);
  const [currentPage, _setCurrentPage] = useState(getSavedPage());
  const [errorMessage, setErrorMessage] = useState('');
<<<<<<< HEAD
  const [showUrgency, setShowUrgency] = useState(false);
  const [showPDPA, setShowPDPA] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [debugForceShowHome, setDebugForceShowHome] = useState(false);
  const [appointments, setAppointments] = useState<ClientHistoryAppointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
=======
  const [showUrgency,setShowUrgency] = useState(false);
  const [showPDPA, setShowPDPA] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [debugForceShowHome, setDebugForceShowHome] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [waitingClients, setWaitingClients] = useState<WaitingClient[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
  const [counselorSchedule, setCounselorSchedule] = useState<TimeBlock[]>([]);
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [adminStats, setAdminStats] = useState<any>(null);
  const [allUsers] = useState<any[]>([]);
  const [waitingCases, setWaitingCases] = useState<any[]>([]);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

<<<<<<< HEAD
  const setCurrentPage = useCallback((page: string) => {
    _setCurrentPage(page);
    savePage(page);
=======
  // Logic ตรวจสอบว่ามีนัดหมายที่ยังไม่เกิดขึ้นหรือไม่
  const hasUpcomingBooking = useMemo(() => {
    return appointments.some(apt => apt.status === 'upcoming');
  }, [appointments]);

  const createHeaders = (additional: Record<string, string> = {}) => ({ ...additional, ...(getAuthHeader() as Record<string, string>) } as HeadersInit);

  const fetchClientData = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.APPOINTMENTS.MY, { headers: createHeaders() });
      if (res.ok) setAppointments(await res.json());
      else setAppointments([]);
    } catch (e) { setAppointments([]); }
  };

  const fetchCounselorData = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.APPOINTMENTS.COUNSELOR_TODAY, { headers: createHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTodayAppointments(data.appointments || []);
        setWaitingClients(data.waiting || []);
      }
    } catch (e) { console.error(e); }
  };

  const loadInitialData = useCallback((role: string) => {
    const r = role.toLowerCase();
    if (r === 'client') { setCurrentPage('client-home'); fetchClientData(); }
    else if (r === 'counselor') { setCurrentPage('counselor-dashboard'); fetchCounselorData(); }
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
  }, []);

 const hasUpcomingBooking = useMemo(() => {
  return (
    upcomingAppointments.length > 0 ||
    appointments.some((apt) => apt.status === 'upcoming')
    );
  }, [upcomingAppointments, appointments]);

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
      setUpcomingAppointments([]);
      setCompletedCount(0);
      setCounselorCount(0);
    }
  }, []);

  const fetchClientHistory = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.SESSIONS.HISTORY, {
        headers: createHeaders(),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'โหลดประวัติการนัดหมายไม่สำเร็จ');
      }

      const rawAppointments = Array.isArray(data?.appointments) ? data.appointments : [];

      const mapped: ClientHistoryAppointment[] = rawAppointments.map((apt: any) => ({
        id: String(apt.id ?? apt.sessionId),
        date: apt.timeStart
          ? new Date(apt.timeStart).toLocaleDateString('en-GB')
          : (apt.date ?? '—'),
        time: apt.timeStart
          ? new Date(apt.timeStart).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          : (apt.time ?? '—'),
        timeStart: apt.timeStart ?? null,
        counselor: apt.counselor ?? 'ห้อง',
        status: apt.status ?? 'completed',
        notes: apt.notes ?? '—',
        sessionToken: apt.sessionToken ?? apt.caseCode ?? undefined,
      }));

      setAppointments(mapped);
    } catch (e) {
      console.error('fetchClientHistory error:', e);
      setAppointments([]);
    }
  }, []);

  const fetchCounselorData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_BASE_URL}/counselor/schedule?startDate=${today}&endDate=${today}`, {
        headers: createHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        const sessions: any[] = json.data?.sessions ?? [];
        const mapped: TodayAppointment[] = sessions
          .filter((s: any) => ['booked', 'completed'].includes(s.status))
          .map((s: any) => ({
            id: String(s.sessionId),
            time: s.timeStart
              ? new Date(s.timeStart).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
              : '-',
            clientName: s.case?.client?.name ?? '-',
            studentName: s.case?.client?.name ?? '-',
            status: (s.status === 'completed' ? 'completed' : 'pending') as 'pending' | 'in-progress' | 'completed',
            caseCode: s.case ? `CASE-${s.case.caseId}` : '-',
          }));
        setTodayAppointments(mapped);
      }
    } catch (e) {
      console.error(e);
    }

    try {
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
              ? new Date(u.createdAt).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '-',
            urgency: 'medium' as const,
            caseId: u.waitingCaseId,
            caseStats: u.caseStats,
          }));
        setWaitingCases(waiting);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchAdminData = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN.STATS, { headers: createHeaders() });
      if (res.ok) setAdminStats(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadInitialData = useCallback(
    (role: string) => {
      const r = role.toLowerCase();
      const saved = getSavedPage();

      const validMap: Record<string, string[]> = {
        client: ['client-home', 'client-booking', 'client-history', 'client-profile'],
        counselor: ['counselor-dashboard', 'counselor-notes', 'counselor-schedule', 'counselor-users', 'counselor-report'],
        admin: ['admin-home', 'admin-users'],
      };

      const defaults: Record<string, string> = {
        client: 'client-home',
        counselor: 'counselor-dashboard',
        admin: 'admin-home',
      };

      const initialPage = saved && validMap[r]?.includes(saved) ? saved : (defaults[r] ?? '');
      setCurrentPage(initialPage);

      if (r === 'client') {
        fetchClientData();
        fetchClientHistory();
      } else if (r === 'counselor') {
        fetchCounselorData();
      } else if (r === 'admin') {
        fetchAdminData();
      }
    },
    [fetchClientData, fetchClientHistory, fetchCounselorData, fetchAdminData, setCurrentPage]
  );

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsLoading(false);
      setAppState('landing');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.USERS.ME, {
        headers: createHeaders({ 'Content-Type': 'application/json' }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);

        const role = (data.roleName || '').toLowerCase() as UserRole;
        setUserRole(role);
<<<<<<< HEAD

        if (role === 'counselor') {
          loadInitialData(role);
        } else if (role === 'client') {
          const flowStatus = (data.flowStatus ?? 'normal') as string;

          if (flowStatus === 'require_consent') {
            localStorage.removeItem('pdpa_accepted');
            localStorage.removeItem('urgency_submitted');
            setShowUrgency(true);
          } else if (flowStatus === 'require_token') {
            localStorage.removeItem('token_submitted');
            setShowToken(true);
          } else if (flowStatus === 'waiting_approval') {
            loadInitialData(role);
          } else {
            loadInitialData(role);
          }
        } else {
          if (role) loadInitialData(role);
        }

=======
        if(localStorage.getItem('urgency_submitted') !== 'true') setShowUrgency(true);
        else if (localStorage.getItem('pdpa_accepted') !== 'true') setShowPDPA(true);
        else if (localStorage.getItem('token_submitted') !== 'true') setShowToken(true);
        else if (role) loadInitialData(role);
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
        setAppState('app');
      } else {
        localStorage.removeItem('token');
        setAppState('landing');
      }
    } catch {
      setAppState('error');
      setErrorMessage('การเชื่อมต่อล้มเหลว');
    } finally {
      setIsLoading(false);
    }
  }, [loadInitialData]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname === '/login-success' ? '/' : window.location.pathname
      );
    }

    checkAuth();
  }, [checkAuth]);

<<<<<<< HEAD
  useEffect(() => {
    if (userRole === 'client' && currentPage === 'client-history') {
      fetchClientHistory();
    }
  }, [userRole, currentPage, fetchClientHistory]);

  useEffect(() => {
    if (appState !== 'app') return;

    if (refreshTimer.current) clearInterval(refreshTimer.current);

    refreshTimer.current = setInterval(() => {
      if (userRole === 'client') {
        fetchClientData();
        if (currentPage === 'client-history') {
          fetchClientHistory();
        }
      } else if (userRole === 'counselor') {
        fetchCounselorData();
      }
    }, 30_000);

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [appState, userRole, currentPage, fetchClientData, fetchClientHistory, fetchCounselorData]);

  const handleUrgencySubmit = async (urgencyLevel: string, urgencyDetails: string) => {
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

=======
  const handleUrgencySubmit = async (text: string) => {
    try {
      const urgencyValue = text.trim() ? text.trim() : "ไม่ได้ระบุ";

      localStorage.setItem('user_urgency', urgencyValue);
      localStorage.setItem('urgency_submitted', 'true');
    
    alert("บันทึกเรียบร้อยแล้ว");
  } catch (error: any) {
    console.error(error);
    alert("เกิดข้อผิดพลาดในการบันทึก");
  }
  };

  

>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
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

      setShowToken(false);
<<<<<<< HEAD
      setIsLoading(true);
      await checkAuth();
    } catch (error: any) {
      alert(error.message || 'รหัสไม่ถูกต้อง');
=======
      alert("ลงทะเบียนสำเร็จ! กำลังเข้าสู่ระบบ...");
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "รหัสไม่ถูกต้อง");
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
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
<<<<<<< HEAD

    if (userRole === 'client') {
      const clientProfile = userData?.clientProfile || {};
      const cases = clientProfile.cases || [];
      const flowStatus = userData?.flowStatus ?? 'normal';
      const shouldShowWaiting = (cases.length === 0 || flowStatus === 'waiting_approval') && !debugForceShowHome;

      if (shouldShowWaiting) {
        return null;
      }

      switch (currentPage) {
        case 'client-home':
          return (
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

        case 'client-booking':
          return (
            <BookingPage
              onBook={() => {
                fetchClientData();
                fetchClientHistory();
                setCurrentPage('client-history');
              }}
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
                } catch (e) {
                  console.error(e);
                }
              }}
            />
          );

        case 'client-history':
          return (
            <ClientHistory
              appointments={appointments}
              onCancelAppointment={async (id: string) => {
                const res = await fetch(API_ENDPOINTS.SESSIONS.CANCEL(Number(id)), {
                  method: 'POST',
                  headers: createHeaders(),
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                  throw new Error(data?.message || 'ยกเลิกนัดหมายไม่สำเร็จ');
                }

                await fetchClientHistory();
                await fetchClientData();
              }}
            />
          );

        case 'client-profile':
          return (
            <ClientProfile
              profile={{
                name: `${userData.firstName} ${userData.lastName}`,
                email: userData.cmuAccount || '',
                clientId: userData.clientProfile?.clientId || '',
                department: userData.clientProfile?.department || '',
                phone: userData.phoneNum || '-',
                enrollmentDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '-',
              }}
              onSave={async (updated?: any) => {
                if (updated?.phone) {
                  setUserData((prev: any) => ({ ...prev, phoneNum: updated.phone }));
                }
              }}
            />
          );

        default:
          return (
            <ClientHome
              upcomingAppointments={upcomingAppointments}
              completedCount={completedCount}
              counselorCount={counselorCount}
              onBookSession={() => setCurrentPage('client-booking')}
              onViewHistory={() => setCurrentPage('client-history')}
              hasExistingBooking={hasUpcomingBooking}
            />
          );
=======
    if (userRole === 'client') {
      const clientProfile = userData?.clientProfile || {};
      const cases = clientProfile.cases || [];
      const hasCase = cases.length > 0;
      const shouldShowWaiting = !hasCase && !debugForceShowHome;
      switch (currentPage) {
        case 'client-home': return (
          <ClientHome
            appointments={appointments}
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
        case 'client-profile': return <ClientProfile profile={{ name: `${userData.firstName} ${userData.lastName}`, email: userData.cmuAccount || '', clientId: userData.clientProfile?.clientId || '', department: userData.ClientProfile?.department || '', phone: userData.phoneNum || '-', enrollmentDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '-' }} onSave={() => { }} />;
        default: return <ClientHome appointments={appointments} onBookSession={() => setCurrentPage('client-booking')} onViewHistory={() => setCurrentPage('client-history')} hasExistingBooking={hasUpcomingBooking} />;
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
      }
    }

    if (userRole === 'counselor') {
      const handleApproveWaiting = async (userId: string) => {
        try {
          const target = waitingCases.find((w: any) => String(w.id) === String(userId));
          const activeCaseId = target?.caseId ?? null;

          if (!activeCaseId) {
            alert('ไม่พบ case ที่รอการยืนยัน กรุณา refresh แล้วลองใหม่');
            return;
          }

          const res = await fetch(`${API_BASE_URL}/cases/${activeCaseId}/appointment-status`, {
            method: 'PATCH',
            headers: createHeaders(),
            body: JSON.stringify({ status: 'confirmed' }),
          });

          if (res.ok) {
            setWaitingCases((prev) => prev.filter((w: any) => String(w.id) !== String(userId)));
            await fetchCounselorData();
          } else {
            const err = await res.json().catch(() => ({}));
            alert(err?.message || 'ยืนยันไม่สำเร็จ');
          }
        } catch (e) {
          console.error(e);
        }
      };

      const handleFetchReport = async (from: string, to: string) => {
        const res = await fetch(`${API_BASE_URL}/counselor/report?startDate=${from}&endDate=${to}`, {
          headers: createHeaders(),
        });
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
          counselorWorkload: (d.counselorStats ?? []).map((c: any) => ({
            name: c.name,
            sessions: c.sessionsCreated ?? 0,
          })),
          monthlySessions: [],
        };
      };

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
        case 'counselor-dashboard':
          return (
            <CounselorDashboard
<<<<<<< HEAD
              waitingStudents={waitingCases.length > 0 ? waitingCases : undefined}
              todayAppointments={counselorTodayAppointments.length > 0 ? counselorTodayAppointments : undefined}
              totalCasesCount={waitingCases.length}
              onScheduleAppointment={() => setCurrentPage('counselor-schedule')}
              onNavigateToReport={() => setCurrentPage('counselor-report')}
              onApproveWaiting={handleApproveWaiting}
              onCreateToken={handleCreateToken}
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
              currentCounselorId={userData?.counselorProfile?.counselorId ?? null}
            />
          );

        case 'counselor-users':
          return (
            <CounselorUserManagement
              onApprove={async (id) => {
                await handleApproveWaiting(id);
                fetchCounselorData();
              }}
              onRoleChange={async (id, newRole) => {
                try {
                  await fetch(`${API_BASE_URL}/counselor/users/${id}/role`, {
                    method: 'PATCH',
                    headers: createHeaders(),
                    body: JSON.stringify({ roleName: newRole }),
                  });
                  fetchCounselorData();
                } catch (e) {
                  console.error(e);
                }
=======
              waitingClients={waitingClients.length > 0 ? waitingClients : undefined}
              todayAppointments={todayAppointments.length > 0 ? todayAppointments : undefined}
              totalCasesCount={128}
              onGenerateToken={mockGenerateToken}
              onScheduleAppointment={(id) => {
                console.log('Scheduling for client:', id);
                setCurrentPage('counselor-schedule');
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
              }}
            />
          );

        case 'counselor-report':
          return <ReportGenerator />;

        default:
          return (
            <CounselorDashboard
<<<<<<< HEAD
              waitingStudents={waitingCases.length > 0 ? waitingCases : undefined}
              todayAppointments={counselorTodayAppointments.length > 0 ? counselorTodayAppointments : undefined}
              totalCasesCount={waitingCases.length}
=======
              waitingClients={waitingClients.length > 0 ? waitingClients : undefined}
              todayAppointments={todayAppointments.length > 0 ? todayAppointments : undefined}
              totalCasesCount={128}
              onGenerateToken={mockGenerateToken}
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
              onScheduleAppointment={() => setCurrentPage('counselor-schedule')}
              onNavigateToReport={() => setCurrentPage('counselor-report')}
              onApproveWaiting={handleApproveWaiting}
              onCreateToken={handleCreateToken}
            />
          );
      }
    }
<<<<<<< HEAD

    if (userRole === 'admin') {
      const stats = adminStats || {
        totalUsers: 0,
        activeClients: 0,
        activeCounselors: 0,
        pendingApprovals: 0,
        totalSessions: 0,
        sessionsThisMonth: 0,
        upcomingSessions: 0,
        averageWaitTime: '0',
        topIssueTags: [],
      };

      switch (currentPage) {
        case 'admin-home':
          return <AdminHome stats={stats} onNavigateToApprovals={() => setCurrentPage('admin-users')} />;
        case 'admin-users':
          return <UserManagement users={allUsers} onApprove={fetchAdminData} onSuspend={fetchAdminData} />;
        default:
          return <AdminHome stats={stats} />;
      }
    }

    return null;
=======
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin opacity-50" />
      </div>
    );
  }

  if (appState === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-xl font-bold mb-4">{errorMessage}</p>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          className="bg-[#522d80] text-white px-6 py-2 rounded-xl"
        >
          กลับไปหน้าหลัก
        </button>
      </div>
    );
  }

  if (appState === 'landing') {
    return <LandingPage onLoginSuccess={() => { window.location.href = API_ENDPOINTS.AUTH.CMU_ENTRANCE; }} />;
  }

  if (userRole === 'client' && !showUrgency && !showPDPA && !showToken) {
    const clientProfile = userData?.clientProfile || {};
    const cases = clientProfile?.cases || [];
    const flowStatus = userData?.flowStatus ?? 'normal';
    const shouldShowWaiting = (cases.length === 0 || flowStatus === 'waiting_approval') && !debugForceShowHome;

    if (shouldShowWaiting) {
      return <WaitingPage userName={userData?.firstName ?? userData?.name ?? undefined} />;
    }
  }

  return (
    <GoogleOAuthProvider clientId="633019458862-cfrtd22t900o6595dqou4v9os1ba800q.apps.googleusercontent.com">
      <Layout userRole={userRole} currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
        {renderContent()}
      </Layout>
<<<<<<< HEAD

      {showUrgency && (
        <UrgencyModal onSubmit={(level: string, details: string) => handleUrgencySubmit(level, details)} />
      )}

      {showPDPA && (
        <PDPAModal
          onAccept={async () => {
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
          }}
        />
      )}

      {showToken && <TokenModal onSubmit={handleTokenSubmit} />}
=======
      {showUrgency && <UrgencyModal onSubmit={() =>{handleUrgencySubmit; setShowUrgency(false); setShowPDPA(true);}} />}
      {showPDPA && <PDPAModal onAccept={() => { localStorage.setItem('pdpa_accepted', 'true'); setShowPDPA(false); setShowToken(true); }} />}
      {showToken && <TokenModal onSubmit={() =>{handleTokenSubmit; setShowUrgency(false); setShowPDPA(false);setShowToken(false);}} />}
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
    </GoogleOAuthProvider>
  );
}