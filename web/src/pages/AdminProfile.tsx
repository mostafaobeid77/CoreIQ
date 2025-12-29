import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Key, Save, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useAdmin } from '../context/AdminContext'
import { adminApi } from '../api/adminApi'
import { NeuralNetworkBackground } from '../components/NeuralNetworkBackground'

export function AdminProfilePage() {
    const navigate = useNavigate()
    const { admin, refreshAdmin } = useAdmin()
    const [username, setUsername] = useState(admin?.username || '')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (password && password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password && password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        setLoading(true)
        try {
            const payload: { username?: string; password?: string } = {}
            if (username !== admin?.username) payload.username = username
            if (password) payload.password = password

            if (Object.keys(payload).length === 0) {
                setError('No changes to save')
                setLoading(false)
                return
            }

            await adminApi.updateProfile(payload)
            await refreshAdmin()
            setPassword('')
            setConfirmPassword('')
            setSuccess('Profile updated successfully!')
        } catch (err: any) {
            setError(err.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex text-white font-sans relative overflow-hidden">
            <NeuralNetworkBackground />

            <div className="w-full max-w-xl mx-auto p-8 relative z-10">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>

                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <h1 className="text-2xl font-bold text-white mb-2">Profile Settings</h1>
                    <p className="text-slate-500 text-sm mb-8">Update your account information</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email (read-only) */}
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 uppercase tracking-wider">Email</label>
                            <div className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-slate-400">
                                {admin?.email}
                            </div>
                            <p className="text-xs text-slate-600">Email cannot be changed</p>
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 uppercase tracking-wider">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-violet-500/50 outline-none"
                                    required
                                    minLength={3}
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 uppercase tracking-wider">New Password</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Leave blank to keep current"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white focus:border-violet-500/50 outline-none placeholder:text-slate-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        {password && (
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 uppercase tracking-wider">Confirm Password</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-violet-500/50 outline-none placeholder:text-slate-700"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                {error}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                {success}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
