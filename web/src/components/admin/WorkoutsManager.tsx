import { useState, useEffect } from 'react'
import { Search, CheckCircle, XCircle, AlertCircle, Plus, Trash2, ChevronDown, RefreshCw, X } from 'lucide-react'
import { adminApi, type Workout } from '../../api/adminApi'

// These match the actual values in the database
const MUSCLE_GROUPS = ['All', 'Abs', 'Back', 'Biceps', 'Cardio', 'Chest', 'Forearms', 'Legs', 'Shoulders', 'Triceps']
const CATEGORIES = ['strength', 'cardio', 'flexibility', 'balance']

export function WorkoutsManager() {
    const [subTab, setSubTab] = useState<'pending' | 'official'>('official')
    const [muscleGroup, setMuscleGroup] = useState('All')
    const [searchTerm, setSearchTerm] = useState('')
    const [workouts, setWorkouts] = useState<Workout[]>([])
    const [loading, setLoading] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Rejection Modal
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    // Add Workout Modal
    const [showAddModal, setShowAddModal] = useState(false)
    const [newWorkout, setNewWorkout] = useState({ name: '', description: '', category: 'strength', muscle_group: 'Chest', equipment: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [subTab, muscleGroup, refreshTrigger])

    const loadData = async () => {
        setLoading(true)
        try {
            const status = subTab === 'pending' ? 'pending' : 'official'
            const data = await adminApi.getWorkouts({
                status,
                muscle_group: muscleGroup !== 'All' ? muscleGroup : undefined,
                search: searchTerm || undefined
            })
            setWorkouts(data.workouts)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const filteredWorkouts = workouts

    const handleApprove = async (id: string) => {
        if (!window.confirm('Approve this workout?')) return
        try {
            await adminApi.updateWorkoutStatus(id, 'approved')
            setRefreshTrigger(prev => prev + 1)
        } catch { alert('Failed') }
    }

    const handleReject = async () => {
        if (!rejectingId || !rejectionReason) return
        try {
            await adminApi.updateWorkoutStatus(rejectingId, 'rejected', rejectionReason)
            setRejectingId(null)
            setRejectionReason('')
            setRefreshTrigger(prev => prev + 1)
        } catch { alert('Failed') }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this workout?')) return
        try {
            await adminApi.deleteWorkout(id)
            setRefreshTrigger(prev => prev + 1)
        } catch { alert('Failed') }
    }

    const handleAddWorkout = async () => {
        if (!newWorkout.name || !newWorkout.description) {
            alert('Please fill in name and description')
            return
        }
        setSaving(true)
        try {
            await adminApi.createWorkout(newWorkout)
            setShowAddModal(false)
            setNewWorkout({ name: '', description: '', category: 'strength', muscle_group: 'Chest', equipment: '' })
            setRefreshTrigger(prev => prev + 1)
        } catch (error) {
            console.error(error)
            alert('Failed to create workout')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Workouts Library</h2>
                    <p className="text-sm text-slate-500">Manage exercises and user submissions</p>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search workouts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && setRefreshTrigger(p => p + 1)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                        />
                    </div>
                    <button onClick={() => setRefreshTrigger(p => p + 1)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
            </div>

            {/* Sub-tabs & Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setSubTab('pending')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${subTab === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        <AlertCircle className="w-4 h-4" /> Pending Review
                    </button>
                    <button
                        onClick={() => setSubTab('official')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${subTab === 'official' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        <CheckCircle className="w-4 h-4" /> Official Library
                    </button>
                </div>

                <div className="relative">
                    <select
                        value={muscleGroup}
                        onChange={(e) => setMuscleGroup(e.target.value)}
                        className="appearance-none bg-slate-900/50 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:outline-none cursor-pointer"
                    >
                        {MUSCLE_GROUPS.map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-40 text-slate-500">Loading...</div>
                ) : filteredWorkouts.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-slate-500">No workouts found</div>
                ) : (
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                                <tr className="border-b border-white/5">
                                    <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Workout</th>
                                    <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
                                    <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Target</th>
                                    <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredWorkouts.map(w => (
                                    <tr key={w._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4"><StatusBadge status={w.status} /></td>
                                        <td className="p-4">
                                            <div className="font-medium text-white">{w.name}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">{w.description}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs px-2 py-1 rounded-lg bg-violet-500/10 text-violet-400 capitalize">{w.category}</span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-400 capitalize">{w.muscle_group}</td>
                                        <td className="p-4">
                                            {subTab === 'pending' ? (
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => handleApprove(w._id)} className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/20" title="Approve">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setRejectingId(w._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-500/20" title="Reject">
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => handleDelete(w._id)} className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/10" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {rejectingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md">
                        <h3 className="text-lg font-bold text-white mb-4">Reject Workout</h3>
                        <textarea
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-red-500/50 outline-none h-32 resize-none"
                            placeholder="Reason for rejection..."
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setRejectingId(null)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                            <button onClick={handleReject} disabled={!rejectionReason.trim()} className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg font-medium">Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Workout Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Add New Workout</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-wider">Name *</label>
                                <input
                                    type="text"
                                    value={newWorkout.name}
                                    onChange={e => setNewWorkout({ ...newWorkout, name: e.target.value })}
                                    placeholder="e.g. Barbell Bench Press"
                                    className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500/50 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-wider">Description *</label>
                                <textarea
                                    value={newWorkout.description}
                                    onChange={e => setNewWorkout({ ...newWorkout, description: e.target.value })}
                                    placeholder="Describe the exercise..."
                                    rows={3}
                                    className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500/50 outline-none resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider">Category</label>
                                    <select
                                        value={newWorkout.category}
                                        onChange={e => setNewWorkout({ ...newWorkout, category: e.target.value })}
                                        className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500/50 outline-none cursor-pointer"
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900 capitalize">{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider">Target Muscle</label>
                                    <select
                                        value={newWorkout.muscle_group}
                                        onChange={e => setNewWorkout({ ...newWorkout, muscle_group: e.target.value })}
                                        className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500/50 outline-none cursor-pointer"
                                    >
                                        {MUSCLE_GROUPS.filter(m => m !== 'All').map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-wider">Equipment (optional)</label>
                                <input
                                    type="text"
                                    value={newWorkout.equipment}
                                    onChange={e => setNewWorkout({ ...newWorkout, equipment: e.target.value })}
                                    placeholder="e.g. Barbell, Dumbbells"
                                    className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500/50 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2.5 text-slate-400 hover:text-white">Cancel</button>
                            <button onClick={handleAddWorkout} disabled={saving} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl font-medium">
                                {saving ? 'Creating...' : 'Create Workout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        official: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        rejected: 'bg-red-500/10 text-red-400 border-red-500/20'
    }
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider ${styles[status] || styles.official}`}>
            {status}
        </span>
    )
}
