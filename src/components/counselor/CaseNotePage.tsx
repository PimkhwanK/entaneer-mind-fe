import { useEffect, useMemo, useState } from 'react';
import {
    Calendar, Clock, User, Save, ShieldCheck,
    Plus, Tag, Search, ChevronRight,
    ArrowLeft, List as ListIcon, AlertCircle, X,
    FileText, MessageSquare, ClipboardCheck
} from 'lucide-react';

import { API_ENDPOINTS, getAuthHeader } from '../../config/api.config';

type View = 'list' | 'edit';

interface TagItem {
    id: number;
    label: string;
}

interface CaseRecord {
    id: string;          // sessionId as string
    sessionId: number;
    caseCode: string;

    studentId: string;
    studentName: string;
    department: string;

    sessionDate: string; // YYYY-MM-DD
    sessionTime: string; // HH:mm

    moodScale: number;   // 1-5
    selectedTags: string[]; // labels

    sessionSummary: string;   // counselorKeyword
    interventions: string;    // counselorNote
    followUp: string;         // counselorFollowup

    consentSigned: boolean;   // from user.isConsentAccepted
    clientText: string;       // text student typed at booking
}

const moodLevels = [
    { value: 1, label: 'Very Distressed', icon: '😢' },
    { value: 2, label: 'Distressed', icon: '😟' },
    { value: 3, label: 'Neutral', icon: '😐' },
    { value: 4, label: 'Good', icon: '🙂' },
    { value: 5, label: 'Very Good', icon: '😊' },
];

const emptyNote = (): CaseRecord => ({
    id: '',
    sessionId: 0,
    caseCode: '',
    studentId: '',
    studentName: '',
    department: '',
    sessionDate: '',
    sessionTime: '',
    moodScale: 3,
    selectedTags: [],
    sessionSummary: '',
    interventions: '',
    followUp: '',
    consentSigned: false,
    clientText: '',
});

export function CaseNotePage() {
    const [view, setView] = useState<View>('list');

    const [isLoading, setIsLoading] = useState(true);
    const [records, setRecords] = useState<CaseRecord[]>([]);
    const [problemTags, setProblemTags] = useState<TagItem[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState('All');
    const [sortBy, setSortBy] = useState('date-newest');

    const [customTagInput, setCustomTagInput] = useState('');
    const [error, setError] = useState('');

    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [editHistory, setEditHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [note, setNote] = useState<CaseRecord | null>(null);
    const [lookupLoading, setLookupLoading] = useState(false);

    const tagIdByLabel = useMemo(() => {
        const map = new Map<string, number>();
        for (const t of problemTags) map.set(t.label, t.id);
        return map;
    }, [problemTags]);

    const selectedTagIds = useMemo(() => {
        if (!note) return [];
        return (note.selectedTags || [])
            .map(lbl => tagIdByLabel.get(lbl))
            .filter((x): x is number => typeof x === 'number');
    }, [note, tagIdByLabel]);

    const fetchProblemTags = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.PROBLEM_TAGS.ALL, { headers: getAuthHeader() });
            if (!res.ok) throw new Error(await res.text());
            setProblemTags(await res.json());
        } catch (e) {
            console.error(e);
            setProblemTags([]);
        }
    };

    const fetchRecords = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(API_ENDPOINTS.SESSIONS.COUNSELOR_RECORDS, { headers: getAuthHeader() });
            if (!res.ok) throw new Error(await res.text());
            setRecords(await res.json());
        } catch (e) {
            console.error(e);
            setRecords([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCaseNote = async (sessionId: number) => {
        try {
            const res = await fetch(API_ENDPOINTS.SESSIONS.GET_CASE_NOTE(sessionId), { headers: getAuthHeader() });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setNote(data);
            setSelectedSessionId(sessionId);
            // Fetch edit history
            setEditHistory([]);
            setShowHistory(false);
            setHistoryLoading(true);
            try {
                const hRes = await fetch(API_ENDPOINTS.SESSIONS.EDIT_HISTORY(sessionId), { headers: getAuthHeader() });
                if (hRes.ok) {
                    const hData = await hRes.json();
                    setEditHistory(hData.history ?? []);
                }
            } catch { /* ignore */ } finally {
                setHistoryLoading(false);
            }
            setView('edit');
        } catch (e: any) {
            console.error(e);
            alert(e?.message || 'โหลดข้อมูลไม่สำเร็จ');
        }
    };

    // ✅ NEW: lookup by caseCode (this is the behavior you want)
    const lookupByCaseCode = async () => {
        if (!note) return;
        const code = (note.caseCode || '').trim().toUpperCase();
        if (!code) return;

        try {
            setLookupLoading(true);
            const res = await fetch(API_ENDPOINTS.SESSIONS.GET_CASE_NOTE_BY_CODE(code), {
                headers: getAuthHeader(),
            });
            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            setSelectedSessionId(data.sessionId);
            setNote(data); // ✅ fills EVERYTHING
            setError('');
        } catch (e: any) {
            console.error(e);
            setSelectedSessionId(null);
            setError('ไม่พบ Case Code นี้ หรือไม่ใช่ของผู้ให้คำปรึกษาคนนี้');
        } finally {
            setLookupLoading(false);
        }
    };

    useEffect(() => {
        fetchProblemTags();
        fetchRecords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleTagByLabel = (label: string) => {
        if (!note) return;
        const current = note.selectedTags || [];
        if (current.includes(label)) {
            setNote({ ...note, selectedTags: current.filter(t => t !== label) });
        } else {
            setNote({ ...note, selectedTags: [...current, label] });
        }
    };

    const addCustomTag = async (e: React.KeyboardEvent) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();

        const label = customTagInput.trim();
        if (!label) return;

        try {
            const res = await fetch(API_ENDPOINTS.PROBLEM_TAGS.CREATE, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ label }),
            });

            if (!res.ok) throw new Error(await res.text());
            const created: TagItem = await res.json();

            setProblemTags(prev => {
                if (prev.some(t => t.id === created.id)) return prev;
                return [...prev, created].sort((a, b) => a.label.localeCompare(b.label));
            });

            // auto-select in current note
            if (note && !note.selectedTags.includes(created.label)) {
                setNote({ ...note, selectedTags: [...note.selectedTags, created.label] });
            }

            setCustomTagInput('');
        } catch (e: any) {
            console.error(e);
            alert(e?.message || 'เพิ่ม Tag ไม่สำเร็จ');
        }
    };

    const deleteTag = async (tagId: number) => {
        if (!window.confirm('ต้องการลบ Tag นี้จากระบบใช่หรือไม่?')) return;
        try {
            const res = await fetch(API_ENDPOINTS.PROBLEM_TAGS.DELETE(tagId), {
                method: 'DELETE',
                headers: getAuthHeader(),
            });
            if (!res.ok) throw new Error(await res.text());

            const tag = problemTags.find(t => t.id === tagId);
            setProblemTags(prev => prev.filter(t => t.id !== tagId));

            if (tag && note) {
                setNote({ ...note, selectedTags: (note.selectedTags || []).filter(lbl => lbl !== tag.label) });
            }

            alert('ลบ Tag แล้ว');
        } catch (e: any) {
            console.error(e);
            alert(e?.message || 'ลบ Tag ไม่สำเร็จ');
        }
    };

    const handleSave = async () => {
        if (!note) return;

        // ✅ block save until case code lookup has loaded a real session
        if (!selectedSessionId) {
            alert('กรุณากรอก Case Code และค้นหาก่อนบันทึก');
            return;
        }

        try {
            const res = await fetch(API_ENDPOINTS.SESSIONS.UPDATE_CASE_NOTE(selectedSessionId), {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    moodScale: note.moodScale,
                    sessionSummary: note.sessionSummary,
                    interventions: note.interventions,
                    followUp: note.followUp,
                    selectedTagIds: selectedTagIds,
                    markCompleted: false,
                }),
            });

            if (!res.ok) throw new Error(await res.text());

            alert('บันทึก Case Note เรียบร้อยแล้ว');
            await fetchRecords();
            await loadCaseNote(selectedSessionId);
        } catch (e: any) {
            console.error(e);
            alert(e?.message || 'บันทึกไม่สำเร็จ');
        }
    };

    const filteredRecords = useMemo(() => {
        return records
            .filter(r => {
                const matchesSearch =
                    (r.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (r.caseCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (r.studentId || '').toLowerCase().includes(searchTerm.toLowerCase());

                const matchesTag = filterTag === 'All' || (r.selectedTags || []).includes(filterTag);
                return matchesSearch && matchesTag;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'date-newest': return new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime();
                    case 'date-oldest': return new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
                    case 'name-asc': return (a.studentName || '').localeCompare(b.studentName || '', 'th');
                    case 'name-desc': return (b.studentName || '').localeCompare(a.studentName || '', 'th');
                    case 'mood-high': return b.moodScale - a.moodScale;
                    case 'mood-low': return a.moodScale - b.moodScale;
                    default: return 0;
                }
            });
    }, [records, searchTerm, filterTag, sortBy]);

    /* ==================== EDIT VIEW ==================== */
    if (view === 'edit' && note) {
        return (
            <div className="p-8 max-w-5xl mx-auto font-sans bg-[#FBFBFB] min-h-screen">
                <button
                    onClick={() => {
                        setView('list');
                        setNote(null);
                        setSelectedSessionId(null);
                        setCustomTagInput('');
                        setError('');
                    }}
                    className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-6 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> กลับสู่รายการเคส
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">New Session Record</h1>
                    <p className="text-gray-500 font-medium mt-1">บันทึกรายละเอียดการให้คำปรึกษาใหม่ตามมาตรฐาน PDPA</p>
                </div>

                {/* Student text from booking */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">
                        ข้อความจากนักศึกษา (ตอนจอง)
                    </h3>
                    <p className="text-gray-700 font-medium whitespace-pre-wrap">
                        {note.clientText || "—"}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-700">
                                <User className="w-5 h-5 text-green-500" /> ข้อมูลพื้นฐาน
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
                                {/* ✅ Case Code is editable and triggers lookup */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Case Code</label>
                                    <input
                                        placeholder="เช่น CASE-66-001"
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
                                        value={note.caseCode}
                                        onChange={(e) => setNote({ ...note, caseCode: e.target.value.toUpperCase() })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                lookupByCaseCode();
                                            }
                                        }}
                                        onBlur={lookupByCaseCode}
                                    />
                                    {lookupLoading && <p className="text-xs text-gray-400">กำลังค้นหา...</p>}
                                    {error && (
                                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mt-2">
                                            <AlertCircle className="w-4 h-4 text-red-600" />
                                            <span className="text-xs text-red-800">{error}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Student Name</label>
                                    <input
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-medium"
                                        value={note.studentName}
                                        readOnly
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
                                        value={note.sessionDate}
                                        readOnly
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-medium text-gray-600"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Session Time
                                    </label>
                                    <input
                                        type="time"
                                        value={note.sessionTime}
                                        readOnly
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-medium text-gray-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase ml-1">Mood Assessment</label>
                                <div className="grid grid-cols-5 gap-3 p-4 bg-gray-50 rounded-2xl">
                                    {moodLevels.map(m => (
                                        <button
                                            key={m.value}
                                            onClick={() => setNote({ ...note, moodScale: m.value })}
                                            className={`text-3xl p-4 rounded-xl transition-all duration-300 flex flex-col items-center gap-2 ${note.moodScale === m.value ? 'bg-white ring-2 ring-green-500 scale-105 shadow-md' : 'grayscale opacity-40 hover:opacity-100 hover:grayscale-0 hover:bg-white/50'}`}
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
                            <h3 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-green-500" /> Session Summary (Keywords)
                            </h3>
                            <textarea
                                rows={6}
                                placeholder="จดบันทึกประเด็นสำคัญที่พบในเซสชันนี้..."
                                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none resize-none font-medium leading-relaxed"
                                value={note.sessionSummary}
                                onChange={(e) => setNote({ ...note, sessionSummary: e.target.value })}
                            />
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-blue-500" /> Interventions Applied
                            </h3>
                            <textarea
                                rows={3}
                                placeholder="ระบุกิจกรรมหรือคำแนะนำที่ให้แก่นักศึกษา..."
                                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none resize-none font-medium"
                                value={note.interventions}
                                onChange={(e) => setNote({ ...note, interventions: e.target.value })}
                            />
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-amber-500" /> Follow-up Plan
                            </h3>
                            <textarea
                                rows={3}
                                placeholder="สิ่งที่นัดหมายครั้งหน้า หรือสิ่งที่นักศึกษาต้องนำไปฝึกฝน..."
                                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none resize-none font-medium"
                                value={note.followUp}
                                onChange={(e) => setNote({ ...note, followUp: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold mb-4 text-gray-700 flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Problem Tags
                            </h3>

                            {/* selected tags */}
                            <div className="flex flex-wrap gap-2 mb-4 min-h-[60px] p-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                {note.selectedTags?.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-[11px] font-bold shadow-sm">
                                        {tag}
                                        <X className="w-3 h-3 cursor-pointer hover:text-red-200" onClick={() => toggleTagByLabel(tag)} />
                                    </span>
                                ))}
                                {note.selectedTags?.length === 0 && (
                                    <span className="text-gray-300 text-xs italic font-medium self-center">
                                        ยังไม่ได้เลือก Tag...
                                    </span>
                                )}
                            </div>

                            {/* add tag */}
                            <input
                                placeholder="พิมพ์ Tag ใหม่แล้วกด Enter..."
                                className="w-full p-3 bg-gray-50 rounded-xl border-none text-xs outline-none focus:ring-2 focus:ring-green-400 font-medium mb-3"
                                value={customTagInput}
                                onChange={(e) => setCustomTagInput(e.target.value)}
                                onKeyDown={addCustomTag}
                            />

                            {/* available tags from DB (with delete) */}
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {problemTags.map(t => {
                                    const selected = note.selectedTags?.includes(t.label);
                                    return (
                                        <div key={t.id} className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleTagByLabel(t.label)}
                                                className={`flex-1 px-3 py-2 rounded-xl text-[11px] font-bold transition-all text-left ${selected
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {selected ? '✓ ' : '+ '} {t.label}
                                            </button>

                                            <button
                                                onClick={() => deleteTag(t.id)}
                                                className="px-3 py-2 rounded-xl text-[11px] font-black bg-red-50 text-red-600 hover:bg-red-100"
                                                title="Delete tag from database"
                                            >
                                                ลบ
                                            </button>
                                        </div>
                                    );
                                })}
                                {problemTags.length === 0 && (
                                    <p className="text-xs text-gray-400">ไม่มี Tag ในระบบ</p>
                                )}
                            </div>
                        </div>

                        <div className={`rounded-[2rem] p-6 border flex items-center gap-4 ${note.consentSigned ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                            <div className="p-3 rounded-2xl bg-white">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black uppercase tracking-tight">PDPA Consent</p>
                                <p className="text-sm font-bold mt-1">
                                    {note.consentSigned ? 'Signed & Verified' : 'Not Signed'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full py-5 bg-green-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-green-200 hover:bg-green-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Save className="w-5 h-5" /> Save Case Note
                        </button>

                        {/* ── Edit History ── */}
                        <div className="mt-6 bg-gray-50 rounded-[1.5rem] border border-gray-200 overflow-hidden">
                            <button
                                onClick={() => setShowHistory(v => !v)}
                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2 font-bold text-gray-700">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    ประวัติการแก้ไข
                                    {editHistory.length > 0 && (
                                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                            {editHistory.length}
                                        </span>
                                    )}
                                </div>
                                <span className="text-gray-400 text-sm">{showHistory ? '▲' : '▼'}</span>
                            </button>

                            {showHistory && (
                                <div className="border-t border-gray-200 divide-y divide-gray-100 max-h-80 overflow-y-auto">
                                    {historyLoading ? (
                                        <div className="px-6 py-8 text-center text-gray-400 text-sm">กำลังโหลด...</div>
                                    ) : editHistory.length === 0 ? (
                                        <div className="px-6 py-8 text-center text-gray-400 text-sm">ยังไม่มีประวัติการแก้ไข</div>
                                    ) : editHistory.map((h: any) => (
                                        <div key={h.historyId} className="px-6 py-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-blue-600">
                                                    แก้ไขโดย {h.editorName}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(h.timestamp).toLocaleString('th-TH', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            {h.after && (
                                                <div className="space-y-1 text-xs text-gray-600">
                                                    {h.after.counselorKeyword && (
                                                        <p><span className="font-medium text-gray-500">สรุป:</span> {h.after.counselorKeyword}</p>
                                                    )}
                                                    {h.after.counselorNote && (
                                                        <p><span className="font-medium text-gray-500">แนวทาง:</span> {h.after.counselorNote}</p>
                                                    )}
                                                    {h.after.counselorFollowup && (
                                                        <p><span className="font-medium text-gray-500">ติดตาม:</span> {h.after.counselorFollowup}</p>
                                                    )}
                                                    {h.after.tagIds?.length > 0 && (
                                                        <p><span className="font-medium text-gray-500">Tags:</span> {h.after.tagIds.join(', ')}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ==================== LIST VIEW ==================== */
    return (
        <div className="p-8 max-w-6xl mx-auto font-sans bg-[#FBFBFB] min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Case Management</h1>
                    <p className="text-gray-500 font-medium">ศูนย์กลางจัดการบันทึกและสถิติภาพรวม</p>
                </div>

                {/* ✅ NEW BEHAVIOR: make everything empty */}
                <button
                    onClick={() => {
                        setSelectedSessionId(null);
                        setNote(emptyNote());
                        setError('');
                        setView('edit');
                    }}
                    className="flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-[1.25rem] font-black shadow-lg shadow-green-200 hover:bg-green-600 hover:-translate-y-1 transition-all"
                >
                    <Plus className="w-5 h-5" /> New Case Note
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input
                        placeholder="ค้นหาชื่อนักศึกษา / รหัสเคส / studentId..."
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
                    {problemTags.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
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
                </select>

                <div className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                    <button className="flex-1 rounded-xl bg-gray-50 text-green-600 font-black text-xs flex items-center justify-center gap-2 transition-all">
                        <ListIcon className="w-4 h-4" /> List
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
                        ) : filteredRecords.map((c) => (
                            <tr
                                key={c.id}
                                onClick={() => loadCaseNote(c.sessionId)}
                                className="hover:bg-green-50/30 transition-all group cursor-pointer"
                            >
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 font-black text-lg group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                                            {c.studentName ? c.studentName[0] : '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{c.studentName || "—"}</p>
                                            <p className="text-[11px] text-gray-400 font-bold uppercase">{c.caseCode}</p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {c.sessionDate} {c.sessionTime}
                                    </div>
                                </td>

                                <td className="px-6 py-6 text-2xl text-center">
                                    {moodLevels.find(m => m.value === c.moodScale)?.icon}
                                </td>

                                <td className="px-6 py-6">
                                    <div className="flex flex-wrap gap-1">
                                        {c.selectedTags?.slice(0, 1).map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-gray-100 text-[10px] font-bold text-gray-400 rounded-lg group-hover:bg-white transition-colors">{tag}</span>
                                        ))}
                                        {c.selectedTags && c.selectedTags.length > 1 && (
                                            <span className="px-2 py-1 bg-green-50 text-[10px] font-bold text-green-500 rounded-lg">
                                                +{c.selectedTags.length - 1}
                                            </span>
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

                {!isLoading && filteredRecords.length === 0 && (
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