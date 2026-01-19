import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, AlertCircle, Lock, Mail, Activity, Sparkles, Eye, EyeOff } from 'lucide-react'
import { useAdmin } from '../context/AdminContext'
import type { FormEvent } from 'react'

import { NeuralNetworkBackground } from '../components/NeuralNetworkBackground'

export function AdminLoginPage() {
    const navigate = useNavigate()
    const { login } = useAdmin()
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeField, setActiveField] = useState<string | null>(null)

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            await login(identifier, password)
            navigate('/admin/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Access Denied')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex relative overflow-hidden text-white font-sans">
            <NeuralNetworkBackground />

            {/* Left Column - Branding */}
            <div className="hidden lg:flex w-1/2 flex-col justify-center px-24 relative z-10 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Clean Icon - No Box */}
                    <div className="mb-8">
                        <Activity className="w-16 h-16 text-violet-500 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" strokeWidth={1.5} />
                    </div>

                    <h1 className="text-7xl font-bold tracking-tight text-white mb-6">
                        Core<span className="font-light text-slate-200">IQ</span>
                    </h1>

                    <div className="h-0.5 w-16 bg-violet-500/50 mb-8" />

                    <p className="text-xl text-slate-400 font-light max-w-md leading-relaxed tracking-wide">
                        Where intelligence meets performance.
                    </p>
                </motion.div>
            </div>

            {/* Right Column - Login Interface */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start p-8 lg:p-24 relative z-10">
                {/* Mobile Header */}
                <div className="lg:hidden mb-12 text-center">
                    <Activity className="w-10 h-10 text-violet-500 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold tracking-tight text-white">Core<span className="font-light">IQ</span></h1>
                </div>

                <motion.div
                    className="w-full max-w-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <form onSubmit={handleLogin} className="space-y-10">
                        {/* Email/Username Field */}
                        <div className="relative group">
                            <div className="flex items-center gap-3 mb-2">
                                <Mail className={`w-4 h-4 transition-colors duration-300 ${activeField === 'email' ? 'text-violet-400' : 'text-slate-500'}`} />
                                <label className={`text-sm font-medium transition-colors duration-300 ${activeField === 'email' ? 'text-violet-200' : 'text-slate-400'}`}>
                                    Username or Email
                                </label>
                            </div>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                onFocus={() => setActiveField('email')}
                                onBlur={() => setActiveField(null)}
                                className="w-full bg-transparent border-b border-white/10 py-3 text-lg text-white focus:outline-none focus:border-violet-500 transition-all duration-300 placeholder:text-slate-700/50"
                                placeholder="username or email@example.com"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div className="relative group">
                            <div className="flex items-center gap-3 mb-2">
                                <Lock className={`w-4 h-4 transition-colors duration-300 ${activeField === 'password' ? 'text-violet-400' : 'text-slate-500'}`} />
                                <label className={`text-sm font-medium transition-colors duration-300 ${activeField === 'password' ? 'text-violet-200' : 'text-slate-400'}`}>
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setActiveField('password')}
                                    onBlur={() => setActiveField(null)}
                                    className="w-full bg-transparent border-b border-white/10 py-3 text-lg text-white focus:outline-none focus:border-violet-500 transition-all duration-300 placeholder:text-slate-700/50 pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-2"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-rose-400 text-sm flex items-center gap-2 overflow-hidden"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Premium Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full h-14 overflow-hidden rounded-xl bg-violet-600 p-[1px] transition-all duration-300 hover:bg-gradient-to-r hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] focus:outline-none disabled:opacity-70 disabled:hover:shadow-none"
                            >
                                <div className="relative h-full w-full rounded-[11px] bg-[#0a0a0a] transition-colors duration-300 group-hover:bg-transparent">
                                    <div className="flex h-full w-full items-center justify-center gap-3 text-white">
                                        {isLoading ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                                                <span className="text-sm font-semibold tracking-wide">ACCESSING...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 text-violet-400 group-hover:text-white transition-colors" />
                                                <span className="text-sm font-semibold tracking-widest text-violet-100 group-hover:text-white">INITIALIZE ACCESS</span>
                                                <ArrowRight className="w-4 h-4 text-violet-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div >
    )
}
