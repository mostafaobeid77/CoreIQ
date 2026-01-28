import { useState, useEffect } from 'react'
import { Check, X, Clock, Mail, AlertCircle, Trash2, FileText, Loader2 } from 'lucide-react'
import { adminApi } from '../../api/adminApi'

interface AdminRequest {
    _id: string;
    username: string;
    email: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    rejectionReason?: string;
    department?: string;
    availability?: string;
    experience?: string;
    cvLink?: string;
}

export function AdminRequests() {
    const [requests, setRequests] = useState<AdminRequest[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingAction, setLoadingAction] = useState<string | null>(null)
    const [rejectModalOpen, setRejectModalOpen] = useState<string | null>(null)
    const [rejectReason, setRejectReason] = useState('')

    useEffect(() => {
        loadRequests()
    }, [])

    const loadRequests = async () => {
        setLoading(true)
        try {
            const data = await adminApi.getAdminRequests()
            setRequests(data.requests)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const handleApprove = async (id: string, username: string) => {
        if (!window.confirm(`Approve admin access for ${username}? This will create an account and email credentials.`)) return
        setLoadingAction(id)
        try {
            await adminApi.approveAdminRequest(id)
            alert('Request approved and credentials sent.')
            loadRequests()
        } catch (error: any) {
            alert(error.message || 'Failed to approve')
        } finally {
            setLoadingAction(null)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this request permanently?')) return
        setLoadingAction(id)
        try {
            await adminApi.deleteAdminRequest(id)
            loadRequests()
        } catch (error: any) {
            alert(error.message || 'Failed to delete')
        } finally {
            setLoadingAction(null)
        }
    }

    const handleReject = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!rejectModalOpen) return
        setLoadingAction(rejectModalOpen)
        try {
            await adminApi.rejectAdminRequest(rejectModalOpen, rejectReason)
            setRejectModalOpen(null)
            setRejectReason('')
            loadRequests()
            alert('Request rejected notification sent.')
        } catch (error: any) {
            alert(error.message || 'Failed to reject')
        } finally {
            setLoadingAction(null)
        }
    }

    return (
        <div className="space-y-6 mt-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white">Access Requests</h3>
                    <p className="text-slate-500 text-sm">Review applications for admin access.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading && <div className="p-4 text-center text-slate-400">Loading requests...</div>}

                {!loading && requests.length === 0 && (
                    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 text-center text-slate-500 flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mb-3">
                            <Mail className="w-6 h-6 opacity-50" />
                        </div>
                        No pending requests
                    </div>
                )}

                {requests.map((req) => (
                    <div key={req._id} className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                        {/* Status Badge */}
                        <div className="absolute top-6 right-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                {req.status === 'pending' && <Clock className="w-3 h-3" />}
                                {req.status === 'approved' && <Check className="w-3 h-3" />}
                                {req.status === 'rejected' && <X className="w-3 h-3" />}
                                {req.status}
                            </span>
                        </div>

                        <div className="flex justify-between items-start mb-2 pr-24">
                            <div>
                                <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                    {req.username}
                                    {req.department && (
                                        <span className="bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded text-xs font-medium border border-violet-500/20">
                                            {req.department}
                                        </span>
                                    )}
                                </h4>
                                <p className="text-slate-400 text-sm">{req.email} • {new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {(req.experience || req.availability) && (
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm mt-4">
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <div className="text-slate-500 text-xs uppercase mb-1 font-bold">Experience</div>
                                    <div className="text-white">{req.experience || 'Not specified'}</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <div className="text-slate-500 text-xs uppercase mb-1 font-bold">Availability</div>
                                    <div className="text-white">{req.availability || 'Not specified'}</div>
                                </div>
                            </div>
                        )}

                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                            <div className="text-slate-500 text-xs uppercase mb-1 font-bold flex items-center gap-2">
                                <FileText className="w-3 h-3" /> Reason
                            </div>
                            <p className="text-slate-300 text-sm whitespace-pre-wrap">{req.reason}</p>
                        </div>

                        {req.cvLink && (
                            <a
                                href={req.cvLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-6 transition-colors font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                View Resume / Portfolio Link
                            </a>
                        )}

                        {req.status === 'pending' && (
                            <div className="flex gap-3 mt-2">
                                <button
                                    onClick={() => handleApprove(req._id, req.username)}
                                    className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    disabled={loadingAction === req._id}
                                >
                                    {loadingAction === req._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Approve Access
                                </button>
                                <button
                                    onClick={() => setRejectModalOpen(req._id)}
                                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    disabled={loadingAction === req._id}
                                >
                                    <X className="w-4 h-4" /> Reject
                                </button>
                                <button
                                    onClick={() => handleDelete(req._id)}
                                    className="px-4 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50"
                                    disabled={loadingAction === req._id}
                                    title="Delete Request"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {req.status === 'rejected' && (
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={() => handleDelete(req._id)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-lg transition-colors flex items-center gap-2 text-sm"
                                    title="Delete Request"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete Record
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <form onSubmit={handleReject} className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
                        <div className="flex items-center gap-3 text-red-400 mb-2">
                            <AlertCircle className="w-6 h-6" />
                            <h3 className="text-xl font-bold text-white">Reject Request</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Please provide a reason for rejection. This will be emailed to the applicant.
                        </p>

                        <div className="space-y-1">
                            <textarea
                                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-red-500/50 outline-none resize-none"
                                placeholder="Reason for rejection..."
                                required
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setRejectModalOpen(null)
                                    setRejectReason('')
                                }}
                                className="px-4 py-2 text-slate-400 hover:text-white"
                            >Cancel</button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium shadow-lg shadow-red-500/20"
                            >Reject Request</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
