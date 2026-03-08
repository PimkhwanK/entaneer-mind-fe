import { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Home, Save, Hash, AlertCircle, User } from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL, getAuthHeader } from '../../config/api.config';

export interface TimeBlock {
    day: string;
    time: string;
    available: boolean;
    bookedBy?: string;
    caseCode?: string;
    sessionId?: number;
    date?: string;
    status?: string;
}

export interface AvailableRooms {
    id: string;
    name: string;
    counselorId?: number | null;
    roomOwner?: string | null;
}

interface CounselorOption {
    userId: number;
    firstName: string;
    lastName: string;
}

interface ManageScheduleProps {
    schedule: TimeBlock[];
    onScheduleChange: (updatedSchedule: TimeBlock[]) => void;
    onDateChange: (newDate: Date) => void;
    currentDate: Date;
    currentCounselorId?: number | null;
}

const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];
const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];

function pad2(n: number) {
    return String(n).padStart(2, '0');
}

function toYYYYMMDD(d: Date) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function mondayOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function ManageSchedule({
    schedule = [],
    onScheduleChange,
    onDateChange,
    currentDate,
    currentCounselorId,
}: ManageScheduleProps) {
    const [rooms, setRooms] = useState<AvailableRooms[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');
    const [localSchedule, setLocalSchedule] = useState<TimeBlock[]>(schedule);

    const [showAddRoom, setShowAddRoom] = useState(false);
    const [showDeleteRoom, setShowDeleteRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [error, setError] = useState('');

    const [counselors, setCounselors] = useState<CounselorOption[]>([]);
    const [selectedCounselorId, setSelectedCounselorId] = useState<number | ''>('');

    const weekStart = useMemo(() => toYYYYMMDD(mondayOfWeek(currentDate)), [currentDate]);
    const selectedRoom = useMemo(
        () => rooms.find((r) => r.id === selectedRoomId),
        [rooms, selectedRoomId]
    );

    const fetchCounselors = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/counselor/counselors`, {
                headers: getAuthHeader(),
            });
            if (!res.ok) return;

            const data = await res.json();
            // Backend returns { success, data: { counselors: [...] } } or array
            const list: any[] = Array.isArray(data) ? data : (data.data?.counselors ?? data.counselors ?? []);
            setCounselors(
                list.map((u: any) => ({
                    userId: u.userId,
                    firstName: u.firstName,
                    lastName: u.lastName,
                }))
            );
        } catch (e) {
            console.error('fetchCounselors:', e);
        }
    };

    const fetchRooms = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.SESSION_PORTAL.ROOMS, {
                headers: getAuthHeader(),
            });
            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            setRooms(data);

            // auto-select ห้องของ counselor ตัวเอง (match counselorId)
            if (!selectedRoomId && data.length > 0) {
                const myRoom = currentCounselorId
                    ? data.find((r: AvailableRooms) => r.counselorId === currentCounselorId)
                    : null;
                setSelectedRoomId(myRoom ? myRoom.id : data[0].id);
            }
        } catch (e) {
            console.error(e);
            setRooms([]);
        }
    };

    const fetchSchedule = async (roomId: string) => {
        try {
            const url = API_ENDPOINTS.SESSION_PORTAL.SCHEDULE(roomId, weekStart);
            const res = await fetch(url, { headers: getAuthHeader() });
            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();

            const blocks: TimeBlock[] = (data.blocks || []).map((b: any) => ({
                day: b.day,
                time: b.time,
                available: !!b.available,
                bookedBy: b.bookedBy,
                caseCode: b.caseCode,
                sessionId: b.sessionId,
                date: b.date,
                status: b.status,
            }));

            setLocalSchedule(blocks);
            onScheduleChange(blocks);

            if (data.roomOwner !== undefined) {
                setRooms((prev) =>
                    prev.map((room) =>
                        room.id === String(roomId)
                            ? { ...room, roomOwner: data.roomOwner, counselorId: data.counselorId }
                            : room
                    )
                );
            }
        } catch (e) {
            console.error(e);
            setLocalSchedule([]);
            onScheduleChange([]);
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchCounselors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentCounselorId]);

    useEffect(() => {
        if (selectedRoomId) fetchSchedule(selectedRoomId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRoomId, weekStart]);

    const displaySchedule = localSchedule;

    const getWeekRange = (date: Date) => {
        const start = mondayOfWeek(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 4);

        return `${start.toLocaleDateString('th-TH', {
            month: 'short',
            day: 'numeric'
        })} - ${end.toLocaleDateString('th-TH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })}`;
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

    const handleToggleAll = async (makeAvailable: boolean) => {
        if (!selectedRoomId) return;

        try {
            const res = await fetch(API_ENDPOINTS.SESSION_PORTAL.BULK_WEEK, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    roomId: Number(selectedRoomId),
                    weekStart,
                    makeAvailable,
                }),
            });

            if (!res.ok) throw new Error(await res.text());
            await fetchSchedule(selectedRoomId);
        } catch (e: any) {
            alert(e?.message || 'ทำรายการไม่สำเร็จ');
        }
    };

    const handleSlotClick = async (day: string, time: string, block?: TimeBlock) => {
        setError('');

        if (block?.bookedBy && block.sessionId) {
            const ok = window.confirm(
                `ยกเลิกนัดหมายนี้ใช่หรือไม่?\n${block.bookedBy}\n${block.caseCode ?? ''}`
            );
            if (!ok) return;

            try {
                const res = await fetch(
                    API_ENDPOINTS.SESSION_PORTAL.CANCEL_BOOKING(block.sessionId),
                    {
                        method: 'POST',
                        headers: getAuthHeader(),
                    }
                );

                if (!res.ok) throw new Error(await res.text());
                await fetchSchedule(selectedRoomId);
            } catch (e: any) {
                alert(e?.message || 'ยกเลิกไม่สำเร็จ');
            }
            return;
        }

        try {
            const dayIndex = days.indexOf(day);
            const d = new Date(`${weekStart}T00:00:00`);
            d.setDate(d.getDate() + (dayIndex >= 0 ? dayIndex : 0));
            const dateStr = toYYYYMMDD(d);

            const res = await fetch(API_ENDPOINTS.SESSION_PORTAL.TOGGLE_SLOT, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    roomId: Number(selectedRoomId),
                    date: dateStr,
                    time,
                }),
            });

            if (!res.ok) throw new Error(await res.text());
            await fetchSchedule(selectedRoomId);
        } catch (e: any) {
            alert(e?.message || 'เปลี่ยนสถานะไม่สำเร็จ');
        }
    };

    const handleAddRoom = async () => {
        const name = newRoomName.trim();
        if (!name) return;
        setError('');

        try {
            const body: Record<string, any> = { roomName: name };
            if (selectedCounselorId !== '') body.counselorId = selectedCounselorId;

            const res = await fetch(API_ENDPOINTS.SESSION_PORTAL.CREATE_ROOM, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error(await res.text());
            const created = await res.json();

            setRooms((prev) => [...prev, created]);
            setSelectedRoomId(created.id);
            setNewRoomName('');
            setSelectedCounselorId('');
            setShowAddRoom(false);
        } catch (e: any) {
            setError(e?.message || 'เพิ่มห้องไม่สำเร็จ');
        }
    };

    const handleRemoveRoom = async (roomId: string) => {
        const ok = window.confirm('ต้องการลบห้องนี้ใช่หรือไม่?');
        if (!ok) return;

        try {
            const res = await fetch(API_ENDPOINTS.SESSION_PORTAL.DELETE_ROOM(roomId), {
                method: 'DELETE',
                headers: getAuthHeader(),
            });

            if (!res.ok) throw new Error(await res.text());

            const updated = rooms.filter((r) => r.id !== roomId);
            setRooms(updated);
            if (selectedRoomId === roomId) setSelectedRoomId(updated[0]?.id || '');
        } catch (e: any) {
            setError(e?.message || 'ลบห้องไม่สำเร็จ');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        จัดการตารางเวลา
                    </h1>
                    <p className="text-[var(--color-text-secondary)]">
                        ตั้งค่าช่วงเวลาที่ว่างและจัดการลำดับความสำคัญของเคสนัดหมาย
                    </p>
                </div>
                <button
                    onClick={() => alert('การเปลี่ยนแปลงถูกบันทึกทันทีเมื่อคลิกแต่ละช่อง ✅')}
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
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                                {room.name}{currentCounselorId && room.counselorId === currentCounselorId ? ' ★' : ''}
                            </option>
                        ))}
                    </select>

                    {/* badge ห้องของฉัน */}
                    {selectedRoom && currentCounselorId && selectedRoom.counselorId === currentCounselorId && (
                        <div className="mt-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-xl">
                            <p className="text-xs font-bold text-green-600">★ ห้องของคุณ</p>
                        </div>
                    )}

                    {selectedRoomId && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600">
                                เจ้าของห้อง:{' '}
                                <span className="font-semibold text-gray-800">
                                    {selectedRoom?.roomOwner || 'ยังไม่ได้กำหนด'}
                                </span>
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => {
                                setShowAddRoom((prev) => !prev);
                                setShowDeleteRoom(false);
                                setError('');
                            }}
                            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                        >
                            เพิ่มห้อง
                        </button>
                        <button
                            onClick={() => {
                                setShowDeleteRoom(true);
                                setShowAddRoom(false);
                                setError('');
                            }}
                            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                        >
                            ลบห้อง
                        </button>
                    </div>

                    {showAddRoom && (
                        <div className="p-4 bg-gray-50 rounded-xl space-y-3 mt-4">
                            <p className="text-sm text-gray-600 font-medium">กรอกชื่อห้องใหม่:</p>

                            <input
                                type="text"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddRoom()}
                                placeholder="ชื่อห้อง เช่น ห้อง 1"
                                autoFocus
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
                            />

                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-1.5">
                                    <User className="w-4 h-4" />
                                    Counselor เจ้าของห้อง
                                </label>
                                <select
                                    value={selectedCounselorId}
                                    onChange={(e) =>
                                        setSelectedCounselorId(
                                            e.target.value === '' ? '' : Number(e.target.value)
                                        )
                                    }
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">-- ไม่ระบุ --</option>
                                    {counselors.map((c) => (
                                        <option key={c.userId} value={c.userId}>
                                            {c.firstName} {c.lastName}
                                        </option>
                                    ))}
                                </select>

                                {counselors.length === 0 && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        ไม่พบ counselor ในระบบ
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddRoom}
                                    disabled={!newRoomName.trim()}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                                >
                                    บันทึก
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddRoom(false);
                                        setNewRoomName('');
                                        setSelectedCounselorId('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    )}

                    {showDeleteRoom && (
                        <div className="p-4 bg-gray-50 rounded-xl space-y-3 mt-4">
                            <p className="text-sm text-gray-600 font-medium">
                                เลือกห้องที่ต้องการลบ:
                            </p>
                            <div className="space-y-2">
                                {rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-200"
                                    >
                                        <span className="text-gray-700">{room.name}</span>
                                        <button
                                            onClick={() => handleRemoveRoom(room.id)}
                                            className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            ลบ
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowDeleteRoom(false)}
                                className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                                ปิด
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mt-4">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-sm text-red-800">{error}</span>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-[var(--color-accent-blue)]" />
                        <h3 className="text-lg font-medium">
                            สัปดาห์: {getWeekRange(currentDate)}
                        </h3>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevWeek}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleNextWeek}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
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
                    <span className="text-sm text-gray-600">
                        มีการจอง (คลิกซ้ายเพื่อยกเลิก)
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-[var(--color-border)] overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-[var(--color-border)]">
                            <th className="p-4 text-left">
                                <Clock className="w-5 h-5 text-gray-400" />
                            </th>
                            {days.map((day) => (
                                <th key={day} className="p-4 text-center font-semibold text-gray-700">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {times.map((time) => (
                            <tr
                                key={time}
                                className="border-b border-[var(--color-border)] hover:bg-gray-50/50 transition-colors"
                            >
                                <td className="p-4 text-sm text-gray-500 font-medium">{time} น.</td>

                                {days.map((day) => {
                                    const block = displaySchedule.find(
                                        (b) => b.day === day && b.time === time
                                    );

                                    if (!block) {
                                        return (
                                            <td key={day} className="p-2">
                                                <button
                                                    onClick={() => handleSlotClick(day, time)}
                                                    className="w-full h-16 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-100 transition-all flex items-center justify-center"
                                                    title="คลิกเพื่อสร้าง slot"
                                                >
                                                    <Hash className="w-4 h-4 text-gray-300" />
                                                </button>
                                            </td>
                                        );
                                    }

                                    const isBooked = !!block.bookedBy;
                                    const isAvailable =
                                        !isBooked &&
                                        (block.status || '').toLowerCase() === 'available';

                                    const statusClass = isBooked
                                        ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 cursor-pointer'
                                        : isAvailable
                                            ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 cursor-pointer'
                                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 cursor-pointer';

                                    return (
                                        <td key={day} className="p-2">
                                            <button
                                                onClick={() => handleSlotClick(day, time, block)}
                                                className={`w-full h-16 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${statusClass}`}
                                            >
                                                {isBooked ? (
                                                    <>
                                                        <span className="text-[10px] font-bold uppercase">
                                                            จองแล้ว
                                                        </span>
                                                        <span className="text-xs font-bold">
                                                            {block.bookedBy}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-xs font-medium">
                                                        {isAvailable ? 'ว่าง' : 'ปิด'}
                                                    </span>
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
                    <strong>คำแนะนำ:</strong> คลิกซ้ายที่ <b>"จองแล้ว"</b> เพื่อยกเลิกนัด |
                    คลิกซ้ายที่ช่องเพื่อสลับ <b>ว่าง/ปิด</b>
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
        </div>
    );
}