import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, X } from 'lucide-react';

interface TimeBlock {
    day: string;
    time: string;
    available: boolean;
    bookedBy?: string;
}

export function ManageSchedule() {
    const [selectedWeek, setSelectedWeek] = useState(new Date());
    const [schedule, setSchedule] = useState<TimeBlock[]>(generateInitialSchedule());

    function generateInitialSchedule(): TimeBlock[] {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        const schedule: TimeBlock[] = [];

        days.forEach((day) => {
            times.forEach((time) => {
                const available = Math.random() > 0.3;
                const bookedBy = !available ? ['John Doe', 'Jane Smith', 'Alex Wong'][Math.floor(Math.random() * 3)] : undefined;
                schedule.push({ day, time, available, bookedBy });
            });
        });

        return schedule;
    }

    const toggleAvailability = (day: string, time: string) => {
        setSchedule((prev) =>
            prev.map((block) =>
                block.day === day && block.time === time && !block.bookedBy
                    ? { ...block, available: !block.available }
                    : block
            )
        );
    };

    const getWeekRange = (date: Date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay() + 1); // Monday
        const end = new Date(start);
        end.setDate(start.getDate() + 4); // Friday

        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const previousWeek = () => {
        const newDate = new Date(selectedWeek);
        newDate.setDate(newDate.getDate() - 7);
        setSelectedWeek(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(selectedWeek);
        newDate.setDate(newDate.getDate() + 7);
        setSelectedWeek(newDate);
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="mb-2">Manage Schedule</h1>
            <p className="mb-8">Block or unblock your available time slots</p>

            {/* Week Selector */}
            <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-[var(--color-accent-blue)]" />
                        <h3>{getWeekRange(selectedWeek)}</h3>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={previousWeek}
                            className="p-2 hover:bg-[var(--color-primary-blue)] rounded-xl transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextWeek}
                            className="p-2 hover:bg-[var(--color-primary-blue)] rounded-xl transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-500"></div>
                        <span className="text-sm text-[var(--color-text-secondary)]">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-100"></div>
                        <span className="text-sm text-[var(--color-text-secondary)]">Blocked</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-500"></div>
                        <span className="text-sm text-[var(--color-text-secondary)]">Booked</span>
                    </div>
                </div>
            </div>

            {/* Schedule Grid */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--color-primary-blue)] border-b border-[var(--color-border)]">
                            <tr>
                                <th className="px-6 py-4 text-left min-w-[100px]">
                                    <Clock className="w-5 h-5" />
                                </th>
                                {days.map((day) => (
                                    <th key={day} className="px-6 py-4 text-center min-w-[120px]">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {times.map((time, timeIndex) => (
                                <tr
                                    key={time}
                                    className={`border-b border-[var(--color-border)] ${timeIndex % 2 === 0 ? '' : 'bg-[var(--color-primary-blue)]/30'
                                        }`}
                                >
                                    <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                                        {time}
                                    </td>
                                    {days.map((day) => {
                                        const block = schedule.find((b) => b.day === day && b.time === time);
                                        if (!block) return <td key={day}></td>;

                                        const isBooked = !!block.bookedBy;
                                        const isAvailable = block.available;

                                        return (
                                            <td key={day} className="px-6 py-4">
                                                <button
                                                    onClick={() => !isBooked && toggleAvailability(day, time)}
                                                    disabled={isBooked}
                                                    className={`w-full p-3 rounded-2xl transition-all text-sm ${isBooked
                                                            ? 'bg-blue-100 border-2 border-blue-500 cursor-not-allowed'
                                                            : isAvailable
                                                                ? 'bg-green-100 border-2 border-green-500 hover:bg-green-200'
                                                                : 'bg-gray-100 hover:bg-gray-200 cursor-pointer'
                                                        }`}
                                                >
                                                    {isBooked ? (
                                                        <div className="text-xs">
                                                            <div className="text-blue-700">Booked</div>
                                                            <div className="text-blue-600 mt-1 truncate">{block.bookedBy}</div>
                                                        </div>
                                                    ) : isAvailable ? (
                                                        <div className="text-green-700">Available</div>
                                                    ) : (
                                                        <div className="text-gray-600">Blocked</div>
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
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex gap-4">
                <button
                    onClick={() => {
                        setSchedule((prev) =>
                            prev.map((block) =>
                                !block.bookedBy ? { ...block, available: true } : block
                            )
                        );
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-green)] text-white rounded-2xl hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                    Open All Slots
                </button>
                <button
                    onClick={() => {
                        setSchedule((prev) =>
                            prev.map((block) =>
                                !block.bookedBy ? { ...block, available: false } : block
                            )
                        );
                    }}
                    className="flex items-center gap-2 px-6 py-3 border border-[var(--color-border)] rounded-2xl hover:bg-[var(--color-primary-blue)] transition-colors"
                >
                    <X className="w-4 h-4" />
                    Block All Slots
                </button>
            </div>

            {/* Info */}
            <div className="mt-6 bg-[var(--color-mint-green)] rounded-3xl p-6">
                <h4 className="mb-2">Schedule Management Tips</h4>
                <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                        <span className="text-[var(--color-accent-green)] mt-1">•</span>
                        <span>Click on any available or blocked slot to toggle its status</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-[var(--color-accent-green)] mt-1">•</span>
                        <span>Booked slots cannot be blocked - cancel the appointment first</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-[var(--color-accent-green)] mt-1">•</span>
                        <span>Students can only book from your available (green) time slots</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
