
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'
import { MagneticButton } from '../components/ui/MagneticButton'
import { GlassCard } from '../components/ui/GlassCard'
import { AuroraBackground } from '../components/AuroraBackground'
import type { FormEvent } from 'react'

export function AdminLoginPage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Mock login - in production this would hit an API
        setTimeout(() => {
            setIsLoading(false)
            navigate('/admin/dashboard')
        }, 1500)
    }

    return (
        <AuroraBackground>
            <div className="relative z-10 w-full max-w-md px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30 backdrop-blur-md shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]">
                            <ShieldCheck className="w-8 h-8 text-violet-400" />
                        </div>
                    </div>

                    <GlassCard className="overflow-hidden">
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
                                <p className="text-slate-400 text-sm">Targeting vector verified. Enter access keys.</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                        <input
                                            type="email"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
                                            placeholder="admin@coreiq.app"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                        <input
                                            type="password"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
                                            placeholder="••••••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <MagneticButton className="w-full justify-center group">
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Authenticating...
                                            </span>
                                        ) : (
                                            <>
                                                Initialize Session <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </MagneticButton>
                                </div>
                            </form>
                        </div>
                        <div className="px-8 py-4 bg-white/5 border-t border-white/5 text-center">
                            <p className="text-xs text-slate-500">Restricted access. All actions are logged.</p>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </AuroraBackground>
    )
}
