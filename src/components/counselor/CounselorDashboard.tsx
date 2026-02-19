import React, { useState } from 'react';
import { Calendar, Clock, User, Users, Key, Copy, CheckCircle, AlertCircle } from 'lucide-react';

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

interface CounselorDashboardProps {
    waitingClients?: WaitingClient[];
    todayAppointments?: TodayAppointment[];
    totalCasesCount?: number;
    onGenerateToken: () => string;
    onScheduleAppointment?: (clientId: string) => void;
}

export function CounselorDashboard({
    waitingClients: initialWaitingClients,
    todayAppointments: initialTodayAppointments,
    totalCasesCount: initialTotalCount,
    onGenerateToken,
    onScheduleAppointment
}: CounselorDashboardProps) {
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [copiedToken, setCopiedToken] = useState(false);

    // Mockup Data
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

    // เลือกใช้ข้อมูลจาก Props หรือ Mockup
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-4">
                        <Key className="w-5 h-5 text-[var(--color-accent-green)]" />
                        <h3 className="font-bold">สร้างรหัสลงทะเบียน (Token)</h3>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-6">สร้างรหัสเฉพาะสำหรับนักศึกษาใหม่</p>
                    <button onClick={handleGenerateToken} className="w-full bg-[var(--color-accent-green)] text-white py-3 rounded-2xl hover:opacity-90 transition-opacity mb-4 font-medium">
                        สร้างรหัสลงทะเบียนใหม่
                    </button>
                    {generatedToken && (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4">
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-white px-3 py-2 rounded-xl text-sm font-mono break-all border border-gray-100">{generatedToken}</code>
                                <button onClick={handleCopyToken} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                                    {copiedToken ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-[var(--color-accent-blue)]" />}
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
                                <div key={apt.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[var(--color-accent-blue)] transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm"><User className="w-6 h-6 text-gray-400" /></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-[var(--color-text-primary)]">{apt.clientName}</h4>
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
                {waitingClients.length === 0 ? (
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
                                {waitingClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border border-green-100"><User className="w-4 h-4 text-green-600" /></div><span className="font-medium">{client.name}</span></div></td>
                                        <td className="px-4 py-4 text-[var(--color-text-secondary)]">{client.waitingSince}</td>
                                        <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getUrgencyColor(client.urgency)}`}>{getUrgencyLabel(client.urgency)}</span></td>
                                        <td className="px-4 py-4"><button onClick={() => onScheduleAppointment?.(client.id)} className="text-[var(--color-accent-blue)] font-bold hover:underline">ลงตารางนัดหมาย</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}