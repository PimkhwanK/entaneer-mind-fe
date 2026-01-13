import { useState, useEffect } from 'react';
import {
    User, Calendar, Clock, Save, ShieldCheck,
    Plus, Tag, Search, ChevronRight,
    ArrowLeft, LayoutGrid, List as ListIcon, AlertCircle, X,
    FileText, MessageSquare, ClipboardCheck
} from 'lucide-react';

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

const MOCK_CASES: CaseNote[] = [
    {
        id: '1',
        caseCode: 'CASE-67-001',
        studentId: '64010001',
        studentName: 'สมชาย รักเรียน',
        department: 'วิศวกรรมศาสตร์',
        sessionDate: '2026-01-10',
        sessionTime: '10:00',
        moodScale: 2,
        selectedTags: ['Academic Stress', 'Anxiety'],
        sessionSummary: 'นักศึกษามีความกังวลเรื่องการสอบปลายภาคที่กำลังจะถึง มีอาการนอนไม่หลับและเครียดสะสมจากการอ่านหนังสือไม่ทัน',
        interventions: 'แนะนำเทคนิคการแบ่งเวลาและการทำสมาธิ รวมถึงการจัดตารางอ่านหนังสือแบบ Pomodoro',
        followUp: 'ติดตามผลหลังสอบเสร็จ เพื่อประเมินระดับความเครียดอีกครั้ง',
        consentSigned: true
    },
    {
        id: '2',
        caseCode: 'CASE-67-005',
        studentId: '65020042',
        studentName: 'วิภาดา แก้วใส',
        department: 'บริหารธุรกิจ',
        sessionDate: '2026-01-12',
        sessionTime: '14:30',
        moodScale: 4,
        selectedTags: ['Relationship Issues'],
        sessionSummary: 'ปัญหาความขัดแย้งกับเพื่อนร่วมกลุ่มในวิชาสัมมนา เนื่องจากความคิดเห็นไม่ตรงกันในการแบ่งงาน',
        interventions: 'ฝึกการสื่อสารแบบประนีประนอม (Assertive Communication)',
        followUp: 'นัดคุยความคืบหน้าสัปดาห์หน้าหลังจากได้คุยกับเพื่อนในกลุ่มแล้ว',
        consentSigned: true
    },
    {
        id: '3',
        caseCode: 'CASE-66-089',
        studentId: '64030015',
        studentName: 'ธันวา มาดี',
        department: 'ศิลปะและการสื่อสาร',
        sessionDate: '2026-01-05',
        sessionTime: '09:00',
        moodScale: 5,
        selectedTags: ['Career Concerns'],
        sessionSummary: 'ปรึกษาเรื่องการเตรียมตัวฝึกงานและพอร์ตฟอลิโอ มีความมั่นใจมากขึ้นหลังจากได้รับคำแนะนำครั้งก่อน',
        interventions: 'ช่วยตรวจสอบลำดับการนำเสนอผลงานและจุดเด่นของพอร์ตฟอลิโอ',
        followUp: 'ปิดเคสเนื่องจากนักศึกษาได้ที่ฝึกงานตามที่ตั้งใจไว้แล้ว',
        consentSigned: true
    }
];

export function CaseNotePage() {
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [selectedCase, setSelectedCase] = useState<CaseNote | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState('All');
    const [sortBy, setSortBy] = useState('date-newest');
    const [customTagInput, setCustomTagInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [cases, setCases] = useState<CaseNote[]>([]);
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

    useEffect(() => {
        const fetchCases = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/casenotes');
                if (response.ok) {
                    const data = await response.json();
                    setCases(data);
                } else {
                    setCases(MOCK_CASES);
                }
            } catch (error) {
                console.error("Failed to fetch case notes, using mock data:", error);
                setCases(MOCK_CASES);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCases();
    }, []);

    const handleSave = async () => {
        if (!newNote.studentName || !newNote.caseCode) {
            alert("กรุณาระบุชื่อนักศึกษาและรหัสเคส");
            return;
        }
        try {
            const response = await fetch('/api/casenotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNote),
            });
            if (response.ok) {
                const savedNote = await response.json();
                setCases([savedNote, ...cases]);
                alert('บันทึก Case Note เรียบร้อยแล้ว');
                setView('list');
            } else {
                const localSavedNote = {
                    ...newNote,
                    id: Math.random().toString(36).substr(2, 9),
                    selectedTags: newNote.selectedTags || []
                } as CaseNote;
                setCases([localSavedNote, ...cases]);
                alert('บันทึก Case Note เรียบร้อยแล้ว (Local Mode)');
                setView('list');
            }
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
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
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

    const handleViewDetail = (c: CaseNote) => {
        setSelectedCase(c);
        setView('detail');
    };

    const filteredCases = cases
        .filter(c => {
            const matchesSearch = (c.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (c.caseCode?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesTag = filterTag === 'All' || c.selectedTags.includes(filterTag);
            return matchesSearch && matchesTag;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'date-newest':
                    return new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime();
                case 'date-oldest':
                    return new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
                case 'name-asc':
                    return (a.studentName || '').localeCompare(b.studentName || '', 'th');
                case 'name-desc':
                    return (b.studentName || '').localeCompare(a.studentName || '', 'th');
                case 'mood-high':
                    return b.moodScale - a.moodScale;
                case 'mood-low':
                    return a.moodScale - b.moodScale;
                case 'case-code':
                    return (a.caseCode || '').localeCompare(b.caseCode || '');
                default:
                    return 0;
            }
        });

    if (view === 'detail' && selectedCase) {
        return (
            <div className="p-8 max-w-5xl mx-auto font-sans bg-[#FBFBFB] min-h-screen">
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> กลับสู่รายการเคส
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-green-200">Active Case</span>
                            <span className="text-gray-400 font-bold text-sm">{selectedCase.caseCode}</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-800 tracking-tight">{selectedCase.studentName}</h1>
                        <p className="text-gray-500 font-medium mt-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> บันทึกเมื่อ {selectedCase.sessionDate} เวลา {selectedCase.sessionTime} น.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-600 shadow-sm transition-all" onClick={() => setView('list')}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <MessageSquare className="w-24 h-24" />
                            </div>
                            <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-700">
                                <FileText className="w-5 h-5 text-green-500" /> Session Summary
                            </h3>
                            <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                                {selectedCase.sessionSummary || "ไม่มีข้อมูลสรุปเซสชัน"}
                            </p>
                        </div>
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-700">
                                <ShieldCheck className="w-5 h-5 text-blue-500" /> Interventions & Actions
                            </h3>
                            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                <p className="text-gray-700 font-medium leading-relaxed">
                                    {selectedCase.interventions || "ไม่ได้ระบุการดำเนินการ"}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-700">
                                <ClipboardCheck className="w-5 h-5 text-amber-500" /> Follow-up Plan
                            </h3>
                            <p className="text-gray-600 font-medium leading-relaxed italic">
                                "{selectedCase.followUp || "ไม่มีแผนการติดตามผล"}"
                            </p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm text-center">
                            <h3 className="font-bold mb-6 text-gray-400 uppercase text-xs tracking-widest">Client Mood</h3>
                            <div className="text-7xl mb-4">
                                {moodLevels.find(m => m.value === selectedCase.moodScale)?.icon}
                            </div>
                            <p className="text-xl font-black text-gray-700">
                                {moodLevels.find(m => m.value === selectedCase.moodScale)?.label}
                            </p>
                        </div>
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold mb-5 text-gray-700 flex items-center gap-2"><Tag className="w-4 h-4" /> Issues Identified</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedCase.selectedTags?.map(tag => (
                                    <span key={tag} className="px-4 py-2 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl text-xs font-bold">
                                        {tag}
                                    </span>
                                ))}
                                {selectedCase.selectedTags?.length === 0 && <span className="text-gray-300 italic text-sm">No tags assigned</span>}
                            </div>
                        </div>
                        <div className={`rounded-[2rem] p-6 border flex items-center gap-4 ${selectedCase.consentSigned ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                            <div className="p-3 rounded-2xl bg-white">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-tight">PDPA Consent</p>
                                <p className="text-sm font-bold">{selectedCase.consentSigned ? 'Signed & Verified' : 'Not Signed'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'create') {
        return (
            <div className="p-8 max-w-5xl mx-auto font-sans bg-[#FBFBFB] min-h-screen">
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> กลับสู่รายการเคส
                </button>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">New Session Record</h1>
                    <p className="text-gray-500 font-medium mt-1">บันทึกรายละเอียดการให้คำปรึกษาใหม่ตามมาตรฐาน PDPA</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-700">
                                <User className="w-5 h-5 text-green-500" /> ข้อมูลพื้นฐาน
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Session Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newNote.sessionDate}
                                        onChange={(e) => setNewNote({ ...newNote, sessionDate: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium text-gray-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Session Time
                                    </label>
                                    <input
                                        type="time"
                                        value={newNote.sessionTime}
                                        onChange={(e) => setNewNote({ ...newNote, sessionTime: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium text-gray-600"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase ml-1">Mood Assessment</label>
                                <div className="grid grid-cols-5 gap-3 p-4 bg-gray-50 rounded-2xl">
                                    {moodLevels.map(m => (
                                        <button
                                            key={m.value}
                                            onClick={() => setNewNote({ ...newNote, moodScale: m.value })}
                                            className={`text-3xl p-4 rounded-xl transition-all duration-300 flex flex-col items-center gap-2 ${newNote.moodScale === m.value ? 'bg-white ring-2 ring-green-500 scale-105 shadow-md' : 'grayscale opacity-40 hover:opacity-100 hover:grayscale-0 hover:bg-white/50'}`}
                                            title={m.label}
                                        >
                                            <span>{m.icon}</span>
                                            <span className="text-[9px] font-bold text-gray-500">{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
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
                            <h3 className="text-lg font-bold mb-4 text-gray-700">Interventions Applied</h3>
                            <textarea
                                rows={3}
                                placeholder="ระบุกิจกรรมหรือคำแนะนำที่ให้แก่นักศึกษา..."
                                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none resize-none font-medium"
                                value={newNote.interventions}
                                onChange={(e) => setNewNote({ ...newNote, interventions: e.target.value })}
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
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold mb-4 text-gray-700 flex items-center gap-2"><Tag className="w-4 h-4" /> Problem Tags</h3>
                            <div className="flex flex-wrap gap-2 mb-4 min-h-[60px] p-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                {newNote.selectedTags?.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-[11px] font-bold shadow-sm">
                                        {tag}
                                        <X className="w-3 h-3 cursor-pointer hover:text-red-200" onClick={() => toggleTag(tag)} />
                                    </span>
                                ))}
                                {newNote.selectedTags?.length === 0 && <span className="text-gray-300 text-xs italic font-medium self-center">ยังไม่ได้เลือก Tag...</span>}
                            </div>
                            <div className="space-y-3">
                                <input
                                    placeholder="พิมพ์ Tag ใหม่แล้วกด Enter..."
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none text-xs outline-none focus:ring-2 focus:ring-green-400 font-medium"
                                    value={customTagInput}
                                    onChange={(e) => setCustomTagInput(e.target.value)}
                                    onKeyDown={addCustomTag}
                                />
                                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
                    className="bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none text-gray-500 font-bold text-sm shadow-sm cursor-pointer"
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                >
                    <option value="All">ทุกอาการ/ปัญหา</option>
                    {defaultProblemTags.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                    className="bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none text-gray-500 font-bold text-sm shadow-sm cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="date-newest">📅 วันที่ล่าสุด</option>
                    <option value="date-oldest">📅 วันที่เก่าสุด</option>
                    <option value="name-asc">👤 ชื่อ A-Z</option>
                    <option value="name-desc">👤 ชื่อ Z-A</option>
                    <option value="mood-high">😊 Mood สูง-ต่ำ</option>
                    <option value="mood-low">😢 Mood ต่ำ-สูง</option>
                    <option value="case-code">🔢 รหัสเคส</option>
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
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-10 text-center text-gray-400">Loading case records...</td></tr>
                        ) : filteredCases.map((c) => (
                            <tr key={c.id} onClick={() => handleViewDetail(c)} className="hover:bg-green-50/30 transition-all group cursor-pointer">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 font-black text-lg group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                                            {c.studentName ? c.studentName[0] : '?'}
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
                                        {c.selectedTags?.slice(0, 1).map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-gray-100 text-[10px] font-bold text-gray-400 rounded-lg group-hover:bg-white transition-colors">{tag}</span>
                                        ))}
                                        {c.selectedTags && c.selectedTags.length > 1 && (
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
                {!isLoading && filteredCases.length === 0 && (
                    <div className="p-20 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">ไม่พบข้อมูลที่ตรงกับการค้นหา</p>
                    </div>
                )}
            </div>
            <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-center gap-5">
                <div className="bg-white p-3 rounded-2xl shadow-sm text-amber-500">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    <strong className="block mb-0.5">Confidentiality & Compliance</strong>
                    ข้อมูลทั้งหมดถูกจัดเก็บภายใต้มาตรฐานความปลอดภัยระดับสูงและใช้เพื่อการสรุปสถิติภาพรวม (Reporting) เท่านั้น
                </p>
            </div>
        </div>
    );
}