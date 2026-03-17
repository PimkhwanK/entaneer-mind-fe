<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, User, Search, Filter, XCircle } from 'lucide-react';

interface AppointmentInput {
    id: string;
    date?: string;
    time?: string;
    timeStart?: string | null;
    counselor: string;
    counselorName?: string;
    roomName?: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    notes?: string;
    sessionToken?: string | null;
}

=======
import React, { useState } from 'react';
import { Calendar, Clock, User, Search, Filter, XCircle } from 'lucide-react';

>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
interface Appointment {
    id: string;
    date: string;
    time: string;
    counselor: string;
<<<<<<< HEAD
    counselorName?: string;
    roomName?: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    notes?: string;
    sessionToken?: string | null;
}

interface ClientHistoryProps {
    appointments: AppointmentInput[];
    onCancelAppointment?: (id: string) => Promise<void> | void;
}

function formatDateFromISO(iso?: string | null) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB');
}

function formatTimeFromISO(iso?: string | null) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

function normalizeAppointments(items: AppointmentInput[]): Appointment[] {
    const deduped = new Map<string, Appointment>();

    for (const apt of items ?? []) {
        if (deduped.has(apt.id)) continue;

        deduped.set(apt.id, {
            id: apt.id,
            date: apt.date ?? formatDateFromISO(apt.timeStart),
            time: apt.time ?? formatTimeFromISO(apt.timeStart),
            counselor: apt.counselor ?? apt.counselorName ?? apt.roomName ?? 'ห้อง',
            counselorName: apt.counselorName ?? '',
            roomName: apt.roomName ?? '',
            status: apt.status,
            notes: apt.notes ?? '—',
            sessionToken: apt.sessionToken ?? null,
        });
    }

    return Array.from(deduped.values());
}

export function ClientHistory({
    appointments: initialAppointments,
    onCancelAppointment,
}: ClientHistoryProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
    const [localAppointments, setLocalAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        setLocalAppointments(normalizeAppointments(initialAppointments));
    }, [initialAppointments]);

    const filteredAppointments = useMemo(() => {
        return localAppointments.filter((apt) => {
            const q = searchTerm.toLowerCase();

            const matchesSearch =
                apt.counselor.toLowerCase().includes(q) ||
                (apt.counselorName ?? '').toLowerCase().includes(q) ||
                (apt.roomName ?? '').toLowerCase().includes(q) ||
                apt.date.toLowerCase().includes(q) ||
                (apt.sessionToken ?? '').toLowerCase().includes(q) ||
                (apt.notes ?? '').toLowerCase().includes(q);

            const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;

            return matchesSearch && matchesFilter;
        });
    }, [localAppointments, searchTerm, filterStatus]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming':
                return 'bg-blue-100 text-blue-700';
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const handleCancel = async (id: string) => {
        if (!window.confirm('คุณต้องการยกเลิกนัดหมายนี้ใช่หรือไม่?')) return;

        try {
            await onCancelAppointment?.(id);

            setLocalAppointments((prev) =>
                prev.map((apt) =>
                    apt.id === id
                        ? { ...apt, status: 'cancelled' as const }
                        : apt
                )
            );
        } catch (error) {
            console.error('Cancel appointment failed:', error);
            alert('ยกเลิกนัดหมายไม่สำเร็จ');
=======
    status: 'upcoming' | 'completed' | 'cancelled'; 
    notes?: string;
}

interface ClientHistoryProps {
    appointments: Appointment[];
    onCancelAppointment?: (id: string) => void;
}

export function ClientHistory({ appointments: initialAppointments, onCancelAppointment }: ClientHistoryProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

    // จัดการข้อมูลด้วย State เพื่อให้เมื่อลบ (Cancel) แล้วหายไปทันที
    const [localAppointments, setLocalAppointments] = useState<Appointment[]>(() => {
        const mockData: Appointment[] = [
            {
                id: '1',
                date: '24 ม.ค. 2567',
                time: '10:30',
                counselor: 'พี่ป๊อป (ห้อง 1)',
                status: 'upcoming',
                notes: 'ปรึกษาเรื่องการเรียนและแรงจูงใจ'
            },
            {
                id: '2',
                date: '15 ม.ค. 2567',
                time: '13:00',
                counselor: 'พี่น้ำขิง (ห้อง 2)',
                status: 'completed',
                notes: 'ติดตามผลจากครั้งที่แล้ว รู้สึกดีขึ้น'
            },
            {
                id: '3',
                date: '10 ม.ค. 2567',
                time: '09:00',
                counselor: 'พี่ป๊อป (ห้อง 1)',
                status: 'cancelled',
                notes: 'ติดธุระด่วนทางบ้าน'
            }
        ];
        return initialAppointments.length > 0 ? initialAppointments : mockData;
    });

    const filteredAppointments = localAppointments.filter((apt) => {
        const matchesSearch = apt.counselor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.date.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleCancel = (id: string) => {
        if (window.confirm('คุณต้องการยกเลิกนัดหมายนี้ใช่หรือไม่?')) {
            // เรียกฟังก์ชันจาก props (ถ้ามี)
            onCancelAppointment?.(id);

            // ลบข้อมูลออกจาก List ทันทีเพื่อให้ "หายไป" ตามที่ต้องการ
            setLocalAppointments(prev => prev.filter(apt => apt.id !== id));
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="mb-2 text-2xl font-bold">Session History</h1>
            <p className="mb-8 text-gray-500">View your past and upcoming counseling sessions</p>

<<<<<<< HEAD
=======
            {/* Search and Filter */}
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
            <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                        <input
                            type="text"
<<<<<<< HEAD
                            placeholder="Search by counselor, room, date, or token..."
=======
                            placeholder="Search by counselor or date..."
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)]"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Filter className="w-5 h-5 text-[var(--color-text-secondary)] mt-3" />
                        <select
                            value={filterStatus}
<<<<<<< HEAD
                            onChange={(e) =>
                                setFilterStatus(e.target.value as 'all' | 'upcoming' | 'completed' | 'cancelled')
                            }
=======
                            onChange={(e) => setFilterStatus(e.target.value as any)}
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
                            className="px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] bg-white"
                        >
                            <option value="all">All Sessions</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

<<<<<<< HEAD
=======
            {/* Appointments Table */}
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-[var(--color-border)]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--color-primary-blue)] border-b border-[var(--color-border)]">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Date</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>Time</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span>Counselor</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left">Status</th>
<<<<<<< HEAD
                                <th className="px-6 py-4 text-left">Session Token</th>
=======
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
                                <th className="px-6 py-4 text-left">Notes</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.length === 0 ? (
                                <tr>
<<<<<<< HEAD
                                    <td colSpan={7} className="px-6 py-12 text-center">
=======
                                    <td colSpan={6} className="px-6 py-12 text-center">
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
                                        <Calendar className="w-12 h-12 mx-auto mb-3 text-[var(--color-border)]" />
                                        <p>No sessions found</p>
                                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                            Try adjusting your search or filter
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAppointments.map((apt, index) => (
                                    <tr
                                        key={apt.id}
<<<<<<< HEAD
                                        className={`border-b border-[var(--color-border)] hover:bg-[var(--color-primary-blue)] transition-colors ${
                                            index % 2 === 0 ? '' : 'bg-[var(--color-primary-blue)]/30'
                                        }`}
                                    >
                                        <td className="px-6 py-4 text-[var(--color-text-primary)]">{apt.date}</td>
                                        <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                                            {apt.time !== '—' ? `${apt.time} น.` : '—'}
                                        </td>
=======
                                        className={`border-b border-[var(--color-border)] hover:bg-[var(--color-primary-blue)] transition-colors ${index % 2 === 0 ? '' : 'bg-[var(--color-primary-blue)]/30'}`}
                                    >
                                        <td className="px-6 py-4 text-[var(--color-text-primary)]">{apt.date}</td>
                                        <td className="px-6 py-4 text-[var(--color-text-secondary)]">{apt.time} น.</td>
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                                                    <User className="w-4 h-4 text-[var(--color-accent-green)]" />
                                                </div>
                                                <span className="text-[var(--color-text-primary)]">{apt.counselor}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(apt.status)}`}>
                                                {apt.status}
                                            </span>
                                        </td>
<<<<<<< HEAD
                                        <td className="px-6 py-4 text-[var(--color-text-secondary)] font-mono text-xs">
                                            {apt.sessionToken || '—'}
                                        </td>
=======
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
                                        <td className="px-6 py-4 text-[var(--color-text-secondary)] max-w-xs truncate">
                                            {apt.notes || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {apt.status === 'upcoming' && (
                                                <button
                                                    onClick={() => handleCancel(apt.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors group"
                                                    title="Cancel Appointment"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

<<<<<<< HEAD
=======
            {/* Summary Stats */}
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <p className="text-[var(--color-text-secondary)] mb-1">Total Sessions</p>
                    <p className="text-3xl font-bold text-[var(--color-text-primary)]">{localAppointments.length}</p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <p className="text-[var(--color-text-secondary)] mb-1">Upcoming</p>
                    <p className="text-3xl font-bold text-blue-600">
<<<<<<< HEAD
                        {localAppointments.filter((apt) => apt.status === 'upcoming').length}
=======
                        {localAppointments.filter(apt => apt.status === 'upcoming').length}
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
                    </p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <p className="text-[var(--color-text-secondary)] mb-1">Completed</p>
                    <p className="text-3xl font-bold text-green-600">
<<<<<<< HEAD
                        {localAppointments.filter((apt) => apt.status === 'completed').length}
=======
                        {localAppointments.filter(apt => apt.status === 'completed').length}
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
                    </p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <p className="text-[var(--color-text-secondary)] mb-1">Cancelled</p>
                    <p className="text-3xl font-bold text-red-600">
<<<<<<< HEAD
                        {localAppointments.filter((apt) => apt.status === 'cancelled').length}
=======
                        {localAppointments.filter(apt => apt.status === 'cancelled').length}
>>>>>>> 5558b0f80c17607581bbe1cdf1acd05cdf7aaa30
                    </p>
                </div>
            </div>
        </div>
    );
}