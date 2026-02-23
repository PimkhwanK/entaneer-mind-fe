import { useState, useEffect, useCallback, useMemo } from 'react';
import { LandingPage } from './components/LandingPage';
import { Layout } from './components/Layout';
import { PDPAModal } from './components/PDPAModal';
import { TokenModal } from './components/TokenModal';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AlertCircle, Calendar, Clock, User, Sparkles, Timer, ArrowRight, Info } from 'lucide-react';
import { apiService } from './services/api.service';

import { API_ENDPOINTS, getAuthHeader } from './config/api.config';
import type { UserRole, Appointment, WaitingClient, TodayAppointment, TimeBlock } from './types';

// ── Client Components (จาก Pimpit) ──
import { BookingPage } from './components/Client/BookingPage';
import { ClientHistory } from './components/Client/ClientHistory';
import { ClientProfile } from './components/Client/ClientProfile';

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

// ── ClientHome (inline component) ──
interface ClientHomeProps {
  onBookSession: () => void;
  onViewHistory: () => void;
  appointments: Appointment[];
  isWaitingForQueue?: boolean;
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
        <button onClick={onDebugSkipWaiting} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[var(--color-accent-blue)]">
          เข้าสู่หน้าหลักชั่วคราว (เพื่อการทดสอบ) <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">ยินดีต้อนรับกลับมา 👋</h1>
        <p className="text-[var(--color-text-secondary)]">วันนี้คุณรู้สึกอย่างไรบ้าง? เราพร้อมรับฟังคุณเสมอ</p>
      </div>

      <div className="bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-green)] rounded-[2rem] p-8 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-start gap-4">
          <Sparkles className="w-8 h-8 shrink-0 opacity-80" />
          <div>
            <h3 className="text-white/80 font-medium mb-1 uppercase tracking-wider text-xs">แรงบันดาลใจวันนี้</h3>
            <p className="text-xl md:text-2xl font-medium leading-relaxed italic">"{todayQuote}"</p>
          </div>
        </div>
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <button
            onClick={hasExistingBooking ? onViewHistory : onBookSession}
            className={`w-full p-8 rounded-[2rem] shadow-md flex flex-col items-center justify-center gap-4 group h-full min-h-[250px] transition-all ${hasExistingBooking
              ? 'bg-amber-50 border-2 border-amber-200 text-amber-800 hover:bg-amber-100'
              : 'bg-[var(--color-accent-green)] text-white hover:opacity-90'}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${hasExistingBooking ? 'bg-amber-200' : 'bg-white/20'}`}>
              {hasExistingBooking ? <Info className="w-8 h-8 text-amber-600" /> : <Calendar className="w-8 h-8 text-white" />}
            </div>
            <div className="text-center">
              <span className="text-xl font-bold block mb-1">
                {hasExistingBooking ? 'ท่านมีนัดหมายอยู่แล้ว' : 'จองเวลารับคำปรึกษา'}
              </span>
              <span className={`text-sm ${hasExistingBooking ? 'text-amber-700 font-medium underline' : 'opacity-80'}`}>
                {hasExistingBooking ? 'กรุณายกเลิกนัดเดิมที่หน้าประวัติ' : 'นัดหมายต่อเนื่องหรือขอคำปรึกษาใหม่'}
              </span>
            </div>
          </button>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">การนัดหมายที่กำลังจะมาถึง</h3>
            <button onClick={onViewHistory} className="text-xs text-[var(--color-accent-blue)] font-bold hover:underline">
              ประวัติทั้งหมด
            </button>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">ไม่มีนัดหมายใหม่ในขณะนี้</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex flex-col md:flex-row md:items-center gap-4 p-5 bg-[var(--color-primary-blue)] rounded-2xl border border-blue-50">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-[var(--color-accent-green)]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[var(--color-text-primary)]">ผู้ให้คำปรึกษา: {apt.counselor}</h4>
                    <div className="flex gap-4 mt-1">
                      <span className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="w-4 h-4" /> {apt.date}</span>
                      <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-4 h-4" /> {apt.time} น.</span>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100">
                    ยืนยันแล้ว
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[var(--color-accent-blue)]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">เซสชันที่เสร็จสิ้น</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.filter(a => a.status === 'completed').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">ผู้เชี่ยวชาญที่ดูแลคุณ</p>
              <p className="text-2xl font-bold text-gray-900">{new Set(appointments.map(apt => apt.counselor)).size}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ──
type AppState = 'loading' | 'landing' | 'app' | 'error';

function createHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { ...getAuthHeader(), ...extra };
}

export default function App() {
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

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [waitingClients] = useState<WaitingClient[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [counselorSchedule, setCounselorSchedule] = useState<TimeBlock[]>([]);
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [adminStats, setAdminStats] = useState<any>(null);
  const [allUsers] = useState<any[]>([]);

  const hasUpcomingBooking = useMemo(() =>
    appointments.some(apt => apt.status === 'upcoming'), [appointments]);

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
      const res = await fetch(API_ENDPOINTS.APPOINTMENTS.MY, { headers: createHeaders() });
      if (res.ok) setAppointments(await res.json());
    } catch (e) { console.error(e); }
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
        if (localStorage.getItem('urgency_submitted') !== 'true') setShowUrgency(true);
        else if (localStorage.getItem('pdpa_accepted') !== 'true') setShowPDPA(true);
        else if (localStorage.getItem('token_submitted') !== 'true') setShowToken(true);
        else if (role) loadInitialData(role);
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
      await apiService.verifyCaseCode(code);
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
            appointments={appointments}
            onBookSession={() => setCurrentPage('client-booking')}
            onViewHistory={() => setCurrentPage('client-history')}
            hasExistingBooking={hasUpcomingBooking}
          />
        );
      }
    }

    // ── Counselor ──
    if (userRole === 'counselor') {
      switch (currentPage) {
        case 'counselor-dashboard': return (
          <CounselorDashboard
            waitingStudents={waitingClients.length > 0 ? waitingClients : undefined}
            todayAppointments={counselorTodayAppointments.length > 0 ? counselorTodayAppointments : undefined}
            totalCasesCount={128}
            onScheduleAppointment={() => setCurrentPage('counselor-schedule')}
            onNavigateToReport={() => setCurrentPage('counselor-report')}
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
        case 'counselor-report': return <ReportGenerator />;
        default: return (
          <CounselorDashboard
            waitingStudents={waitingClients.length > 0 ? waitingClients : undefined}
            todayAppointments={counselorTodayAppointments.length > 0 ? counselorTodayAppointments : undefined}
            totalCasesCount={128}
            onScheduleAppointment={() => setCurrentPage('counselor-schedule')}
            onNavigateToReport={() => setCurrentPage('counselor-report')}
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