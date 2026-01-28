import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NeuralNetworkBackground } from '../components/NeuralNetworkBackground'
import { adminApi } from '../api/adminApi'
import {
    User, Mail, FileText, Send, CheckCircle, AlertCircle,
    ArrowLeft, Briefcase, Clock, Link as LinkIcon
} from 'lucide-react'

export function JoinTeamPage() {
    const navigate = useNavigate()
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
        } catch (error: any) {
            setStatus('error')
            setErrorMessage(error.message || 'Failed to submit request')
        }
    }

    return (
        <div className="min-h-screen w-full flex relative overflow-hidden text-white font-sans bg-slate-950">
            <NeuralNetworkBackground />

            {/* Left Column - Branding (Similar to Login) */}
            <div className="hidden lg:flex w-1/2 flex-col justify-center px-24 relative z-10 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="mb-8 p-4 bg-violet-600/10 rounded-2xl w-fit border border-violet-500/20 backdrop-blur-sm">
                        <Briefcase className="w-12 h-12 text-violet-400" strokeWidth={1.5} />
                    </div>

                    <h1 className="text-6xl font-black tracking-tight text-white mb-6">
                        Join the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                            Command Center
                        </span>
                    </h1>

                    <div className="h-0.5 w-16 bg-violet-500/50 mb-8" />

                    <p className="text-xl text-slate-400 font-light max-w-md leading-relaxed">
                        Become an administrator to help shape the future of human performance.
                        Manage data, curate content, and support the CoreIQ elite.
                    </p>
                </motion.div>
            </div>

            {/* Right Column - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-24 relative z-10 overflow-y-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-8 right-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </button>

                <motion.div
                    className="w-full max-w-lg mt-10 lg:mt-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    {status === 'success' ? (
                        <div className="py-12 flex flex-col items-center text-center bg-slate-900/50 border border-white/10 rounded-3xl p-12 backdrop-blur-xl">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 ring-1 ring-emerald-500/20">
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Application Received</h3>
                            <p className="text-slate-400 mb-8 max-w-xs">
                                Your request has been sent to the Super Admin. You will receive an email with your credentials once approved.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                Return Home
                            </button>
                        </div>
                    ) : (
                        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Submit Application</h2>
                                <p className="text-slate-400 text-sm">Please provide details about your role and expertise.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Username</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-violet-500 outline-none transition-all placeholder:text-slate-600"
                                                placeholder="username"
                                                value={formData.username}
                                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                            <input
                                                type="email"
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-violet-500 outline-none transition-all placeholder:text-slate-600"
                                                placeholder="email@gmail.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Department</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-violet-500 outline-none transition-all placeholder:text-slate-600"
                                                placeholder="e.g. Nutrition"
                                                value={formData.department}
                                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Availability</label>
                                        <div className="relative group">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-violet-500 outline-none transition-all placeholder:text-slate-600"
                                                placeholder="e.g. 20hrs/wk"
                                                value={formData.availability}
                                                onChange={e => setFormData({ ...formData, availability: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Experience</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="e.g. 5 Senior Coach at Equinox, NASM Certified"
                                        value={formData.experience}
                                        onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Resume / Portfolio Link</label>
                                    <div className="relative group">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                        <input
                                            type="url"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-violet-500 outline-none transition-all placeholder:text-slate-600"
                                            placeholder="https://linkedin.com/in/..."
                                            value={formData.cvLink}
                                            onChange={e => setFormData({ ...formData, cvLink: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Reason For Joining</label>
                                    <div className="relative group">
                                        <FileText className="absolute left-3 top-4 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                        <textarea
                                            required
                                            minLength={10}
                                            className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-violet-500 outline-none resize-none transition-all placeholder:text-slate-600"
                                            placeholder="I want to help organize the new HIIT workout series..."
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
                                    className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {status === 'submitting' ? (
                                        <>Processing...</>
                                    ) : (
                                        <>Submit Application <Send className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
