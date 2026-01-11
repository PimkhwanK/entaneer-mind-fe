import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Home } from 'lucide-react';

interface TimeBlock {
    day: string;
    time: string;
    available: boolean;
    bookedBy?: string; // เก็บเป็น รหัสเคส (Case Code)
    studentName?: string;
}

export function ManageSchedule() {
    // ปรับเหลือแค่การเลือกห้องตาม Requirement
    const [selectedRoom, setSelectedRoom] = useState('ห้องที่ปรึกษา 1');
    const [selectedWeek, setSelectedWeek] = useState(new Date());
    const [schedule, setSchedule] = useState<TimeBlock[]>(generateInitialSchedule());

    function generateInitialSchedule(): TimeBlock[] {
        const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];
        const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        const schedule: TimeBlock[] = [];

        days.forEach((day) => {
            times.forEach((time) => {
                const isBooked = Math.random() < 0.2; // จำลองการจอง 20%
                schedule.push({
                    day,
                    time,
                    available: !isBooked && Math.random() > 0.3,
                    bookedBy: isBooked ? `CASE-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
                    studentName: isBooked ? 'นักศึกษาจำลอง' : undefined
                });
            });
        });

        return schedule;
    }

    const handleSlotClick = (day: string, time: string, block: TimeBlock) => {
        if (block.bookedBy) {
            const confirmCancel = window.confirm(`จัดการการนัดหมาย: ${block.bookedBy}\nคุณต้องการยกเลิกหรือเลื่อนนัดหมายเร่งด่วนนี้ใช่หรือไม่?`);
            if (confirmCancel) {
                setSchedule(prev => prev.map(b =>
                    (b.day === day && b.time === time) ? { ...b, available: true, bookedBy: undefined, studentName: undefined } : b
                ));
            }
        } else {
            setSchedule(prev => prev.map(b =>
                (b.day === day && b.time === time) ? { ...b, available: !b.available } : b
            ));
        }
    };

    const getWeekRange = (date: Date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay() + 1);
        const end = new Date(start);
        end.setDate(start.getDate() + 4);
        return `${start.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];
    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">จัดการตารางเวลา</h1>
                <p className="text-[var(--color-text-secondary)]">ตั้งค่าช่วงเวลาที่ว่างและจัดการลำดับความสำคัญของเคสนัดหมาย</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                {/* Room Selector - เอา Counselor ออก เหลือแค่ Room */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-4 text-[var(--color-accent-blue)]">
                        <Home className="w-5 h-5" />
                        <span className="font-semibold">เลือกห้องทำงาน</span>
                    </div>
                    <select
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-gray-50 outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
                    >
                        <option>ห้องที่ปรึกษา 1</option>
                        <option>ห้องที่ปรึกษา 2</option>
                        <option>ห้องกิจกรรมกลุ่ม</option>
                    </select>
                </div>

                {/* Week Selector */}
                <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-[var(--color-accent-blue)]" />
                        <h3 className="text-lg font-medium">สัปดาห์: {getWeekRange(selectedWeek)}</h3>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setSelectedWeek(new Date(selectedWeek.setDate(selectedWeek.getDate() - 7)))} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={() => setSelectedWeek(new Date(selectedWeek.setDate(selectedWeek.getDate() + 7)))} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Legend (ภาษาไทย) */}
            <div className="bg-white rounded-3xl p-4 shadow-sm mb-6 flex flex-wrap gap-6 px-8 border border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-50 border border-green-500"></div>
                    <span className="text-sm text-gray-600">ว่าง (เปิดให้จอง)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-50 border border-gray-300"></div>
                    <span className="text-sm text-gray-600">ปิด (ไม่ว่าง)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-50 border border-blue-500"></div>
                    <span className="text-sm text-gray-600">มีการจอง (คลิกเพื่อจัดการ)</span>
                </div>
            </div>

            {/* Schedule Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-[var(--color-border)] overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-[var(--color-border)]">
                            <th className="p-4 text-left"><Clock className="w-5 h-5 text-gray-400" /></th>
                            {days.map(day => (
                                <th key={day} className="p-4 text-center font-semibold text-gray-700">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {times.map((time) => (
                            <tr key={time} className="border-b border-[var(--color-border)] hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 text-sm text-gray-500 font-medium">{time} น.</td>
                                {days.map(day => {
                                    const block = schedule.find(b => b.day === day && b.time === time);
                                    if (!block) return <td key={day}></td>;

                                    const statusClass = block.bookedBy
                                        ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                                        : block.available
                                            ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100';

                                    return (
                                        <td key={day} className="p-2">
                                            <button
                                                onClick={() => handleSlotClick(day, time, block)}
                                                className={`w-full h-16 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${statusClass}`}
                                            >
                                                {block.bookedBy ? (
                                                    <>
                                                        <span className="text-[10px] font-bold uppercase">จองแล้ว</span>
                                                        <span className="text-xs font-bold">{block.bookedBy}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-xs font-medium">{block.available ? 'ว่าง' : 'ปิด'}</span>
                                                )}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-8 flex justify-between items-center bg-[var(--color-primary-blue)]/20 p-6 rounded-3xl">
                <div className="text-sm text-gray-600">
                    <strong>คำแนะนำ:</strong> คลิกที่ช่อง <b>"จองแล้ว"</b> เพื่อเลื่อนนัดหมายหรือจัดการเคสเร่งด่วน
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setSchedule(prev => prev.map(b => !b.bookedBy ? { ...b, available: false } : b))}
                        className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-white transition-colors text-sm font-medium"
                    >
                        ปิดทุกช่อง
                    </button>
                    <button
                        onClick={() => setSchedule(prev => prev.map(b => !b.bookedBy ? { ...b, available: true } : b))}
                        className="px-6 py-2 bg-[var(--color-accent-green)] text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                        เปิดทุกช่อง
                    </button>
                </div>
            </div>
        </div>
    );
}