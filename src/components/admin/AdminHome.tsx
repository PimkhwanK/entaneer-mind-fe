import React from 'react';
import { Users, Calendar, Activity, TrendingUp, UserCheck, Clock, AlertCircle, BarChart3, ArrowUpRight } from 'lucide-react';

interface AdminStats {
    totalUsers: number;
    activeStudents: number;
    activeCounselors: number;
    pendingApprovals: number;
    totalSessions: number;
    sessionsThisMonth: number;
    upcomingSessions: number;
    averageWaitTime: string;
    topIssueTags: { tag: string; count: number }[];
}

interface AdminHomeProps {
    stats: AdminStats;
    onNavigateToApprovals?: () => void;
    onGenerateReport?: () => void;
}

export function AdminHome({ stats, onNavigateToApprovals, onGenerateReport }: AdminHomeProps) {
    // ป้องกันกรณี stats เป็น undefined
    if (!stats) {
        return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูลสถิติ...</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                <p className="text-gray-500">ภาพรวมระบบและข้อมูลสถิติสำคัญของ Entaneer Mind</p>
            </header>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <button
                    onClick={onNavigateToApprovals}
                    className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-orange-100 hover:border-orange-300 transition-all text-left relative overflow-hidden group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1 font-medium">รอการอนุมัติ (Pending)</p>
                    <h2 className="text-3xl font-bold text-gray-800">{stats.pendingApprovals || 0}</h2>
                    <p className="text-xs text-orange-600 mt-2 font-bold">ต้องการการตรวจสอบด่วน</p>
                </button>

                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-1 font-medium">นักศึกษาในระบบ</p>
                    <h2 className="text-3xl font-bold text-gray-800">{stats.activeStudents || 0}</h2>
                    <p className="text-xs text-blue-600 mt-2">จากทั้งหมด {stats.totalUsers || 0} บัญชี</p>
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-1 font-medium">ผู้ให้คำปรึกษา (Active)</p>
                    <h2 className="text-3xl font-bold text-gray-800">{stats.activeCounselors || 0}</h2>
                    <p className="text-xs text-purple-600 mt-2">พร้อมให้บริการในระบบ</p>
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-1 font-medium">นัดหมายเดือนนี้</p>
                    <h2 className="text-3xl font-bold text-gray-800">{stats.sessionsThisMonth || 0}</h2>
                    <p className="text-xs text-green-600 mt-2">เสร็จสิ้นแล้ว {stats.totalSessions || 0} เคส</p>
                </div>
            </div>

            {/* Main Stats & Issues Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-6 h-6 text-green-500" />
                            <h3 className="text-xl font-bold text-gray-800">ปัญหาที่พบบ่อย (Problem Tags)</h3>
                        </div>
                    </div>
                    <div className="space-y-5">
                        {(stats.topIssueTags || []).length > 0 ? (
                            (stats.topIssueTags || []).map((issue, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-600">{issue.tag}</span>
                                        <span className="text-sm font-bold text-gray-800">{issue.count} เคส</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div
                                            className="bg-green-400 h-2.5 rounded-full transition-all duration-1000"
                                            style={{ width: `${stats.totalSessions > 0 ? (issue.count / stats.totalSessions) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-gray-400">
                                <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>ยังไม่มีข้อมูลแท็กปัญหาที่บันทึกในระบบ</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-[2.5rem] p-8 text-white shadow-lg">
                        <h3 className="text-white/80 font-medium mb-4 flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4" /> Average Wait Time
                        </h3>
                        <p className="text-5xl font-bold mb-2">{stats.averageWaitTime || '0d'}</p>
                        <p className="text-white/70 text-sm">ระยะเวลารอคิวโดยเฉลี่ยในเดือนนี้</p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={onGenerateReport}
                                className="w-full px-5 py-4 bg-gray-50 text-gray-700 rounded-2xl hover:bg-green-500 hover:text-white transition-all text-left font-bold"
                            >
                                Generate Full Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// เพิ่มบรรทัดนี้เพื่อให้ App.tsx เรียกใช้ได้แบบ default
export default AdminHome;