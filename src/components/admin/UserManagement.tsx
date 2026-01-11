import React, { useState } from 'react';
import { Search, UserCheck, UserMinus, Shield, User, Key, CheckCircle, XCircle } from 'lucide-react';

interface UserData {
    id: string;
    studentId?: string;
    name: string;
    email: string;
    role: 'student' | 'counselor' | 'admin';
    status: 'pending' | 'active' | 'suspended';
    registeredDate: string;
    department?: string;
    registrationCode?: string; // รหัส Token ที่ใช้สมัคร
}

interface UserManagementProps {
    users: UserData[];
    onApprove: (id: string) => void;
    onSuspend: (id: string) => void;
    onRoleChange?: (id: string, newRole: 'student' | 'counselor' | 'admin') => void;
}

export function UserManagement({ users, onApprove, onSuspend, onRoleChange }: UserManagementProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.studentId?.includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
                    <p className="text-gray-500">จัดการสิทธิ์ผู้ใช้งานและตรวจสอบการลงทะเบียน (Student/Counselor)</p>
                </div>
            </header>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ, รหัสนักศึกษา หรืออีเมล..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="all">ทุกบทบาท</option>
                    <option value="student">Student</option>
                    <option value="counselor">Counselor</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-gray-600">ผู้ใช้งาน</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-600">บทบาท</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-600">รหัสลงทะเบียน</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-600">สถานะ</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-600 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'counselor' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {user.role === 'counselor' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.studentId || user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-red-100 text-red-600' :
                                            user.role === 'counselor' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <Key className="w-3 h-3" />
                                        <span className="text-sm font-mono">{user.registrationCode || '-'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {user.status === 'active' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                        {user.status === 'pending' && <Clock className="w-4 h-4 text-orange-500" />}
                                        {user.status === 'suspended' && <XCircle className="w-4 h-4 text-red-500" />}
                                        <span className={`text-sm font-medium ${user.status === 'active' ? 'text-green-600' :
                                                user.status === 'pending' ? 'text-orange-600' : 'text-red-600'
                                            }`}>
                                            {user.status === 'active' ? 'ใช้งานปกติ' : user.status === 'pending' ? 'รออนุมัติ' : 'ระงับการใช้งาน'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {user.status === 'pending' && (
                                            <button
                                                onClick={() => onApprove(user.id)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="อนุมัติ"
                                            >
                                                <UserCheck className="w-5 h-5" />
                                            </button>
                                        )}
                                        {user.status !== 'suspended' && (
                                            <button
                                                onClick={() => onSuspend(user.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="ระงับการใช้งาน"
                                            >
                                                <UserMinus className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="py-12 text-center text-gray-400">
                        <p>ไม่พบข้อมูลผู้ใช้งานที่ตรงตามเงื่อนไข</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper component for pending status icon
function Clock({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    );
}