import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Home, Save, X, User, Hash, AlertCircle, CheckCircle } from 'lucide-react';

export interface TimeBlock {
    day: string;
    time: string;
    available: boolean;
    bookedBy?: string;
    studentName?: string;
    caseCode?: string;
}

export interface WaitingStudent {
    id: string;
    name: string;
    waitingSince: string;
    urgency: 'low' | 'medium' | 'high';
}

interface ManageScheduleProps {
    schedule: TimeBlock[];
    onScheduleChange: (updatedSchedule: TimeBlock[]) => void;
    onDateChange: (newDate: Date) => void;
    currentDate: Date;
    waitingStudents?: WaitingStudent[];
}

// --- Mockup Data ---
const MOCK_SCHEDULE: TimeBlock[] = [
    { day: 'จันทร์', time: '09:00', available: true },
    { day: 'จันทร์', time: '10:00', available: true, bookedBy: 'สมชาย รักเรียน', caseCode: 'CASE-67-001' },
    { day: 'จันทร์', time: '13:00', available: false },
    { day: 'อังคาร', time: '11:00', available: true, bookedBy: 'สมหญิง จริงใจ', caseCode: 'CASE-67-005' },
    { day: 'อังคาร', time: '14:00', available: true },
    { day: 'พุธ', time: '09:00', available: false },
    { day: 'พุธ', time: '15:00', available: true, bookedBy: 'วิชาการ ดีเลิศ', caseCode: 'CASE-66-089' },
    { day: 'พฤหัสบดี', time: '10:00', available: true },
    { day: 'พฤหัสบดี', time: '16:00', available: false },
    { day: 'ศุกร์', time: '09:00', available: true },
    { day: 'ศุกร์', time: '13:00', available: true, bookedBy: 'กิตติพงษ์ ใจดี', caseCode: 'CASE-67-010' },
];

const MOCK_WAITING: WaitingStudent[] = [
    { id: 'w1', name: 'นายสมชาย รักเรียน', waitingSince: '10:15 น.', urgency: 'high' },
    { id: 'w2', name: 'นางสาวใจดี มีสุข', waitingSince: '10:45 น.', urgency: 'medium' },
    { id: 'w3', name: 'นายขยัน หมั่นเพียร', waitingSince: '11:20 น.', urgency: 'low' },
];

export function ManageSchedule({
    schedule = [],
    onScheduleChange,
    onDateChange,
    currentDate,
    waitingStudents = MOCK_WAITING
}: ManageScheduleProps) {
    const [selectedRoom, setSelectedRoom] = useState('ห้องที่ปรึกษา 1');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ day: string; time: string } | null>(null);
    const [bookingType, setBookingType] = useState<'waiting' | 'caseCode'>('waiting');
    const [selectedWaitingId, setSelectedWaitingId] = useState('');
    const [caseCodeInput, setCaseCodeInput] = useState('');
    const [error, setError] = useState('');
    const [studentPreview, setStudentPreview] = useState<any>(null);

    const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];
    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    const displaySchedule = schedule.length > 0 ? schedule : MOCK_SCHEDULE;

    // จำลองการค้นหา Case Code
    const mockCaseDatabase: { [key: string]: { name: string; studentId: string; department: string } } = {
        'CASE-67-001': { name: 'สมชาย รักเรียน', studentId: '64010001', department: 'วิศวกรรมศาสตร์' },
        'CASE-67-005': { name: 'สมหญิง จริงใจ', studentId: '65020042', department: 'บริหารธุรกิจ' },
        'CASE-66-089': { name: 'วิชาการ ดีเลิศ', studentId: '64030015', department: 'ศิลปะและการสื่อสาร' },
    };

    const handleSlotClick = (day: string, time: string, block?: TimeBlock) => {
        if (block && block.bookedBy) {
            // คลิกที่ช่องที่มีการจอง → ยกเลิก/เลื่อน
            const confirmAction = window.confirm(
                `จัดการการนัดหมาย: ${block.bookedBy}\n${block.caseCode || ''}\n\nต้องการยกเลิกนัดหมายนี้ใช่หรือไม่?`
            );
            if (confirmAction) {
                const newSchedule = displaySchedule.map(b =>
                    (b.day === day && b.time === time)
                        ? { ...b, available: true, bookedBy: undefined, studentName: undefined, caseCode: undefined }
                        : b
                );
                onScheduleChange(newSchedule);
            }
        } else {
            // Toggle available/unavailable สำหรับช่องว่าง
            const blockIndex = displaySchedule.findIndex(b => b.day === day && b.time === time);
            let newSchedule = [...displaySchedule];

            if (blockIndex !== -1) {
                newSchedule = displaySchedule.map((b, index) =>
                    index === blockIndex ? { ...b, available: !b.available } : b
                );
            } else {
                newSchedule.push({ day, time, available: true });
            }
            onScheduleChange(newSchedule);
        }
    };

    const handleRightClick = (e: React.MouseEvent, day: string, time: string, block?: TimeBlock) => {
        e.preventDefault();

        // เปิด Modal เฉพาะเมื่อช่องว่าง (available และไม่มีการจอง)
        if (block && block.available && !block.bookedBy) {
            setSelectedSlot({ day, time });
            setShowBookingModal(true);
            setError('');
            setStudentPreview(null);
            setCaseCodeInput('');
            setSelectedWaitingId('');
        }
    };

    const handleCaseCodeLookup = () => {
        const code = caseCodeInput.trim().toUpperCase();
        if (!code) {
            setError('กรุณากรอกรหัสเคส');
            return;
        }

        const student = mockCaseDatabase[code];
        if (student) {
            setStudentPreview({ ...student, caseCode: code });
            setError('');
        } else {
            setError('ไม่พบรหัสเคสนี้ในระบบ');
            setStudentPreview(null);
        }
    };

    const handleConfirmBooking = () => {
        if (!selectedSlot) return;

        let studentName = '';
        let caseCode = '';

        if (bookingType === 'waiting') {
            const student = waitingStudents.find(s => s.id === selectedWaitingId);
            if (!student) {
                setError('กรุณาเลือกนักศึกษา');
                return;
            }
            studentName = student.name;
            caseCode = `NEW-${Date.now()}`; // จำลอง Case Code ใหม่
        } else {
            if (!studentPreview) {
                setError('กรุณาค้นหารหัสเคสก่อน');
                return;
            }
            studentName = studentPreview.name;
            caseCode = studentPreview.caseCode;
        }

        // อัพเดตตาราง
        const newSchedule = displaySchedule.map(b =>
            (b.day === selectedSlot.day && b.time === selectedSlot.time)
                ? { ...b, available: true, bookedBy: studentName, studentName, caseCode }
                : b
        );

        onScheduleChange(newSchedule);
        setShowBookingModal(false);
        setSelectedSlot(null);
    };

    const handleToggleAll = (available: boolean) => {
        const newSchedule: TimeBlock[] = [];
        days.forEach(day => {
            times.forEach(time => {
                const existingBlock = displaySchedule.find(b => b.day === day && b.time === time);
                if (existingBlock && existingBlock.bookedBy) {
                    newSchedule.push(existingBlock);
                } else {
                    newSchedule.push({ day, time, available });
                }
            });
        });
        onScheduleChange(newSchedule);
    };

    const getWeekRange = (date: Date) => {
        if (!date) return "";
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay() + 1);
        const end = new Date(start);
        end.setDate(start.getDate() + 4);
        return `${start.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const handlePrevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        onDateChange(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        onDateChange(newDate);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">จัดการตารางเวลา</h1>
                    <p className="text-[var(--color-text-secondary)]">ตั้งค่าช่วงเวลาที่ว่างและจัดการลำดับความสำคัญของเคสนัดหมาย</p>
                </div>
                <button
                    onClick={() => alert('บันทึกข้อมูลตารางเวลาเรียบร้อยแล้ว')}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-md"
                >
                    <Save className="w-5 h-5" />
                    บันทึกการเปลี่ยนแปลง
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
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

                <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-[var(--color-accent-blue)]" />
                        <h3 className="text-lg font-medium">สัปดาห์: {getWeekRange(currentDate)}</h3>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={handleNextWeek} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

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
                    <span className="text-sm text-gray-600">มีการจอง (คลิกซ้ายเพื่อยกเลิก)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-50 border border-green-500"></div>
                    <span className="text-sm text-gray-600 font-bold">💡 คลิกขวาที่ช่องว่างเพื่อจองนัด</span>
                </div>
            </div>

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
                                    const block = displaySchedule.find(b => b.day === day && b.time === time);
                                    if (!block) return (
                                        <td key={day} className="p-2">
                                            <button
                                                onClick={() => handleSlotClick(day, time)}
                                                onContextMenu={(e) => handleRightClick(e, day, time)}
                                                className="w-full h-16 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-100 transition-all flex items-center justify-center"
                                            >
                                                <span className="text-xs text-gray-300">+</span>
                                            </button>
                                        </td>
                                    );

                                    const statusClass = block.bookedBy
                                        ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 cursor-pointer'
                                        : block.available
                                            ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 cursor-pointer'
                                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 cursor-pointer';

                                    return (
                                        <td key={day} className="p-2">
                                            <button
                                                onClick={() => handleSlotClick(day, time, block)}
                                                onContextMenu={(e) => handleRightClick(e, day, time, block)}
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

            <div className="mt-8 flex justify-between items-center bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                <div className="text-sm text-gray-600">
                    <strong>คำแนะนำ:</strong> คลิกซ้ายที่ <b>"จองแล้ว"</b> เพื่อยกเลิกนัด | คลิกขวาที่ <b>"ช่องว่าง"</b> เพื่อจองนัดใหม่
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleToggleAll(false)}
                        className="px-6 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        ปิดทุกช่อง
                    </button>
                    <button
                        onClick={() => handleToggleAll(true)}
                        className="px-6 py-2 bg-[var(--color-accent-green)] text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                        เปิดทุกช่อง
                    </button>
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && selectedSlot && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">จองนัดหมาย</h3>
                            <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-2xl mb-6">
                            <p className="text-sm text-blue-800">
                                <strong>ช่วงเวลา:</strong> {selectedSlot.day} {selectedSlot.time} น.
                            </p>
                        </div>

                        {/* Tab Selection */}
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setBookingType('waiting')}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${bookingType === 'waiting' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                นักศึกษารอคิว (Waiting)
                            </button>
                            <button
                                onClick={() => setBookingType('caseCode')}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${bookingType === 'caseCode' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                ค้นหา Case Code
                            </button>
                        </div>

                        {/* Content */}
                        {bookingType === 'waiting' ? (
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 mb-2">เลือกนักศึกษา:</label>
                                {waitingStudents.map(student => (
                                    <button
                                        key={student.id}
                                        onClick={() => {
                                            setSelectedWaitingId(student.id);
                                            setError('');
                                        }}
                                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${selectedWaitingId === student.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-800">{student.name}</p>
                                                <p className="text-sm text-gray-500">รอตั้งแต่: {student.waitingSince}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.urgency === 'high' ? 'bg-red-100 text-red-700' :
                                                    student.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>
                                                {student.urgency === 'high' ? 'เร่งด่วน' : student.urgency === 'medium' ? 'ปานกลาง' : 'ปกติ'}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">กรอกรหัสเคส:</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={caseCodeInput}
                                                onChange={(e) => setCaseCodeInput(e.target.value.toUpperCase())}
                                                placeholder="CASE-67-001"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                            />
                                        </div>
                                        <button
                                            onClick={handleCaseCodeLookup}
                                            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
                                        >
                                            ค้นหา
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <span className="text-sm text-red-800">{error}</span>
                                    </div>
                                )}

                                {studentPreview && (
                                    <div className="p-4 bg-green-50 border-2 border-green-500 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="font-bold text-green-800">พบข้อมูลนักศึกษา</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p><strong>ชื่อ:</strong> {studentPreview.name}</p>
                                            <p><strong>รหัสนักศึกษา:</strong> {studentPreview.studentId}</p>
                                            <p><strong>คณะ:</strong> {studentPreview.department}</p>
                                            <p><strong>Case Code:</strong> {studentPreview.caseCode}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Confirm Button */}
                        <button
                            onClick={handleConfirmBooking}
                            className="w-full mt-6 py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-colors"
                        >
                            ยืนยันการจองนัดหมาย
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}