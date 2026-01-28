import { useState, useEffect } from 'react'
import { adminApi, type AdminInfo } from '../../api/adminApi'
import { AdminRequests } from './AdminRequests'

export function CommandCenter() { // Renamed conceptually in navigation, but keeping component name for import compatibility if desired, or can export as TeamManager
    // Actually, standardizing on TeamManager internally but exporting as CommandCenter to avoid simple refactor breakage in AdminDashboard if not updated,
    // BUT we modified AdminDashboard imports earlier to still use CommandCenter. So keeping it.

    const [admins, setAdmins] = useState<AdminInfo[]>([])
    const [loading, setLoading] = useState(false)

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

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Access Requests</h3>
                    <p className="text-slate-500 text-sm">Review applicants who want to join the admin team.</p>
                </div>
                <AdminRequests />
            </div>

            <div className="pt-6 border-t border-white/5">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">Current Administrators</h3>
                    <p className="text-slate-500 text-sm">List of active team members.</p>
                </div>

                <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                    {loading && <div className="p-4 text-center text-slate-400">Loading team...</div>}
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-medium text-slate-400 uppercase tracking-wider">
                                <th className="p-4">Admin User</th>
                                <th className="p-4">Role</th>
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
                                    <td className="p-4 text-xs text-slate-500 text-right font-mono">
                                        {new Date(admin.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        {admin.role !== 'superadmin' && (
                                            <button
                                                onClick={async () => {
                                                    if (!window.confirm('Permanently delete this admin? This cannot be undone.')) return
                                                    try {
                                                        await adminApi.deleteAdmin(admin.id || admin._id || '')
                                                        loadAdmins()
                                                    } catch (e) { alert('Failed to delete') }
                                                }}
                                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                                                title="Delete Admin"
                                            >
                                                <span className="sr-only">Delete</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
