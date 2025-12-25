import React, { useState } from 'react';
import { User, Calendar, Clock, Save, Smile, Frown, Meh } from 'lucide-react';

interface StudentProfile {
    name: string;
    studentId: string;
    department: string;
    previousSessions: number;
}

interface CaseNotePageProps {
    student: StudentProfile;
    onSave: (caseNote: any) => void;
}

const problemTags = [
    'Academic Stress', 'Anxiety', 'Depression', 'Relationship Issues',
    'Family Problems', 'Self-esteem', 'Sleep Issues', 'Time Management',
    'Career Concerns', 'Social Anxiety', 'Grief/Loss', 'Trauma',
    'Adjustment Issues', 'Substance Use', 'Other'
];

const moodLevels = [
    { value: 1, label: 'Very Distressed', icon: '😢', color: 'text-red-500' },
    { value: 2, label: 'Distressed', icon: '😟', color: 'text-orange-500' },
    { value: 3, label: 'Neutral', icon: '😐', color: 'text-yellow-500' },
    { value: 4, label: 'Good', icon: '🙂', color: 'text-green-500' },
    { value: 5, label: 'Very Good', icon: '😊', color: 'text-green-600' },
];

export function CaseNotePage({ student, onSave }: CaseNotePageProps) {
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
    const [sessionTime, setSessionTime] = useState('14:00');
    const [moodScale, setMoodScale] = useState(3);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sessionSummary, setSessionSummary] = useState('');
    const [interventions, setInterventions] = useState('');
    const [followUp, setFollowUp] = useState('');

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSave = () => {
        const caseNote = {
            student,
            sessionDate,
            sessionTime,
            moodScale,
            selectedTags,
            sessionSummary,
            interventions,
            followUp,
            createdAt: new Date().toISOString(),
        };
        onSave(caseNote);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="mb-2">Case Notes</h1>
            <p className="mb-8">Document session details and client progress</p>

            {/* Student Profile Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                <h3 className="mb-4">Student Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-mint-green)] flex items-center justify-center">
                            <User className="w-6 h-6 text-[var(--color-accent-green)]" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-secondary)]">Name</p>
                            <p className="text-[var(--color-text-primary)]">{student.name}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-secondary)]">Student ID</p>
                        <p className="text-[var(--color-text-primary)]">{student.studentId}</p>
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-secondary)]">Department</p>
                        <p className="text-[var(--color-text-primary)]">{student.department}</p>
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-secondary)]">Previous Sessions</p>
                        <p className="text-[var(--color-text-primary)]">{student.previousSessions}</p>
                    </div>
                </div>
            </div>

            {/* Session Details */}
            <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                <h3 className="mb-4">Session Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                            Session Date
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                            <input
                                type="date"
                                value={sessionDate}
                                onChange={(e) => setSessionDate(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)]"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                            Session Time
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                            <input
                                type="time"
                                value={sessionTime}
                                onChange={(e) => setSessionTime(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mood Scale */}
            <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                <h3 className="mb-4">Mood Assessment</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                    Rate the student's overall mood during this session
                </p>
                <div className="flex gap-4 justify-center">
                    {moodLevels.map((mood) => (
                        <button
                            key={mood.value}
                            onClick={() => setMoodScale(mood.value)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${moodScale === mood.value
                                    ? 'bg-[var(--color-mint-green)] ring-2 ring-[var(--color-accent-green)]'
                                    : 'bg-[var(--color-primary-blue)] hover:bg-[var(--color-mint-green)]'
                                }`}
                        >
                            <span className="text-4xl">{mood.icon}</span>
                            <span className={`text-sm ${moodScale === mood.value ? mood.color : 'text-[var(--color-text-secondary)]'}`}>
                                {mood.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Problem Tags */}
            <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                <h3 className="mb-4">Problem Tags</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                    Select all relevant issues discussed in this session
                </p>
                <div className="flex flex-wrap gap-2">
                    {problemTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${selectedTags.includes(tag)
                                    ? 'bg-[var(--color-accent-green)] text-white'
                                    : 'bg-[var(--color-primary-blue)] text-[var(--color-text-secondary)] hover:bg-[var(--color-mint-green)]'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Session Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                <h3 className="mb-4">Session Summary</h3>
                <textarea
                    value={sessionSummary}
                    onChange={(e) => setSessionSummary(e.target.value)}
                    placeholder="Document key points discussed, student's concerns, observations, and any significant disclosures..."
                    rows={8}
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] resize-none"
                />
            </div>

            {/* Interventions Used */}
            <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                <h3 className="mb-4">Interventions & Techniques</h3>
                <textarea
                    value={interventions}
                    onChange={(e) => setInterventions(e.target.value)}
                    placeholder="Describe therapeutic interventions, techniques, or strategies used during the session..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] resize-none"
                />
            </div>

            {/* Follow-up Plan */}
            <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
                <h3 className="mb-4">Follow-up Plan</h3>
                <textarea
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder="Outline next steps, homework assignments, or recommendations for future sessions..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] resize-none"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[var(--color-accent-green)] text-white rounded-2xl hover:opacity-90 transition-opacity"
                >
                    <Save className="w-5 h-5" />
                    Save Case Note
                </button>
            </div>

            {/* Confidentiality Notice */}
            <div className="mt-6 bg-[var(--color-mint-green)] rounded-3xl p-6">
                <h4 className="mb-2">⚠️ Confidentiality Reminder</h4>
                <p className="text-sm">
                    All case notes are strictly confidential and protected under professional ethics and PDPA regulations. Ensure all documentation adheres to privacy standards and best practices in clinical record-keeping.
                </p>
            </div>
        </div>
    );
}
