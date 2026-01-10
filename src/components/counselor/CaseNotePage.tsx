import { useState } from 'react';
import {
    User, Calendar, Clock, Save, ShieldCheck,
    ArrowLeftRight, Plus, Tag, Search, Filter, ChevronRight,
    ArrowLeft, LayoutGrid, List as ListIcon, AlertCircle, X
} from 'lucide-react';

// --- Interfaces & Types ---
interface CaseNote {
    id: string;
    caseCode: string;
    studentId: string;
    studentName: string;
    department: string;
    sessionDate: string;
    sessionTime: string;
    moodScale: number;
    selectedTags: string[];
    sessionSummary: string;
    interventions: string;
    followUp: string;
    consentSigned: boolean;
}

const defaultProblemTags = [
    'Academic Stress', 'Family Violence', 'Relationship Issues',
    'Anxiety', 'Depression', 'Financial Issues', 'Time Management',
    'Career Concerns', 'Social Anxiety', 'Grief/Loss', 'Trauma',
    'Adjustment Issues', 'Substance Use', 'Self-harm', 'Sleep Issues'
];

const moodLevels = [
    { value: 1, label: 'Very Distressed', icon: '😢' },
    { value: 2, label: 'Distressed', icon: '😟' },
    { value: 3, label: 'Neutral', icon: '😐' },
    { value: 4, label: 'Good', icon: '🙂' },
    { value: 5, label: 'Very Good', icon: '😊' },
];

export function CaseNotePage() {
    // --- States ---
    const [view, setView] = useState<'list' | 'create'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState('All');
    const [customTagInput, setCustomTagInput] = useState('');

    // Mock Data สำหรับ List
    const [cases, setCases] = useState<CaseNote[]>([
        {
            id: '1',
            caseCode: 'CASE-2024-001',
            studentId: '650610001',
            studentName: 'สมชาย ตั้งใจเรียน',
            department: 'วิศวกรรมคอมพิวเตอร์',
            sessionDate: '2026-01-05',
            sessionTime: '10:00',
            moodScale: 2,
            selectedTags: ['Academic Stress', 'Sleep Issues'],
            sessionSummary: 'นักศึกษามีความกังวลเรื่องการสอบปลายภาค...',
            interventions: 'แนะนำเทคนิคการแบ่งเวลาแบบ Pomodoro',
            followUp: 'นัดติดตามผลหลังสอบเสร็จ',
            consentSigned: true
        }
    ]);

    // State สำหรับการสร้างบันทึกใหม่
    const [newNote, setNewNote] = useState<Partial<CaseNote>>({
        caseCode: '',
        studentName: '',
        sessionDate: new Date().toISOString().split('T')[0],
        sessionTime: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        moodScale: 3,
        selectedTags: [],
        sessionSummary: '',
        interventions: '',
        followUp: ''
    });

    // --- Handlers ---
    const handleSave = () => {
        if (!newNote.studentName || !newNote.caseCode) {
            alert("กรุณาระบุชื่อนักศึกษาและรหัสเคส");
            return;
        }

        const completedNote = {
            ...newNote,
            id: String(Date.now()),
            department: 'General',
            consentSigned: true
        } as CaseNote;

        setCases([completedNote, ...cases]);
        alert('บันทึก Case Note เรียบร้อยแล้ว (Data saved for reporting)');
        setView('list');

        // Reset Form
        setNewNote({
            caseCode: '',
            studentName: '',
            sessionDate: new Date().toISOString().split('T')[0],
            sessionTime: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            moodScale: 3,
            selectedTags: [],
            sessionSummary: '',
            interventions: '',
            followUp: ''
        });
    };

    const toggleTag = (tag: string) => {
        setNewNote(prev => {
            const currentTags = prev.selectedTags || [];
            if (currentTags.includes(tag)) {
                return { ...prev, selectedTags: currentTags.filter(t => t !== tag) };
            } else {
                return { ...prev, selectedTags: [...currentTags, tag] };
            }
        });
    };

    const addCustomTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && customTagInput.trim()) {
            toggleTag(customTagInput.trim());
            setCustomTagInput('');
        }
    };

    // --- Filter Logic ---
    const filteredCases = cases.filter(c => {
        const matchesSearch = c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.caseCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = filterTag === 'All' || c.selectedTags.includes(filterTag);
        return matchesSearch && matchesTag;
    });

    // --- Render: CREATE VIEW ---
    if (view === 'create') {
        return (
            <div className="p-8 max-w-5xl mx-auto font-sans bg-[#FBFBFB] min-h-screen">
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> กลับสู่รายการเคส
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">New Session Record</h1>
                    <p className="text-gray-500 font-medium">บันทึกรายละเอียดการให้คำปรึกษาใหม่ตามมาตรฐาน PDPA</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* ข้อมูลพื้นฐาน */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-700">
                                <User className="w-5 h-5 text-green-500" /> ข้อมูลเบื้องต้น
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Case Code</label>
                                    <input
                                        placeholder="เช่น CASE-67-001"
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
                                        value={newNote.caseCode}
                                        onChange={(e) => setNewNote({ ...newNote, caseCode: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Student Name</label>
                                    <input
                                        placeholder="ระบุชื่อ-นามสกุล"
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
                                        value={newNote.studentName}
                                        onChange={(e) => setNewNote({ ...newNote, studentName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* เนื้อหาการปรึกษา */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4 text-gray-700">Session Summary (Keywords)</h3>
                            <textarea
                                rows={6}
                                placeholder="จดบันทึกประเด็นสำคัญที่พบในเซสชันนี้..."
                                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none resize-none font-medium leading-relaxed"
                                value={newNote.sessionSummary}
                                onChange={(e) => setNewNote({ ...newNote, sessionSummary: e.target.value })}
                            />
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4 text-gray-700">Follow-up Plan</h3>
                            <textarea
                                rows={3}
                                placeholder="สิ่งที่นัดหมายครั้งหน้า หรือสิ่งที่นักศึกษาต้องนำไปฝึกฝน..."
                                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none resize-none font-medium"
                                value={newNote.followUp}
                                onChange={(e) => setNewNote({ ...newNote, followUp: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* วันเวลา */}
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold mb-4 text-gray-700 flex items-center gap-2"><Clock className="w-4 h-4" /> Schedule</h3>
                            <div className="space-y-3">
                                <input type="date" value={newNote.sessionDate} onChange={(e) => setNewNote({ ...newNote, sessionDate: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border-none text-sm font-bold text-gray-600" />
                                <input type="time" value={newNote.sessionTime} onChange={(e) => setNewNote({ ...newNote, sessionTime: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border-none text-sm font-bold text-gray-600" />
                            </div>
                        </div>

                        {/* Mood */}
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold mb-4 text-gray-700">Mood Assessment</h3>
                            <div className="flex justify-between items-center px-2">
                                {moodLevels.map(m => (
                                    <button
                                        key={m.value}
                                        onClick={() => setNewNote({ ...newNote, moodScale: m.value })}
                                        className={`text-3xl p-2 rounded-2xl transition-all duration-300 ${newNote.moodScale === m.value ? 'bg-green-50 ring-2 ring-green-500 scale-110 shadow-sm' : 'grayscale opacity-40 hover:opacity-100 hover:grayscale-0'}`}
                                        title={m.label}
                                    >
                                        {m.icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tags Management */}
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold mb-4 text-gray-700 flex items-center gap-2"><Tag className="w-4 h-4" /> Problem Tags</h3>

                            {/* Selected Tags Display */}
                            <div className="flex flex-wrap gap-2 mb-4 min-h-[40px] p-2 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                {newNote.selectedTags?.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg text-[11px] font-bold shadow-sm animate-in zoom-in-75">
                                        {tag}
                                        <X className="w-3 h-3 cursor-pointer hover:text-red-200" onClick={() => toggleTag(tag)} />
                                    </span>
                                ))}
                                {newNote.selectedTags?.length === 0 && <span className="text-gray-300 text-[11px] italic font-medium">ยังไม่ได้เลือก Tag...</span>}
                            </div>

                            <div className="space-y-4">
                                <input
                                    placeholder="พิมพ์ Tag ใหม่แล้วกด Enter..."
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none text-xs outline-none focus:ring-2 focus:ring-green-400 font-medium"
                                    value={customTagInput}
                                    onChange={(e) => setCustomTagInput(e.target.value)}
                                    onKeyDown={addCustomTag}
                                />
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {defaultProblemTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${newNote.selectedTags?.includes(tag) ? 'hidden' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                        >
                                            + {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full py-5 bg-green-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-green-200 hover:bg-green-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Save className="w-5 h-5" /> Save Case Note
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Render: LIST VIEW ---
    return (
        <div className="p-8 max-w-6xl mx-auto font-sans bg-[#FBFBFB] min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Case Management</h1>
                    <p className="text-gray-500 font-medium">ศูนย์กลางจัดการบันทึกและสถิติภาพรวม</p>
                </div>
                <button
                    onClick={() => setView('create')}
                    className="flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-[1.25rem] font-black shadow-lg shadow-green-200 hover:bg-green-600 hover:-translate-y-1 transition-all"
                >
                    <Plus className="w-5 h-5" /> New Case Note
                </button>
            </header>

            {/* Search & Filter */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input
                        placeholder="ค้นหาชื่อนักศึกษา หรือ รหัสเคส..."
                        className="w-full pl-14 pr-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none text-gray-500 font-bold text-sm shadow-sm appearance-none cursor-pointer"
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                >
                    <option value="All">ทุกอาการ/ปัญหา</option>
                    {defaultProblemTags.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                    <button className="flex-1 rounded-xl bg-gray-50 text-green-600 font-black text-xs flex items-center justify-center gap-2 transition-all">
                        <ListIcon className="w-4 h-4" /> List
                    </button>
                    <button className="flex-1 rounded-xl text-gray-300 font-black text-xs flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                        <LayoutGrid className="w-4 h-4" /> Grid
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden mb-10">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/70">
                        <tr>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student / Case Code</th>
                            <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Session</th>
                            <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Mood</th>
                            <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Issues</th>
                            <th className="px-6 py-6"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredCases.map((c) => (
                            <tr key={c.id} className="hover:bg-green-50/30 transition-all group cursor-pointer">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 font-black text-lg group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                                            {c.studentName[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{c.studentName}</p>
                                            <p className="text-[11px] text-gray-400 font-bold uppercase">{c.caseCode}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {c.sessionDate}
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-2xl text-center">{moodLevels.find(m => m.value === c.moodScale)?.icon}</td>
                                <td className="px-6 py-6">
                                    <div className="flex flex-wrap gap-1">
                                        {c.selectedTags.slice(0, 1).map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-gray-100 text-[10px] font-bold text-gray-400 rounded-lg group-hover:bg-white transition-colors">{tag}</span>
                                        ))}
                                        {c.selectedTags.length > 1 && (
                                            <span className="px-2 py-1 bg-green-50 text-[10px] font-bold text-green-500 rounded-lg">+{c.selectedTags.length - 1}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <button className="p-3 text-gray-200 group-hover:text-green-500 group-hover:bg-white rounded-2xl transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredCases.length === 0 && (
                    <div className="p-20 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">ไม่พบข้อมูลที่ตรงกับการค้นหา</p>
                    </div>
                )}
            </div>

            {/* PDPA Reminder */}
            <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-center gap-5">
                <div className="bg-white p-3 rounded-2xl shadow-sm text-amber-500">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    <strong className="block mb-0.5">Confidentiality & Compliance</strong>
                    ข้อมูลทั้งหมดถูกจัดเก็บภายใต้มาตรฐานความปลอดภัยระดับสูงและใช้เพื่อการสรุปสถิติภาพรวม (Reporting) เท่านั้น
                    ผู้มีสิทธิ์เข้าถึงบันทึกนี้มีเพียงอาจารย์ผู้ให้คำปรึกษาเจ้าของเคสและผู้ดูแลระบบตามความเหมาะสม
                </p>
            </div>
        </div>
    );
}