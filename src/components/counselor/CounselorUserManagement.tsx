import React, { useState } from 'react';
import {
    Search, UserPlus, UserCheck, Shield, User,
    CheckCircle, X, AlertCircle
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────
type UserRole = 'client' | 'counselor';
type UserStatus = 'active' | 'pending';

interface ManagedUser {
    id: string;
    firstName: string;
    lastName: string;
    cmuAccount: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
    department?: string;
}

interface NewUserForm {
    firstName: string;
    lastName: string;
    cmuAccount: string;
    role: UserRole;
    department: string;
    priority: 'low' | 'medium' | 'high';
}

interface CounselorUserManagementProps {
    users?: ManagedUser[];
    onApprove?: (id: string) => void;
    onAddUser?: (form: NewUserForm) => Promise<void>;
}

// ── Mockup ─────────────────────────────────────────────────────
const MOCK_USERS: ManagedUser[] = [
    {
        id: '1', firstName: 'สมชาย', lastName: 'รักเรียน',
        cmuAccount: '650612001@cmu.ac.th', role: 'client',
        status: 'active', createdAt: '2025-01-10', department: 'วิศวกรรมคอมพิวเตอร์'
    },
    {
        id: '2', firstName: 'ใจดี', lastName: 'มีสุข',
        cmuAccount: '650612002@cmu.ac.th', role: 'client',
        status: 'pending', createdAt: '2025-01-15', department: 'วิศวกรรมไฟฟ้า'
    },
    {
        id: '3', firstName: 'วิภาดา', lastName: 'แก้วใส',
        cmuAccount: 'wiphada.k@cmu.ac.th', role: 'counselor',
        status: 'active', createdAt: '2024-08-01',
    },
];

const EMPTY_FORM: NewUserForm = {
    firstName: '',
    lastName: '',
    cmuAccount: '',
    role: 'client',
    department: '',
    priority: 'medium',
};

// ── Component ──────────────────────────────────────────────────
export function CounselorUserManagement({
    users: initialUsers,
    onApprove,
    onAddUser,
}: CounselorUserManagementProps) {

    const [users, setUsers] = useState<ManagedUser[]>(initialUsers || MOCK_USERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | UserStatus>('all');

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState<NewUserForm>(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // ── Filter ─────────────────────────────────────────────────
    const filtered = users.filter(u => {
        const q = searchTerm.toLowerCase();
        const matchSearch =
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q) ||
            u.cmuAccount.toLowerCase().includes(q) ||
            (u.department || '').toLowerCase().includes(q);
        const matchRole = filterRole === 'all' || u.role === filterRole;
        const matchStatus = filterStatus === 'all' || u.status === filterStatus;
        return matchSearch && matchRole && matchStatus;
    });

    // ── Actions ────────────────────────────────────────────────
    const handleApprove = (id: string) => {
        onApprove?.(id);
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' } : u));
    };

    const handleSubmitAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        // Validation
        if (!form.firstName.trim() || !form.lastName.trim() || !form.cmuAccount.trim()) {
            setSubmitError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        if (!form.cmuAccount.includes('@')) {
            setSubmitError('รูปแบบ CMU Account ไม่ถูกต้อง');
            return;
        }
        if (form.role === 'client' && !form.department.trim()) {
            setSubmitError('กรุณาระบุคณะ/ภาควิชาสำหรับนักศึกษา');
            return;
        }

        setIsSubmitting(true);
        try {
            await onAddUser?.(form);

            // เพิ่มลงใน local state (mockup)
            const newUser: ManagedUser = {
                id: Date.now().toString(),
                firstName: form.firstName,
                lastName: form.lastName,
                cmuAccount: form.cmuAccount,
                role: form.role,
                status: form.role === 'client' ? 'active' : 'pending',
                createdAt: new Date().toISOString().split('T')[0],
                department: form.role === 'client' ? form.department : undefined,
            };
            setUsers(prev => [newUser, ...prev]);
            setForm(EMPTY_FORM);
            setShowAddModal(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            setSubmitError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Helpers ────────────────────────────────────────────────
    const statusLabel = (s: UserStatus) =>
        s === 'active' ? 'ใช้งานปกติ' : 'รออนุมัติ';

    const statusColor = (s: UserStatus) =>
        s === 'active' ? 'text-green-600' : 'text-orange-600';

    const statusIcon = (s: UserStatus) =>
        s === 'active'
            ? <CheckCircle className="w-4 h-4 text-green-500" />
            : <AlertCircle className="w-4 h-4 text-orange-500" />;

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">

            {/* ── Header ── */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">จัดการผู้ใช้งาน</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                        เพิ่ม แก้ไข และจัดการสิทธิ์ผู้ใช้งานในระบบ Entaneer Mind
                    </p>
                </div>
                <button
                    onClick={() => { setShowAddModal(true); setSubmitError(''); }}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-green)] text-white rounded-2xl hover:opacity-90 transition-opacity font-bold shadow-sm shrink-0"
                >
                    <UserPlus className="w-5 h-5" />
                    เพิ่มผู้ใช้ใหม่
                </button>
            </header>

            {/* ── Success Banner ── */}
            {showSuccess && (
                <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-4">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span className="font-medium">เพิ่มผู้ใช้งานเรียบร้อยแล้ว</span>
                </div>
            )}

            {/* ── Filters ── */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-[var(--color-border)] mb-6 flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ, CMU Account, คณะ..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[var(--color-accent-green)] transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[var(--color-accent-green)]"
                    value={filterRole}
                    onChange={e => setFilterRole(e.target.value as typeof filterRole)}
                >
                    <option value="all">ทุก Role</option>
                    <option value="client">Client (นักศึกษา)</option>
                    <option value="counselor">Counselor</option>
                </select>
                <select
                    className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[var(--color-accent-green)]"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                >
                    <option value="all">ทุกสถานะ</option>
                    <option value="active">ใช้งานปกติ</option>
                    <option value="pending">รออนุมัติ</option>
                </select>
            </div>

            {/* ── Users Table ── */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-[var(--color-border)] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-gray-600">ผู้ใช้งาน</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-600">CMU Account</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-600">Role</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-600">สถานะ</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-600">ข้อมูลเพิ่มเติม</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-600 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                    <User className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p>ไม่พบข้อมูลผู้ใช้งานที่ตรงตามเงื่อนไข</p>
                                </td>
                            </tr>
                        ) : (
                            filtered.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    {/* ชื่อ */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'counselor'
                                                ? 'bg-purple-100 text-purple-600'
                                                : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {user.role === 'counselor'
                                                    ? <Shield className="w-5 h-5" />
                                                    : <User className="w-5 h-5" />
                                                }
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                <p className="text-xs text-gray-400">เพิ่มเมื่อ {user.createdAt}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* CMU Account */}
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600 font-mono">{user.cmuAccount}</span>
                                    </td>

                                    {/* Role */}
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'counselor'
                                            ? 'bg-purple-100 text-purple-600'
                                            : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {statusIcon(user.status)}
                                            <span className={`text-sm font-medium ${statusColor(user.status)}`}>
                                                {statusLabel(user.status)}
                                            </span>
                                        </div>
                                    </td>

                                    {/* ข้อมูลเพิ่มเติม */}
                                    <td className="px-6 py-4">
                                        {user.role === 'client' && user.department && (
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                {user.department}
                                            </span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {user.status === 'pending' && (
                                                <button
                                                    onClick={() => handleApprove(user.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="อนุมัติ"
                                                >
                                                    <UserCheck className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-4 flex gap-6 text-sm text-gray-500">
                <span>ทั้งหมด <b className="text-gray-800">{users.length}</b> คน</span>
                <span>Client <b className="text-blue-600">{users.filter(u => u.role === 'client').length}</b></span>
                <span>Counselor <b className="text-purple-600">{users.filter(u => u.role === 'counselor').length}</b></span>
                <span>รออนุมัติ <b className="text-orange-500">{users.filter(u => u.status === 'pending').length}</b></span>
            </div>

            {/* ════════════════════════════════════════
                Modal: เพิ่มผู้ใช้ใหม่
            ════════════════════════════════════════ */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto">

                        {/* Close */}
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--color-mint-green)] flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-[var(--color-accent-green)]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">เพิ่มผู้ใช้ใหม่</h3>
                                <p className="text-sm text-gray-500">สร้างบัญชีผู้ใช้งานในระบบโดยตรง</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitAddUser} className="space-y-5">

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทผู้ใช้</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(['client', 'counselor'] as const).map(r => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, role: r }))}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all ${form.role === r
                                                ? 'bg-[var(--color-accent-green)] text-white'
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {r === 'counselor' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                            {r === 'client' ? 'Client (นักศึกษา)' : 'Counselor'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ชื่อ-นามสกุล */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.firstName}
                                        onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)]"
                                        placeholder="ชื่อ"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.lastName}
                                        onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)]"
                                        placeholder="นามสกุล"
                                    />
                                </div>
                            </div>

                            {/* CMU Account */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CMU Account</label>
                                <input
                                    type="text"
                                    required
                                    value={form.cmuAccount}
                                    onChange={e => setForm(f => ({ ...f, cmuAccount: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] font-mono"
                                    placeholder="example@cmu.ac.th"
                                />
                            </div>

                            {/* Fields เฉพาะ Client */}
                            {form.role === 'client' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            คณะ/ภาควิชา <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.department}
                                            onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)]"
                                            placeholder="เช่น วิศวกรรมคอมพิวเตอร์"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ระดับความเร่งด่วน
                                        </label>
                                        <div className="flex gap-3">
                                            {(['low', 'medium', 'high'] as const).map(p => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${form.priority === p
                                                        ? p === 'high'
                                                            ? 'bg-red-500 text-white'
                                                            : p === 'medium'
                                                                ? 'bg-yellow-400 text-white'
                                                                : 'bg-green-500 text-white'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {p === 'high' ? 'เร่งด่วนมาก' : p === 'medium' ? 'ปานกลาง' : 'ปกติ'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {submitError && (
                                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-2xl px-4 py-3">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{submitError}</span>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 border border-[var(--color-border)] text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] py-3 bg-[var(--color-accent-green)] text-white rounded-2xl hover:opacity-90 transition-opacity font-bold disabled:opacity-50"
                                >
                                    {isSubmitting ? 'กำลังเพิ่ม...' : 'เพิ่มผู้ใช้งาน'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}