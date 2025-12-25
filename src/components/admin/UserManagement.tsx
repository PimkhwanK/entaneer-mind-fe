import React, { useState } from 'react';
import { Search, Filter, User, Mail, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'counselor';
    status: 'pending' | 'active' | 'suspended';
    registeredDate: string;
    department?: string;
}

interface UserManagementProps {
    users: UserData[];
    onApprove: (userId: string) => void;
    onSuspend: (userId: string) => void;
}

export function UserManagement({ users, onApprove, onSuspend }: UserManagementProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'student' | 'counselor'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.department?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'suspended':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'student':
                return 'bg-blue-100 text-blue-700';
            case 'counselor':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="mb-2">User Management</h1>
            <p className="mb-8">Manage student and counselor registrations</p>

            {/* Search and Filters */}
            <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)]"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-[var(--color-text-secondary)]" />
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value as any)}
                                className="px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] bg-white"
                            >
                                <option value="all">All Roles</option>
                                <option value="student">Students</option>
                                <option value="counselor">Counselors</option>
                            </select>
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">Total Users</p>
                    <p className="text-3xl text-[var(--color-text-primary)]">{users.length}</p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">Pending</p>
                    <p className="text-3xl text-yellow-600">
                        {users.filter((u) => u.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">Active</p>
                    <p className="text-3xl text-green-600">
                        {users.filter((u) => u.status === 'active').length}
                    </p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">Suspended</p>
                    <p className="text-3xl text-red-600">
                        {users.filter((u) => u.status === 'suspended').length}
                    </p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--color-primary-blue)] border-b border-[var(--color-border)]">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span>Name</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span>Email</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left">Role</th>
                                <th className="px-6 py-4 text-left">Department</th>
                                <th className="px-6 py-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Registered</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <User className="w-12 h-12 mx-auto mb-3 text-[var(--color-border)]" />
                                        <p>No users found</p>
                                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                            Try adjusting your search or filters
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <tr
                                        key={user.id}
                                        className={`border-b border-[var(--color-border)] hover:bg-[var(--color-primary-blue)] transition-colors ${index % 2 === 0 ? '' : 'bg-[var(--color-primary-blue)]/30'
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                                                    <User className="w-4 h-4 text-[var(--color-accent-green)]" />
                                                </div>
                                                <span className="text-[var(--color-text-primary)]">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--color-text-secondary)]">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm capitalize ${getRoleColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                                            {user.department || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                                            {user.registeredDate}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(user.status)}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {user.status === 'pending' && (
                                                    <button
                                                        onClick={() => onApprove(user.id)}
                                                        className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {user.status === 'active' && (
                                                    <button
                                                        onClick={() => onSuspend(user.id)}
                                                        className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                                                        title="Suspend"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {user.status === 'suspended' && (
                                                    <button
                                                        onClick={() => onApprove(user.id)}
                                                        className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                                                        title="Reactivate"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
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
            </div>

            {/* Info Notice */}
            <div className="mt-6 bg-[var(--color-mint-green)] rounded-3xl p-6">
                <h4 className="mb-2">User Management Guidelines</h4>
                <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                        <span className="text-[var(--color-accent-green)] mt-1">•</span>
                        <span>Review pending registrations and approve or deny based on CMU credentials</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-[var(--color-accent-green)] mt-1">•</span>
                        <span>Suspended users cannot access the platform until reactivated</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-[var(--color-accent-green)] mt-1">•</span>
                        <span>All actions are logged for security and audit purposes</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
