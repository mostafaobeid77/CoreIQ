import { useState, useEffect } from 'react'
import { Search, User } from 'lucide-react'
import { adminApi } from '../../api/adminApi'

export function UserDirectory() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            try {
                const data = await adminApi.getUsers({ search: searchTerm })
                setUsers(data.users)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        // Debounce search
        const timer = setTimeout(fetchUsers, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-bold text-white">Athletes Directory</h3>

                <div className="flex w-full sm:w-auto gap-3">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search athletes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-40 text-slate-500">Loading directory...</div>
                ) : (
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Athlete</th>
                                    <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Physical Stats</th>
                                    <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Metabolism (Target)</th>
                                    <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Activity</th>
                                    <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((user) => (
                                    <tr key={user._id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm text-white">{user.username}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-white">
                                                {user.weight > 0 ? `${user.weight}kg` : '-'} • {user.height > 0 ? `${user.height}cm` : '-'}
                                            </div>
                                            <div className="text-xs text-slate-500 capitalize">{user.gender || '-'}</div>
                                        </td>
                                        <td className="p-4">
                                            {user.targetCalories > 0 ? (
                                                <>
                                                    <div className="text-sm font-mono text-emerald-400">{user.targetCalories} kcal</div>
                                                    <div className="text-xs text-slate-500">{user.targetProtein}g Protein</div>
                                                </>
                                            ) : (
                                                <span className="text-xs text-slate-600">Not set</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-slate-400">
                                            {user.activityLevel || 'Unknown'}
                                        </td>
                                        <td className="p-4 text-xs text-slate-500 font-mono">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
