import { useState } from 'react';
import { Calendar, Clock, User, Users, Key, Copy, CheckCircle, AlertCircle, BarChart3, Activity, TrendingUp, ArrowUpRight, FileText } from 'lucide-react';

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

// ── Stats สำหรับส่วน Admin ที่โยกมา ──
export interface SystemStats {
    activeClients: number;
    activeCounselors: number;
    sessionsThisMonth: number;
    averageWaitTime: string;
    topIssueTags: { tag: string; count: number }[];
    totalSessions: number;
}

interface CounselorDashboardProps {
    waitingClients?: WaitingClient[];
    todayAppointments?: TodayAppointment[];
    totalCasesCount?: number;
    systemStats?: SystemStats;
    onGenerateToken: () => string;
    onScheduleAppointment?: (clientId: string) => void;
    onNavigateToReport?: () => void;
}

// ── Mockup Data ──
const MOCK_SYSTEM_STATS: SystemStats = {
    activeClients: 1180,
    activeCounselors: 15,
    sessionsThisMonth: 42,
    averageWaitTime: '1.5d',
    topIssueTags: [
        { tag: 'Academic Stress', count: 120 },
        { tag: 'Anxiety', count: 85 },
        { tag: 'Relationship Issues', count: 64 },
        { tag: 'Depression', count: 42 },
        { tag: 'Financial Issues', count: 30 },
    ],
    totalSessions: 450,
};

export function CounselorDashboard({
    waitingClients: initialWaitingClients,
    todayAppointments: initialTodayAppointments,
    totalCasesCount: initialTotalCount,
    systemStats = MOCK_SYSTEM_STATS,
    onGenerateToken,
    onScheduleAppointment,
    onNavigateToReport,
}: CounselorDashboardProps) {
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [copiedToken, setCopiedToken] = useState(false);

    // ── Mockup ส่วน Daily ──
    const mockWaitingClients: WaitingClient[] = [
        { id: 'w1', name: 'นายสมชาย รักเรียน', waitingSince: '10:15 น.', urgency: 'high' },
        { id: 'w2', name: 'นางสาวใจดี มีสุข', waitingSince: '10:45 น.', urgency: 'medium' },
        { id: 'w3', name: 'นายขยัน หมั่นเพียร', waitingSince: '11:20 น.', urgency: 'low' },
    ];

    const mockTodayAppointments: TodayAppointment[] = [
        { id: 'a1', time: '13:00', clientName: 'นายมงคล สายลุย', status: 'in-progress', caseCode: 'CASE-2024-001' },
        { id: 'a2', time: '14:30', clientName: 'นางสาววิภาดา แก้วใส', status: 'pending', caseCode: 'CASE-2024-005' },
        { id: 'a3', time: '10:00', clientName: 'นายธันวา มาดี', status: 'completed', caseCode: 'CASE-2023-089' },
    ];

    const waitingClients = initialWaitingClients || mockWaitingClients;
    const todayAppointments = initialTodayAppointments || mockTodayAppointments;
    const totalCasesCount = initialTotalCount !== undefined ? initialTotalCount : 128;

    const handleGenerateToken = () => {
        const token = onGenerateToken();
        setGeneratedToken(token);
        setCopiedToken(false);
    };

    const handleCopyToken = () => {
        if (generatedToken) {
            navigator.clipboard.writeText(generatedToken);
            setCopiedToken(true);
            setTimeout(() => setCopiedToken(false), 2000);
        }
    };

    const getUrgencyLabel = (urgency: string) => {
        switch (urgency) {
            case 'high': return 'เร่งด่วนมาก';
            case 'medium': return 'ปานกลาง';
            case 'low': return 'ปกติ';
            default: return 'ไม่ระบุ';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'เสร็จสิ้น';
            case 'in-progress': return 'กำลังปรึกษา';
            case 'pending': return 'รอพบ';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'in-progress': return 'bg-blue-100 text-blue-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">

            {/* ════════════════════════════════════════
                ส่วนบน: ข้อมูลวันนี้ (Daily View)
            ════════════════════════════════════════ */}
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">แผงควบคุมผู้ให้คำปรึกษา</h1>
                <p className="text-[var(--color-text-secondary)] text-sm">จัดการตารางนัดหมายและบันทึกเคสนักศึกษาในความดูแลของคุณ</p>
            </header>

            {/* Summary Cards - วันนี้ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4 className="font-medium">นัดหมายวันนี้</h4>
                    </div>
                    <p className="text-3xl font-bold text-[var(--color-text-primary)] ml-13">{todayAppointments.length}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <h4 className="font-medium">รอการจัดคิว</h4>
                    </div>
                    <p className="text-3xl font-bold text-[var(--color-text-primary)] ml-13">{waitingClients.length}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <h4 className="font-medium">ปรึกษาเสร็จแล้ว</h4>
                    </div>
                    <p className="text-3xl font-bold text-[var(--color-text-primary)] ml-13">
                        {todayAppointments.filter(apt => apt.status === 'completed').length}
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <h4 className="font-medium">เคสทั้งหมด</h4>
                    </div>
                    <p className="text-3xl font-bold text-[var(--color-text-primary)] ml-13">{totalCasesCount}</p>
                </div>
            </div>

            {/* Generate Token + ตารางวันนี้ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-4">
                        <Key className="w-5 h-5 text-[var(--color-accent-green)]" />
                        <h3 className="font-bold">สร้างรหัสลงทะเบียน (Token)</h3>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-6">สร้างรหัสเฉพาะสำหรับนักศึกษาใหม่</p>
                    <button
                        onClick={handleGenerateToken}
                        className="w-full bg-[var(--color-accent-green)] text-white py-3 rounded-2xl hover:opacity-90 transition-opacity mb-4 font-medium"
                    >
                        สร้างรหัสลงทะเบียนใหม่
                    </button>
                    {generatedToken && (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4">
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-white px-3 py-2 rounded-xl text-sm font-mono break-all border border-gray-100">
                                    {generatedToken}
                                </code>
                                <button onClick={handleCopyToken} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                                    {copiedToken
                                        ? <CheckCircle className="w-5 h-5 text-green-600" />
                                        : <Copy className="w-5 h-5 text-[var(--color-accent-blue)]" />
                                    }
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-[var(--color-accent-blue)]" />
                        <h3 className="font-bold">ตารางนัดหมายวันนี้</h3>
                    </div>
                    {todayAppointments.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>ไม่มีตารางนัดหมายในวันนี้</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todayAppointments.map((apt) => (
                                <div
                                    key={apt.id}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[var(--color-accent-blue)] transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <User className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-[var(--color-text-primary)]">{apt.clientName}</h4>
                                            <span className="text-[10px] px-2 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">
                                                {apt.caseCode}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                            <span className="text-sm text-[var(--color-text-secondary)]">{apt.time} น.</span>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                                        {getStatusLabel(apt.status)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* นักศึกษารอคิว */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)] mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-[var(--color-accent-green)]" />
                    <h3 className="font-bold">นักศึกษาที่รอการจัดคิว</h3>
                </div>
                {waitingClients.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>ไม่มีนักศึกษารอคิวในขณะนี้</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-sm text-gray-500 border-b border-[var(--color-border)]">
                                <tr>
                                    <th className="px-4 py-4 font-medium">ชื่อนักศึกษา</th>
                                    <th className="px-4 py-4 font-medium">รอคิวตั้งแต่</th>
                                    <th className="px-4 py-4 font-medium">ระดับความเร่งด่วน</th>
                                    <th className="px-4 py-4 font-medium">การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {waitingClients.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                                                    <User className="w-4 h-4 text-green-600" />
                                                </div>
                                                <span className="font-medium">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-[var(--color-text-secondary)]">{student.waitingSince}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getUrgencyColor(student.urgency)}`}>
                                                {getUrgencyLabel(student.urgency)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => onScheduleAppointment?.(student.id)}
                                                className="text-[var(--color-accent-blue)] font-bold hover:underline"
                                            >
                                                ลงตารางนัดหมาย
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ════════════════════════════════════════
                ส่วนล่าง: สถิติภาพรวมระบบ (System Stats)
                โยกมาจาก Admin Dashboard
            ════════════════════════════════════════ */}
            <div className="border-t-2 border-dashed border-gray-200 pt-10 mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-[var(--color-accent-blue)]" />
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">สถิติภาพรวมระบบ</h2>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-8">ข้อมูลสะสมของระบบ Entaneer Mind ทั้งหมด</p>

                {/* System Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1 font-medium">นักศึกษาในระบบ</p>
                        <h2 className="text-3xl font-bold text-gray-800">{systemStats.activeClients}</h2>
                        <p className="text-xs text-blue-600 mt-2">ผู้ใช้งานทั้งหมดที่ลงทะเบียน</p>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                                <User className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1 font-medium">ผู้ให้คำปรึกษา (Active)</p>
                        <h2 className="text-3xl font-bold text-gray-800">{systemStats.activeCounselors}</h2>
                        <p className="text-xs text-purple-600 mt-2">พร้อมให้บริการในระบบ</p>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1 font-medium">นัดหมายเดือนนี้</p>
                        <h2 className="text-3xl font-bold text-gray-800">{systemStats.sessionsThisMonth}</h2>
                        <p className="text-xs text-green-600 mt-2">เสร็จสิ้นแล้ว {systemStats.totalSessions} เคสรวม</p>
                    </div>
                </div>

                {/* Problem Tags + Average Wait Time + Report */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Problem Tags Bar Chart */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
                        <div className="flex items-center gap-3 mb-6">
                            <BarChart3 className="w-6 h-6 text-green-500" />
                            <h3 className="text-lg font-bold text-gray-800">ปัญหาที่พบบ่อย (Problem Tags)</h3>
                        </div>
                        <div className="space-y-5">
                            {systemStats.topIssueTags.map((issue, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-600">{issue.tag}</span>
                                        <span className="text-sm font-bold text-gray-800">{issue.count} เคส</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div
                                            className="bg-green-400 h-2.5 rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${systemStats.totalSessions > 0
                                                    ? (issue.count / systemStats.totalSessions) * 100
                                                    : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Average Wait Time + Generate Report */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-[2.5rem] p-8 text-white shadow-lg">
                            <h3 className="text-white/80 font-medium mb-4 flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4" /> Average Wait Time
                            </h3>
                            <p className="text-5xl font-bold mb-2">{systemStats.averageWaitTime}</p>
                            <p className="text-white/70 text-sm">ระยะเวลารอคิวโดยเฉลี่ยในเดือนนี้</p>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">รายงานระบบ</h3>
                            <p className="text-sm text-gray-500 mb-4">สร้างรายงานสรุปสถิติในช่วงเวลาที่ต้องการ</p>
                            <button
                                onClick={onNavigateToReport}
                                className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 text-gray-700 rounded-2xl hover:bg-green-500 hover:text-white transition-all font-bold group"
                            >
                                <span className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Generate Full Report
                                </span>
                                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-[var(--color-accent-blue)]" />
                    <h3 className="font-bold text-gray-800">สรุปกิจกรรมระบบ</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-2xl">
                        <p className="text-2xl font-bold text-gray-800">{systemStats.totalSessions}</p>
                        <p className="text-xs text-gray-500 mt-1">เซสชันทั้งหมด</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-2xl">
                        <p className="text-2xl font-bold text-blue-600">{systemStats.sessionsThisMonth}</p>
                        <p className="text-xs text-gray-500 mt-1">เดือนนี้</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-2xl">
                        <p className="text-2xl font-bold text-green-600">{systemStats.activeClients}</p>
                        <p className="text-xs text-gray-500 mt-1">ผู้ใช้ระบบ</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-2xl">
                        <p className="text-2xl font-bold text-purple-600">{systemStats.topIssueTags.length}</p>
                        <p className="text-xs text-gray-500 mt-1">ประเภทปัญหา</p>
                    </div>
                </div>
            </div>
        </div>
    );
}