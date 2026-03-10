import React, { useState } from 'react';
import { API_ENDPOINTS, API_BASE_URL, getAuthHeader } from '../../config/api.config';
import { Calendar, Clock, User, Users, Key, Copy, CheckCircle, AlertCircle, BarChart3, Activity, TrendingUp, ArrowUpRight, FileText } from 'lucide-react';
export interface WaitingStudent {
    id: string;
    name: string;
    waitingSince: string;
    urgency: 'low' | 'medium' | 'high';
}

export interface TodayAppointment {
    id: string;
    time: string;
    studentName: string;
    status: 'pending' | 'in-progress' | 'completed';
    caseCode: string;
}

export interface allToken {
    id: number;
    token: string;
    isUsed: boolean;
    usedAt?: Date;
    createdAt: Date;
}

interface CounselorDashboardProps {
    waitingStudents?: WaitingStudent[];
    todayAppointments?: TodayAppointment[];
    allToken?: allToken[];
    totalCasesCount?: number;
    onScheduleAppointment?: (studentId: string) => void;
    onApproveWaiting?: (studentId: string) => void;
    onNavigateToReport?: () => void;
    onCreateToken?: (tokenCode: string) => Promise<any>;
    systemStats?: SystemStats;
}

export interface SystemStats {
    activeClients: number;
    activeCounselors: number;
    sessionsThisMonth: number;
    averageWaitTime: string;
    topIssueTags: { tag: string; count: number }[];
    totalSessions: number;
}

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
    waitingStudents: initialWaitingStudents,
    todayAppointments: initialTodayAppointments,
    allToken: initialUnusedToken,
    totalCasesCount: initialTotalCount,
    systemStats = MOCK_SYSTEM_STATS,
    onScheduleAppointment,
    onApproveWaiting,
    onNavigateToReport,
    onCreateToken,
}: CounselorDashboardProps) {
    const [generatedToken, setGeneratedToken] = useState<string>("");
    const [copiedToken, setCopiedToken] = useState(false);
    const [tokenListLoading, setTokenListLoading] = useState(true);
    const [tokenListError, setTokenListError] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);

    // Mockup Data
    const mockWaitingStudents: WaitingStudent[] = [
        { id: 'w1', name: 'นายสมชาย รักเรียน', waitingSince: '10:15 น.', urgency: 'high' },
        { id: 'w2', name: 'นางสาวใจดี มีสุข', waitingSince: '10:45 น.', urgency: 'medium' },
        { id: 'w3', name: 'นายขยัน หมั่นเพียร', waitingSince: '11:20 น.', urgency: 'low' },
    ];

    const mockTodayAppointments: TodayAppointment[] = [
        { id: 'a1', time: '13:00', studentName: 'นายมงคล สายลุย', status: 'in-progress', caseCode: 'CASE-2024-001' },
        { id: 'a2', time: '14:30', studentName: 'นางสาววิภาดา แก้วใส', status: 'pending', caseCode: 'CASE-2024-005' },
        { id: 'a3', time: '10:00', studentName: 'นายธันวา มาดี', status: 'completed', caseCode: 'CASE-2023-089' },
    ];

    const mockallToken: allToken[] = [
        { id: 1, token: "690001", isUsed: false, usedAt: undefined, createdAt: new Date() },
        { id: 2, token: "690002", isUsed: true, usedAt: new Date(), createdAt: new Date() },
        { id: 3, token: "690003", isUsed: false, usedAt: undefined, createdAt: new Date() },
    ];

    // (Props kept for backward compatibility but data is now API-driven)

    // API-backed state
    const [todayAppointmentsData, setTodayAppointmentsData] = useState<TodayAppointment[]>([]);
    // waitingStudents: ใช้จาก props (App fetch /counselor/users มาแล้ว) ก่อน
    const [waitingStudentsData, setWaitingStudentsData] = useState<WaitingStudent[]>(initialWaitingStudents || []);
    const [totalCasesData, setTotalCasesData] = useState<number>(initialTotalCount ?? 0);
    const [systemStatsData, setSystemStatsData] = useState<SystemStats>(systemStats);

    // Sync waitingStudents from props whenever parent re-fetches
    React.useEffect(() => {
        if (initialWaitingStudents && initialWaitingStudents.length > 0) {
            setWaitingStudentsData(initialWaitingStudents);
        }
    }, [initialWaitingStudents]);

    React.useEffect(() => {
        if (initialTotalCount !== undefined) setTotalCasesData(initialTotalCount);
    }, [initialTotalCount]);

    // Fetch schedule for today -> derive todayAppointments, waitingStudents, totalCases
    React.useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        fetch(`${API_BASE_URL}/counselor/schedule?startDate=${today}&endDate=${today}`, {
            headers: getAuthHeader()
        })
            .then(res => res.ok ? res.json() : null)
            .then(json => {
                if (!json?.data?.sessions) return;
                const sessions = json.data.sessions;

                const mapped: TodayAppointment[] = sessions
                    .filter((s: any) => ['booked', 'completed', 'available'].includes(s.status))
                    .map((s: any) => ({
                        id: String(s.sessionId),
                        time: s.timeStart
                            ? new Date(s.timeStart).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                            : '-',
                        studentName: s.case?.client?.name ?? '-',
                        status: s.status === 'completed' ? 'completed' : 'pending',
                        caseCode: s.case ? `CASE-${s.case.caseId}` : '-'
                    }));
                setTodayAppointmentsData(mapped);

                // ไม่ override waitingStudentsData จาก schedule เพราะ schedule เป็น booked sessions
                // waitingStudentsData มาจาก props (App.tsx fetch /counselor/users ที่มี waitingCaseId)

                const stats = json.data.stats;
                setTotalCasesData((stats.booked ?? 0) + (stats.completed ?? 0));
            })
            .catch(() => { });
    }, []);

    // Fetch report for system stats (current month)
    React.useEffect(() => {
        const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];

        fetch(`${API_BASE_URL}/counselor/report?startDate=${firstOfMonth}&endDate=${today}`, {
            headers: getAuthHeader()
        })
            .then(res => res.ok ? res.json() : null)
            .then(json => {
                if (!json?.data) return;
                const d = json.data;
                // Backend format: { caseStats, sessionStats, userStats, topProblemTags, counselorStats }
                setSystemStatsData({
                    activeClients: d.summary?.newClients ?? 0,
                    activeCounselors: d.counselorWorkload?.length ?? 0,
                    sessionsThisMonth: d.summary?.completedSessions ?? 0,
                    averageWaitTime: `${d.summary?.averageWaitDays ?? 0}d`,
                    topIssueTags: (d.topTags ?? []).map((t: any) => ({ tag: t.tag, count: t.count })),
                    totalSessions: d.summary?.totalSessions ?? 0
                });
            })
            .catch(() => { });
    }, []);

    const handleGenerateToken = () => {
        // สุ่ม token TK-XXXXXX (X = A-Z หรือ 0-9 แบบ random 6 ตัว)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const randomPart = Array.from({ length: 6 }, () =>
            chars[Math.floor(Math.random() * chars.length)]
        ).join('');
        const newTokenCode = `TK-${randomPart}`;

        if (isDuplicate(newTokenCode)) {
            // สุ่มใหม่อัตโนมัติถ้าซ้ำ (ซึ่งแทบเป็นไปไม่ได้)
            handleGenerateToken();
            return;
        }

        setError(null);
        setGeneratedToken(newTokenCode);
        setCopiedToken(false);
    };

    const handleConfirmToken = async () => {
        if (!generatedToken) return;

        // บันทึกไป backend
        if (onCreateToken) {
            try {
                await onCreateToken(generatedToken);
            } catch (e: any) {
                console.warn('onCreateToken failed:', e?.message);
            }
        }

        const newId = tokens.length > 0 ? Math.max(...tokens.map(t => t.id)) + 1 : 1;
        const newToken: allToken = {
            id: newId,
            token: generatedToken,
            isUsed: false,
            createdAt: new Date()
        };

        setTokens(prev => [...prev, newToken]);
        setGeneratedToken('');
        setCopiedToken(false);
        setError(null);
    };

    const handleDeleteToken = async (id: number) => {
        if (!window.confirm('ต้องการลบ token นี้ใช่หรือไม่?')) return;
        // optimistic remove ทันที
        setTokens(prev => prev.filter(t => t.id !== id));
        try {
            const res = await fetch(`${API_BASE_URL}/counselor/tokens/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader(),
            });
            if (!res.ok) {
                // revert ถ้าล้มเหลว
                const err = await res.json().catch(() => ({}));
                alert(err?.message || 'ลบไม่สำเร็จ');
                // re-fetch เพื่อ sync
                const refetch = await fetch(`${API_BASE_URL}/counselor/tokens`, { headers: getAuthHeader() });
                if (refetch.ok) {
                    const json = await refetch.json();
                    const raw = json.data?.tokens ?? [];
                    setTokens(raw.map((t: any) => ({ id: t.id, token: t.token, isUsed: t.isUsed, usedAt: t.usedAt ? new Date(t.usedAt) : undefined, createdAt: new Date(t.createdAt) })));
                }
            }
        } catch (e) {
            console.error('deleteToken error:', e);
        }
    };

    const handleCopyToken = () => {
        if (!generatedToken) return;

        navigator.clipboard.writeText(generatedToken);
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
    };

    const isDuplicate = (tokenCode: string) => {
        return tokens.some((t) => t.token === tokenCode);
    };

    // Token list state — populated from API
    const [tokens, setTokens] = useState<allToken[]>(initialUnusedToken || []);
    const [sortAsc, setSortAsc] = useState(true);
    const [filter, setFilter] = useState<"all" | "unused" | "used">("unused");

    React.useEffect(() => {
        if (initialUnusedToken) {
            setTokenListLoading(false);
            return;
        }
        const fetchTokens = async () => {
            setTokenListLoading(true);
            setTokenListError(null);
            try {
                const res = await fetch(`${API_BASE_URL}/counselor/tokens`, {
                    headers: getAuthHeader()
                });
                if (!res.ok) throw new Error(`Failed to fetch tokens (${res.status})`);
                const json = await res.json();
                // Backend returns { success, data: { total, tokens: [...] } }
                const raw: Array<{
                    id: number;
                    token: string;
                    isUsed: boolean;
                    usedAt?: string;
                    createdAt: string;
                }> = json.data?.tokens ?? [];
                setTokens(raw.map(t => ({
                    id: t.id,
                    token: t.token,
                    isUsed: t.isUsed,
                    usedAt: t.usedAt ? new Date(t.usedAt) : undefined,
                    createdAt: new Date(t.createdAt)
                })));
            } catch (err) {
                setTokenListError((err as Error).message);
            } finally {
                setTokenListLoading(false);
            }
        };
        fetchTokens();
    }, [initialUnusedToken]);

    // filter
    const filteredTokens = tokens.filter(token => {
        if (filter === "all") return true;
        if (filter === "unused") return !token.isUsed;
        if (filter === "used") return token.isUsed;
    });

    // sort
    const sortedTokens = [...filteredTokens].sort((a, b) =>
        sortAsc
            ? a.token.localeCompare(b.token)
            : b.token.localeCompare(a.token)
    );

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
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">แผงควบคุมผู้ให้คำปรึกษา</h1>
                <p className="text-[var(--color-text-secondary)] text-sm">จัดการตารางนัดหมายและบันทึกเคสนักศึกษาในความดูแลของคุณ</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4 className="font-medium">นัดหมายวันนี้</h4>
                    </div>
                    <p className="text-3xl font-bold text-[var(--color-text-primary)] ml-13">{todayAppointmentsData.length}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <h4 className="font-medium">รอการจัดคิว</h4>
                    </div>
                    <p className="text-3xl font-bold text-[var(--color-text-primary)] ml-13">{waitingStudentsData.length}</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <h4 className="font-medium">ปรึกษาเสร็จแล้ว</h4>
                    </div>
                    <p className="text-3xl font-bold text-[var(--color-text-primary)] ml-13">
                        {todayAppointmentsData.filter(apt => apt.status === 'completed').length}
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <h4 className="font-medium">เคสทั้งหมด</h4>
                    </div>
                    <p className="text-3xl font-bold text-[var(--color-text-primary)] ml-13">{totalCasesData}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                        <div className="flex items-center gap-2 mb-4">
                            <Key className="size-5 text-[var(--color-accent-green)]" />
                            <h3 className="font-bold">สร้างรหัสลงทะเบียน (Token)</h3>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-6">สร้างรหัสเฉพาะสำหรับนักศึกษาใหม่ รูปแบบ TK-XXXXXX</p>

                        {/* Preview token ที่สุ่มได้ */}
                        {generatedToken ? (
                            <div className="bg-gray-50 border-2 border-dashed border-green-300 rounded-2xl p-4 mb-4">
                                <p className="text-xs text-gray-400 mb-2 font-medium">Token ที่สุ่มได้ (ยังไม่ถูกบันทึก)</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-white px-3 py-2 rounded-xl text-lg font-mono font-bold text-green-700 border border-green-100 tracking-widest">
                                        {generatedToken}
                                    </code>
                                    <button onClick={handleCopyToken} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm" title="Copy">
                                        {copiedToken ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-[var(--color-accent-blue)]" />}
                                    </button>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={handleConfirmToken}
                                        className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors"
                                    >
                                        ✓ ยืนยันและบันทึก
                                    </button>
                                    <button
                                        onClick={() => { setGeneratedToken(''); setError(null); }}
                                        className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[88px] flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl mb-4">
                                <p className="text-sm text-gray-300">กด "สุ่ม Token" เพื่อสร้างรหัสใหม่</p>
                            </div>
                        )}

                        <button
                            onClick={handleGenerateToken}
                            className="w-full bg-[var(--color-accent-green)] text-white py-3 rounded-2xl hover:opacity-90 transition-opacity font-medium"
                        >
                            🎲 สุ่ม Token ใหม่
                        </button>

                        {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
                    </div>

                    {/* Token Dashboard */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-xl mb-4">Token Dashboard</h2>

                            {/* Filter Tabs */}
                            <div className="flex items-center gap-4 mb-4">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    ทั้งหมด
                                </button>
                                <button
                                    onClick={() => setFilter('unused')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'unused'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    ยังไม่ถูกใช้งาน
                                </button>
                                <button
                                    onClick={() => setFilter('used')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'used'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    ถูกใช้งานแล้ว
                                </button>

                                <button
                                    onClick={() => setSortAsc(!sortAsc)}
                                    className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                    Sort: {sortAsc ? 'ASC ↑' : 'DESC ↓'}
                                </button>
                            </div>

                            {/* Token List - Scrollable */}
                            <div className="max-h-54 overflow-y-auto space-y-3 pr-2">
                                {tokenListLoading ? (
                                    <div className="text-center py-8 text-gray-400 text-sm">กำลังโหลด...</div>
                                ) : tokenListError ? (
                                    <div className="text-center py-8 text-red-400 text-sm">เกิดข้อผิดพลาด: {tokenListError}</div>
                                ) : sortedTokens.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 text-sm">ไม่พบ Token</div>
                                ) : sortedTokens.map((t) => (
                                    <div
                                        key={t.id}
                                        className={`p-4 rounded-xl border-2 transition-all ${t.isUsed
                                            ? 'bg-green-50 border-green-200 opacity-60'
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-lg font-mono tracking-widest text-gray-800">
                                                    {t.token}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {t.isUsed ? `ใช้แล้ว${t.usedAt ? ` • ${new Date(t.usedAt).toLocaleDateString('th-TH')}` : ''}` : 'ยังไม่ถูกใช้งาน'}
                                                </p>
                                            </div>
                                            {!t.isUsed && (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(t.token)}
                                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Copy"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteToken(t.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <AlertCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>


                    <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-[var(--color-accent-blue)]" />
                            <h3 className="font-bold">ตารางนัดหมายวันนี้</h3>
                        </div>
                        {todayAppointmentsData.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>ไม่มีตารางนัดหมายในวันนี้</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {todayAppointmentsData.map((apt) => (
                                    <div key={apt.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[var(--color-accent-blue)] transition-colors">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm"><User className="w-6 h-6 text-gray-400" /></div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-[var(--color-text-primary)]">{apt.studentName}</h4>
                                                <span className="text-[10px] px-2 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">{apt.caseCode}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                                <span className="text-sm text-[var(--color-text-secondary)]">{apt.time} น.</span>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>{getStatusLabel(apt.status)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-4"><AlertCircle className="w-5 h-5 text-[var(--color-accent-green)]" /><h3 className="font-bold">นักศึกษาที่รอการจัดคิว</h3></div>
                    {waitingStudentsData.length === 0 ? (
                        <div className="text-center py-12 text-gray-400"><Users className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>ไม่มีนักศึกษารอคิวในขณะนี้</p></div>
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
                                    {waitingStudentsData.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border border-green-100"><User className="w-4 h-4 text-green-600" /></div><span className="font-medium">{student.name}</span></div></td>
                                            <td className="px-4 py-4 text-[var(--color-text-secondary)]">{student.waitingSince}</td>
                                            <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getUrgencyColor(student.urgency)}`}>{getUrgencyLabel(student.urgency)}</span></td>
                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => onApproveWaiting?.(student.id)}
                                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
                                                >
                                                    ✓ ยืนยัน
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
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
                        <h2 className="text-3xl font-bold text-gray-800">{systemStatsData.activeClients}</h2>
                        <p className="text-xs text-blue-600 mt-2">ผู้ใช้งานทั้งหมดที่ลงทะเบียน</p>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                                <User className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1 font-medium">ผู้ให้คำปรึกษา (Active)</p>
                        <h2 className="text-3xl font-bold text-gray-800">{systemStatsData.activeCounselors}</h2>
                        <p className="text-xs text-purple-600 mt-2">พร้อมให้บริการในระบบ</p>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1 font-medium">นัดหมายเดือนนี้</p>
                        <h2 className="text-3xl font-bold text-gray-800">{systemStatsData.sessionsThisMonth}</h2>
                        <p className="text-xs text-green-600 mt-2">เสร็จสิ้นแล้ว {systemStatsData.totalSessions} เคสรวม</p>
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
                            {systemStatsData.topIssueTags.map((issue, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-600">{issue.tag}</span>
                                        <span className="text-sm font-bold text-gray-800">{issue.count} เคส</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div
                                            className="bg-green-400 h-2.5 rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${systemStatsData.totalSessions > 0
                                                    ? (issue.count / systemStatsData.totalSessions) * 100
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
                            <p className="text-5xl font-bold mb-2">{systemStatsData.averageWaitTime}</p>
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
                        <p className="text-2xl font-bold text-gray-800">{systemStatsData.totalSessions}</p>
                        <p className="text-xs text-gray-500 mt-1">เซสชันทั้งหมด</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-2xl">
                        <p className="text-2xl font-bold text-blue-600">{systemStatsData.sessionsThisMonth}</p>
                        <p className="text-xs text-gray-500 mt-1">เดือนนี้</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-2xl">
                        <p className="text-2xl font-bold text-green-600">{systemStatsData.activeClients}</p>
                        <p className="text-xs text-gray-500 mt-1">ผู้ใช้ระบบ</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-2xl">
                        <p className="text-2xl font-bold text-purple-600">{systemStatsData.topIssueTags.length}</p>
                        <p className="text-xs text-gray-500 mt-1">ประเภทปัญหา</p>
                    </div>
                </div>
            </div>

        </div>
    );
}