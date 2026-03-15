import { useState } from 'react';
import { API_BASE_URL, getAuthHeader } from '../../config/api.config';
import {
    FileText, Calendar, Download, BarChart3, Users, Clock,
    TrendingUp, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────
interface ReportData {
    period: { from: string; to: string };
    summary: {
        totalSessions: number;
        completedSessions: number;
        cancelledSessions: number;
        newClients: number;
        averageWaitDays: number;
    };
    topTags: { tag: string; count: number }[];
    byDepartment: { department: string; count: number }[];
    counselorWorkload: { name: string; sessions: number }[];
    monthlySessions: { month: string; count: number }[];
}

interface ReportGeneratorProps {
    onFetchReportData?: (from: string, to: string) => Promise<ReportData>;
}

// ── PDF Generator (Client-side via HTML + window.print) ────────
function generatePDFReport(data: ReportData) {
    const completionRate = Math.round((data.summary.completedSessions / data.summary.totalSessions) * 100);
    const maxTagCount = Math.max(...data.topTags.map(t => t.count));
    const maxDeptCount = Math.max(...data.byDepartment.map(d => d.count));
    const maxWorkload = Math.max(...data.counselorWorkload.map(c => c.sessions));

    const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <title>Entaneer Mind - Full Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Sarabun', sans-serif; color: #2C3E50; background: #fff; font-size: 13px; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 20mm; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page-break { page-break-before: always; }
    }

    /* Header */
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #4A90E2; }
    .header-left h1 { font-size: 22px; font-weight: 700; color: #1a2533; }
    .header-left p { font-size: 12px; color: #5A6C7D; margin-top: 4px; }
    .header-badge { background: linear-gradient(135deg, #4A90E2, #66BB6A); color: white; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 600; }

    /* Period Banner */
    .period-banner { background: #F0F8FF; border: 1px solid #d0e8ff; border-radius: 12px; padding: 12px 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
    .period-banner span { color: #4A90E2; font-weight: 700; font-size: 14px; }

    /* Section */
    .section { margin-bottom: 28px; }
    .section-title { font-size: 15px; font-weight: 700; color: #1a2533; margin-bottom: 14px; display: flex; align-items: center; gap-8px; padding-bottom: 6px; border-bottom: 1px solid #E1E8ED; }
    .section-title::before { content: ''; display: inline-block; width: 4px; height: 16px; background: #4A90E2; border-radius: 2px; margin-right: 8px; }

    /* Summary Grid */
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .summary-card { background: #f8fafc; border: 1px solid #E1E8ED; border-radius: 12px; padding: 16px; text-align: center; }
    .summary-card .value { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    .summary-card .label { font-size: 11px; color: #5A6C7D; }
    .summary-card.blue .value { color: #4A90E2; }
    .summary-card.green .value { color: #66BB6A; }
    .summary-card.red .value { color: #ef4444; }
    .summary-card.orange .value { color: #f59e0b; }
    .summary-card.purple .value { color: #8b5cf6; }

    /* Bar chart */
    .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .bar-label { width: 170px; font-size: 12px; color: #2C3E50; text-align: right; shrink: 0; flex-shrink: 0; }
    .bar-label-left { width: 170px; font-size: 12px; color: #2C3E50; flex-shrink: 0; }
    .bar-track { flex: 1; height: 18px; background: #f0f4f8; border-radius: 9px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 9px; }
    .bar-count { width: 40px; font-size: 12px; font-weight: 700; color: #2C3E50; text-align: right; flex-shrink: 0; }

    /* Two columns */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

    /* Completion ring (simple) */
    .completion-box { background: linear-gradient(135deg, #4A90E2, #66BB6A); border-radius: 12px; padding: 20px; color: white; text-align: center; }
    .completion-box .big { font-size: 36px; font-weight: 700; }
    .completion-box .sub { font-size: 12px; opacity: 0.85; }

    /* Footer */
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E1E8ED; display: flex; justify-content: space-between; font-size: 10px; color: #5A6C7D; }

    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #F0F8FF; padding: 10px 12px; text-align: left; font-weight: 700; color: #4A90E2; }
    td { padding: 9px 12px; border-bottom: 1px solid #f0f4f8; }
    tr:last-child td { border-bottom: none; }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <h1>Entaneer Mind — รายงานสรุปสถิติ</h1>
      <p>คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่ · สร้างเมื่อ ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div class="header-badge">Full Report</div>
  </div>

  <!-- Period -->
  <div class="period-banner">
    📅&nbsp; ช่วงเวลา:&nbsp;
    <span>${new Date(data.period.from).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
    &nbsp;—&nbsp;
    ${new Date(data.period.to).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
  </div>

  <!-- Section 1: Summary -->
  <div class="section">
    <div class="section-title">ภาพรวม</div>
    <div class="summary-grid">
      <div class="summary-card blue">
        <div class="value">${data.summary.totalSessions}</div>
        <div class="label">เซสชันทั้งหมด</div>
      </div>
      <div class="summary-card green">
        <div class="value">${data.summary.completedSessions}</div>
        <div class="label">เสร็จสิ้น</div>
      </div>
      <div class="summary-card red">
        <div class="value">${data.summary.cancelledSessions}</div>
        <div class="label">ยกเลิก</div>
      </div>
      <div class="summary-card orange">
        <div class="value">${data.summary.newClients}</div>
        <div class="label">ผู้ใช้ใหม่</div>
      </div>
      <div class="summary-card purple">
        <div class="value">${data.summary.averageWaitDays} วัน</div>
        <div class="label">รอคิวเฉลี่ย</div>
      </div>
      <div class="completion-box">
        <div class="big">${completionRate}%</div>
        <div class="sub">อัตราเสร็จสิ้น</div>
      </div>
    </div>
  </div>

  <!-- Section 2: Problem Tags -->
  <div class="section">
    <div class="section-title">ปัญหาที่พบบ่อย (Problem Tags)</div>
    ${(() => {
            const totalCount = data.topTags.reduce((s, t) => s + t.count, 0);
            return data.topTags.map(t => {
                const pct = totalCount > 0 ? Math.round((t.count / totalCount) * 100) : 0;
                return `
          <div class="bar-row">
            <div class="bar-label">${t.tag}</div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${pct}%; background: linear-gradient(90deg, #4A90E2, #66BB6A);"></div>
            </div>
            <div class="bar-count">${t.count} (${pct}%)</div>
          </div>
        `;
            }).join('');
        })()}
  </div>

  <!-- Section 3: Two columns - Department + Counselor Workload -->
  <div class="section two-col">
    <div>
      <div class="section-title">การกระจายตามคณะ</div>
      ${data.byDepartment.map(d => `
        <div class="bar-row">
          <div class="bar-label-left" style="width:140px; font-size:11px;">${d.department}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${Math.round((d.count / maxDeptCount) * 100)}%; background: #66BB6A;"></div>
          </div>
          <div class="bar-count">${d.count}</div>
        </div>
      `).join('')}
    </div>
    <div>
      <div class="section-title">Counselor Workload</div>
      ${data.counselorWorkload.map(c => `
        <div class="bar-row">
          <div class="bar-label-left" style="width:80px;">${c.name}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${Math.round((c.sessions / maxWorkload) * 100)}%; background: #8b5cf6;"></div>
          </div>
          <div class="bar-count">${c.sessions}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Section 4: Session List Summary -->
  <div class="section">
    <div class="section-title">สรุปรายเดือน</div>
    <table>
      <thead><tr><th>เดือน</th><th>จำนวนเซสชัน</th></tr></thead>
      <tbody>
        ${data.monthlySessions.map(m => `
          <tr><td>${m.month}</td><td><b>${m.count}</b></td></tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>Entaneer Mind Friend · คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่</span>
    <span>ข้อมูลนี้เป็นความลับ ใช้สำหรับการพัฒนาระบบดูแลสุขภาพจิตเท่านั้น</span>
  </div>

</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
        win.onload = () => {
            setTimeout(() => {
                win.print();
            }, 500);
        };
    }
}

// ── Main Component ─────────────────────────────────────────────
export function ReportGenerator({ onFetchReportData }: ReportGeneratorProps) {
    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().split('T')[0];

    const [fromDate, setFromDate] = useState(firstOfMonth);
    const [toDate, setToDate] = useState(today);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // const handlePreview = async () => {
    //     if (!fromDate || !toDate) { setError('กรุณาเลือกช่วงวันที่'); return; }
    //     if (fromDate > toDate) { setError('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด'); return; }
    //     setError('');
    //     setIsLoading(true);
    //     try {
    //         const data = onFetchReportData
    //             ? await onFetchReportData(fromDate, toDate)
    //             : generateMockReport(fromDate, toDate);
    //         setReportData(data);
    //     } catch {
    //         setError('ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่');
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };
    const handlePreview = async () => {
        if (!fromDate || !toDate) { setError('กรุณาเลือกช่วงวันที่'); return; }
        if (fromDate > toDate) { setError('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด'); return; }
        setError('');
        setIsLoading(true);
        try {
            const data = onFetchReportData
                ? await onFetchReportData(fromDate, toDate)
                : await (async () => {
                    const res = await fetch(`${API_BASE_URL}/counselor/report?startDate=${fromDate}&endDate=${toDate}`, {
                        headers: getAuthHeader()
                    });
                    if (!res.ok) throw new Error(`Failed to fetch report (${res.status})`);
                    const json = await res.json();
                    const d = json.data;

                    // Map backend format → ReportData interface
                    // Backend: { caseStats, sessionStats, userStats, topProblemTags, counselorStats, reportPeriod }
                    const mapped: ReportData = {
                        period: { from: fromDate, to: toDate },
                        summary: {
                            totalSessions: d.summary?.totalSessions ?? 0,
                            completedSessions: d.summary?.completedSessions ?? 0,
                            cancelledSessions: d.summary?.cancelledSessions ?? 0,
                            newClients: d.summary?.newClients ?? 0,
                            averageWaitDays: d.summary?.averageWaitDays ?? 0,
                        },
                        topTags: (d.topTags ?? []).map((t: any) => ({
                            tag: t.tag,
                            count: t.count,
                        })),
                        byDepartment: (d.byDepartment ?? []).map((dep: any) => ({
                            department: dep.department,
                            count: dep.count,
                        })),
                        counselorWorkload: (d.counselorWorkload ?? []).map((c: any) => ({
                            name: c.name,
                            sessions: c.sessions ?? 0,
                        })),
                        monthlySessions: (d.monthlySessions ?? []).map((m: any) => ({
                            month: m.month,
                            count: m.count,
                        })),
                    };
                    return mapped;
                })();
            setReportData(data);
        } catch {
            setError('ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGeneratePDF = () => {
        if (!reportData) return;
        generatePDFReport(reportData);
    };

    const completionRate = reportData
        ? Math.round((reportData.summary.completedSessions / reportData.summary.totalSessions) * 100)
        : 0;

    const maxTagCount = reportData ? Math.max(...reportData.topTags.map(t => t.count)) : 1;

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">สร้างรายงานแบบเต็มรูปแบบการวิเคราะห์</h1>
                <p className="text-[var(--color-text-secondary)] text-sm">
                    สร้างรายงานสรุปสถิติระบบ Entaneer Mind ในช่วงเวลาที่ต้องการ
                </p>
            </header>

            {/* ── Date Range Picker ── */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[var(--color-border)] mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-5 h-5 text-[var(--color-accent-blue)]" />
                    <h3 className="font-bold text-gray-800">เลือกช่วงเวลา</h3>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-2">ตั้งแต่วันที่</label>
                        <input
                            type="date"
                            value={fromDate}
                            max={toDate}
                            onChange={e => setFromDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)]"
                        />
                    </div>
                    <div className="text-gray-400 font-bold pb-3">—</div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-2">ถึงวันที่</label>
                        <input
                            type="date"
                            value={toDate}
                            min={fromDate}
                            max={today}
                            onChange={e => setToDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)]"
                        />
                    </div>

                    {/* Quick Presets */}
                    <div className="flex gap-2 pb-0.5">
                        {[
                            { label: 'เดือนนี้', days: 0 },
                            { label: '3 เดือน', days: 90 },
                            { label: '6 เดือน', days: 180 },
                        ].map(preset => (
                            <button
                                key={preset.label}
                                onClick={() => {
                                    const end = new Date();
                                    const start = preset.days === 0
                                        ? new Date(end.getFullYear(), end.getMonth(), 1)
                                        : new Date(Date.now() - preset.days * 86400000);
                                    setFromDate(start.toISOString().split('T')[0]);
                                    setToDate(end.toISOString().split('T')[0]);
                                }}
                                className="px-4 py-3 text-sm bg-gray-50 hover:bg-[var(--color-mint-green)] text-gray-600 hover:text-[var(--color-accent-green)] rounded-2xl transition-all font-medium whitespace-nowrap"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handlePreview}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-2xl hover:opacity-90 transition-opacity font-bold disabled:opacity-50 whitespace-nowrap"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                        {isLoading ? 'กำลังโหลด...' : 'แสดงตัวอย่าง'}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-2xl px-4 py-3">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}
            </div>

            {/* ── Preview Section ── */}
            {reportData && (
                <>
                    {/* Generate PDF Button */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={handleGeneratePDF}
                            className="flex items-center gap-2 px-8 py-4 bg-[var(--color-accent-green)] text-white rounded-2xl hover:opacity-90 transition-opacity font-bold shadow-md shadow-green-100"
                        >
                            <Download className="w-5 h-5" />
                            บันทึกเป็น PDF
                        </button>
                    </div>

                    {/* Preview Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-[var(--color-border)] overflow-hidden">
                        {/* Preview Header */}
                        <div className="bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-green)] px-8 py-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">Entaneer Mind — รายงานสรุปสถิติ</h2>
                                    <p className="text-white/80 text-sm mt-1">
                                        {new Date(reportData.period.from).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        &nbsp;—&nbsp;
                                        {new Date(reportData.period.to).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <FileText className="w-10 h-10 text-white/60" />
                            </div>
                        </div>

                        <div className="p-8 space-y-10">

                            {/* 1. ภาพรวม */}
                            <section>
                                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-[var(--color-accent-blue)]" /> ภาพรวม
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {[
                                        { label: 'เซสชันทั้งหมด', value: reportData.summary.totalSessions, color: 'text-[var(--color-accent-blue)]' },
                                        { label: 'เสร็จสิ้น', value: reportData.summary.completedSessions, color: 'text-green-600' },
                                        { label: 'ยกเลิก', value: reportData.summary.cancelledSessions, color: 'text-red-500' },
                                        { label: 'ผู้ใช้ใหม่', value: reportData.summary.newClients, color: 'text-orange-500' },
                                        { label: 'รอคิวเฉลี่ย', value: `${reportData.summary.averageWaitDays} วัน`, color: 'text-purple-600' },
                                    ].map(item => (
                                        <div key={item.label} className="bg-gray-50 rounded-2xl p-4 text-center">
                                            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                                            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Completion Rate */}
                                <div className="mt-4 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-green)] rounded-2xl p-5 text-white flex items-center gap-4">
                                    <CheckCircle className="w-10 h-10 text-white/70 shrink-0" />
                                    <div>
                                        <p className="text-3xl font-bold">{completionRate}%</p>
                                        <p className="text-white/80 text-sm">อัตราเสร็จสิ้น (Completion Rate)</p>
                                    </div>
                                </div>
                            </section>

                            {/* 2. Problem Tags */}
                            <section>
                                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-500" /> ปัญหาที่พบบ่อย (Problem Tags)
                                </h3>
                                <div className="space-y-4">
                                    {(() => {
                                        const totalTagCount = reportData.topTags.reduce((sum, t) => sum + t.count, 0);
                                        return reportData.topTags.map((tag, i) => {
                                            const pct = totalTagCount > 0 ? Math.round((tag.count / totalTagCount) * 100) : 0;
                                            return (
                                                <div key={i}>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-sm font-semibold text-gray-700">{tag.tag}</span>
                                                        <span className="text-sm font-bold text-gray-500">
                                                            {tag.count} session
                                                            <span className="ml-2 text-[var(--color-accent-blue)]">{pct}%</span>
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                        <div
                                                            className="bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-green)] h-2.5 rounded-full transition-all duration-500"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </section>

                            {/* 3. Department + Workload */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section>
                                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-[var(--color-accent-blue)]" /> การกระจายตามคณะ
                                    </h3>
                                    <div className="space-y-3">
                                        {reportData.byDepartment.map((d, i) => (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                                <span className="text-sm text-gray-700">{d.department}</span>
                                                <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                                                    {d.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-purple-500" /> งานที่ผู้ให้คำปรึกษารับผิดชอบ
                                    </h3>
                                    <div className="space-y-4">
                                        {reportData.counselorWorkload.map((c, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-semibold text-gray-700">{c.name}</span>
                                                    <span className="text-sm font-bold">{c.sessions} เซสชัน</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                    <div
                                                        className="bg-purple-400 h-2.5 rounded-full"
                                                        style={{ width: `${(c.sessions / Math.max(...reportData.counselorWorkload.map(x => x.sessions))) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* 4. Monthly Summary */}
                            <section>
                                <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-orange-500" /> สรุปรายเดือน
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {reportData.monthlySessions.map((m, i) => (
                                        <div key={i} className="text-center p-4 bg-gray-50 rounded-2xl">
                                            <p className="text-2xl font-bold text-[var(--color-accent-blue)]">{m.count}</p>
                                            <p className="text-sm text-gray-500 mt-1">{m.month}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                        </div>
                    </div>
                </>
            )}

            {/* Empty state */}
            {!reportData && !isLoading && (
                <div className="text-center py-20 text-gray-400">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">เลือกช่วงวันที่และกด "แสดงตัวอย่าง"</p>
                    <p className="text-sm mt-1">เพื่อดูรายงานสรุปสถิติ</p>
                </div>
            )}
        </div>
    );
}