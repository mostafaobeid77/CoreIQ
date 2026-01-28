import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, User, FileText, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { adminApi } from '../api/adminApi'

interface AdminRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AdminRequestModal({ isOpen, onClose }: AdminRequestModalProps) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        reason: '',
        department: '',
        availability: '',
        experience: '',
        cvLink: ''
    })
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('submitting')
        try {
            await adminApi.submitAdminRequest(formData)
            setStatus('success')
            // Reset form after delay
            setTimeout(() => {
                onClose()
                setStatus('idle')
                setFormData({
                    username: '',
                    email: '',
                    reason: '',
                    department: '',
                    availability: '',
                    experience: '',
                    cvLink: ''
                })
            }, 3000)
        } catch (error: any) {
            setStatus('error')
            setErrorMessage(error.message || 'Failed to submit request')
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Background Effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[100px] pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Join Admin Team</h2>
                                    <p className="text-slate-400 text-sm">Submit your application to become an administrator.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {status === 'success' ? (
                                <div className="py-12 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Request Submitted!</h3>
                                    <p className="text-slate-400 max-w-xs">
                                        Your application has been sent for review. You will receive an email once a decision is made.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400 ml-1">Username</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-violet-500/50 outline-none transition-colors"
                                                placeholder="Enter username"
                                                value={formData.username}
                                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400 ml-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="email"
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-violet-500/50 outline-none transition-colors"
                                                placeholder="Enter email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400 ml-1">Department</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 outline-none transition-colors"
                                                placeholder="e.g. Workouts"
                                                value={formData.department}
                                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-400 ml-1">Availability</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 outline-none transition-colors"
                                                placeholder="e.g. 10 hrs/week"
                                                value={formData.availability}
                                                onChange={e => setFormData({ ...formData, availability: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400 ml-1">Experience</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 outline-none transition-colors"
                                            placeholder="e.g. 3 years as Personal Trainer"
                                            value={formData.experience}
                                            onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400 ml-1">Resume / LinkedIn Link</label>
                                        <input
                                            type="url"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 outline-none transition-colors"
                                            placeholder="https://linkedin.com/in/..."
                                            value={formData.cvLink}
                                            onChange={e => setFormData({ ...formData, cvLink: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400 ml-1">Reason for Request</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-4 w-4 h-4 text-slate-500" />
                                            <textarea
                                                required
                                                minLength={10}
                                                className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-violet-500/50 outline-none resize-none transition-colors"
                                                placeholder="Why do you want to join the admin team?"
                                                value={formData.reason}
                                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {status === 'error' && (
                                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            {errorMessage}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'submitting'}
                                        className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white rounded-xl font-bold shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {status === 'submitting' ? (
                                            <>Processing...</>
                                        ) : (
                                            <>Submit Application <Send className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
