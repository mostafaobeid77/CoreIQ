import { useState } from 'react'
import { FileText, Download, Calendar, Loader2, X } from 'lucide-react'
import { adminApi } from '../../api/adminApi'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ReportsModalProps {
    onClose: () => void;
}

export function ReportsModal({ onClose }: ReportsModalProps) {
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month')
    const [loading, setLoading] = useState(false)
    const [reportData, setReportData] = useState<any>(null)

    const generateReport = async () => {
        setLoading(true)
        try {
            const end = new Date();
            const start = new Date();

            if (dateRange === 'today') start.setHours(0, 0, 0, 0);
            if (dateRange === 'week') start.setDate(start.getDate() - 7);
            if (dateRange === 'month') start.setMonth(start.getMonth() - 1);
            if (dateRange === 'year') start.setFullYear(start.getFullYear() - 1);

            const data = await adminApi.getReportStats(start, end);
            setReportData(data);
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const exportPDF = () => {
        if (!reportData) return;

        const doc = new jsPDF();
        const { start, end } = reportData.range;
        const m = reportData.metrics;

        // Header
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('CoreIQ Activity Report', 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
        doc.text(`Period: ${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`, 120, 30);

        // Metrics Table
        const tableData = [
            ['Acquisition', 'New Athletes Joined', m.acquisition.newUsers],
            ['Engagement', 'New Plans Started', m.engagement.newPlans],
            ['Engagement', 'Login Sessions', m.engagement.loginSessions],
            ['Content', 'New Workouts', m.content.newWorkouts],
            ['Content', 'New Meals', m.content.newMeals],
            ['Team', 'Admin Actions', m.team.decisionsMade],
        ];

        autoTable(doc, {
            startY: 50,
            head: [['Category', 'Metric', 'Count']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] }, // violet-600
            styles: { fontSize: 12, cellPadding: 6 },
        });

        // Summary / Footer
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text('This internal report summarizes key platform growth and activity metrics.', 20, finalY);
        doc.text('Confidential - CoreIQ Admin Team', 20, finalY + 6);

        doc.save(`CoreIQ_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-400">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Export Analytics Report</h2>
                        <p className="text-slate-500 text-sm">Generate comprehensive daily, monthly, or yearly reports.</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Range Selector */}
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Select Reporting Period</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['today', 'week', 'month', 'year'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => { setDateRange(r as any); setReportData(null); }}
                                    className={`
                                        py-2 px-4 rounded-lg text-sm font-medium transition-all capitalize
                                        ${dateRange === r
                                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}
                                    `}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="bg-slate-900/50 rounded-xl border border-white/5 p-6 min-h-[200px] flex items-center justify-center relative overflow-hidden">
                        {!reportData && !loading && (
                            <div className="text-center">
                                <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                <p className="text-slate-500">Select a range and click Generate</p>
                            </div>
                        )}

                        {loading && <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />}

                        {reportData && !loading && (
                            <div className="w-full h-full space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-3 rounded-lg">
                                        <div className="text-slate-400 text-xs uppercase">New Users</div>
                                        <div className="text-2xl font-bold text-white">{reportData.metrics.acquisition.newUsers}</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg">
                                        <div className="text-slate-400 text-xs uppercase">Plans Started</div>
                                        <div className="text-2xl font-bold text-white">{reportData.metrics.engagement.newPlans}</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg">
                                        <div className="text-slate-400 text-xs uppercase">Active Sessions</div>
                                        <div className="text-2xl font-bold text-white">{reportData.metrics.engagement.loginSessions}</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg">
                                        <div className="text-slate-400 text-xs uppercase">New Workouts</div>
                                        <div className="text-2xl font-bold text-white">{reportData.metrics.content.newWorkouts}</div>
                                    </div>
                                </div>
                                <div className="text-center pt-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Report Ready for Export
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                    >
                        Close
                    </button>
                    {!reportData ? (
                        <button
                            onClick={generateReport}
                            disabled={loading}
                            className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                        >
                            {loading ? 'Generating...' : 'Generate Preview'}
                        </button>
                    ) : (
                        <button
                            onClick={exportPDF}
                            className="bg-violet-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-violet-500 transition-colors flex items-center gap-2 shadow-lg shadow-violet-500/25"
                        >
                            <Download className="w-4 h-4" /> Download PDF
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
