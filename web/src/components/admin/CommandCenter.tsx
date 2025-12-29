import { useState, useEffect } from 'react'
import { Plus, UserX, Mail, Key, User, Eye, EyeOff } from 'lucide-react'
import { adminApi, type AdminInfo } from '../../api/adminApi'

export function CommandCenter() { // Renamed conceptually in navigation, but keeping component name for import compatibility if desired, or can export as TeamManager
    // Actually, standardizing on TeamManager internally but exporting as CommandCenter to avoid simple refactor breakage in AdminDashboard if not updated,
    // BUT we modified AdminDashboard imports earlier to still use CommandCenter. So keeping it.

    const [admins, setAdmins] = useState<AdminInfo[]>([])
    const [loading, setLoading] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [formData, setFormData] = useState({ username: '', emailPrefix: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        loadAdmins()
    }, [])

    const loadAdmins = async () => {
        setLoading(true)
        try {
            const data = await adminApi.listAdmins()
            setAdmins(data.admins)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const fullEmail = `${formData.emailPrefix}@coreiq.com`
            await adminApi.createAdmin({ ...formData, email: fullEmail })
            setIsAddModalOpen(false)
            setFormData({ username: '', emailPrefix: '', password: '' })
            loadAdmins()
            alert('Admin created successfully')
        } catch (error: any) {
            alert(error.message || 'Failed to create admin')
        }
    }

    const handleDeactivate = async (id: string) => {
        if (!window.confirm('Deactivate this admin access?')) return
        try {
            await adminApi.deactivateAdmin(id)
            loadAdmins()
        } catch (error) { alert('Failed') }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white">Administrative Team</h3>
                    <p className="text-slate-500 text-sm">Manage access rights and roles.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-violet-500/20"
                >
                    <Plus className="w-4 h-4" /> Add Admin
                </button>
            </div>

            <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                {loading && <div className="p-4 text-center text-slate-400">Loading team...</div>}
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-medium text-slate-400 uppercase tracking-wider">
                            <th className="p-4">Admin User</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Created</th>
                            <th className="p-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {admins.map((admin) => (
                            <tr key={admin.id || admin._id} className="group hover:bg-white/[0.02]">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                            {admin.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{admin.username}</div>
                                            <div className="text-xs text-slate-500">{admin.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border uppercase tracking-wider ${admin.role === 'superadmin'
                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {admin.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${admin.isActive
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-red-500/10 text-red-400'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                        {admin.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-xs text-slate-500 text-right font-mono">
                                    {new Date(admin.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    {admin.role !== 'superadmin' && admin.isActive && (
                                        <button
                                            onClick={() => handleDeactivate(admin.id || admin._id || '')}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Deactivate Account"
                                        >
                                            <UserX className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Admin Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <form onSubmit={handleCreate} className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md space-y-4">
                        <h3 className="text-xl font-bold text-white mb-6">Create New Administrator</h3>

                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 ml-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-violet-500/50 outline-none"
                                    placeholder="admin_username"
                                    required
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 ml-1">Email Address</label>
                            <div className="relative flex">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    className="flex-1 bg-black/40 border border-white/10 rounded-l-xl px-10 py-3 text-white focus:border-violet-500/50 outline-none"
                                    placeholder="username"
                                    required
                                    value={formData.emailPrefix}
                                    onChange={e => setFormData({ ...formData, emailPrefix: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })}
                                />
                                <span className="bg-slate-800 border border-white/10 border-l-0 rounded-r-xl px-4 py-3 text-slate-400 text-sm flex items-center">@coreiq.com</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 ml-1">Password</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-violet-500/50 outline-none pr-12"
                                    placeholder="••••••••"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={8}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white"
                            >Cancel</button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium shadow-lg shadow-violet-500/20"
                            >Create Admin</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
