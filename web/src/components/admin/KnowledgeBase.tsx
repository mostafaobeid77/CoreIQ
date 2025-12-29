import { useState, useEffect } from 'react'
import { Search, Dumbbell, Utensils, CheckCircle, XCircle, AlertCircle, Plus, Trash2, ChevronDown, RefreshCw } from 'lucide-react'
import { adminApi, type Workout, type Food } from '../../api/adminApi'

type MainTab = 'workouts' | 'meals'

// Categories for filtering
const WORKOUT_CATEGORIES = ['All', 'Strength', 'Cardio', 'HIIT', 'Stretching', 'Core', 'Full Body']
const MEAL_CATEGORIES = ['All', 'Proteins', 'Grains & Carbs', 'Vegetables', 'Fruits', 'Salads', 'Fast Food', 'Drinks', 'Desserts']

export function KnowledgeBase() {
    const [mainTab, setMainTab] = useState<MainTab>('workouts')
    const [workoutSubTab, setWorkoutSubTab] = useState<'pending' | 'official'>('pending')
    const [workoutCategory, setWorkoutCategory] = useState('All')
    const [mealCategory, setMealCategory] = useState('All')
    const [searchTerm, setSearchTerm] = useState('')

    const [workouts, setWorkouts] = useState<Workout[]>([])
    const [foods, setFoods] = useState<Food[]>([])
    const [loading, setLoading] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Rejection Modal State
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    useEffect(() => {
        loadData()
    }, [mainTab, workoutSubTab, refreshTrigger])

    const loadData = async () => {
        setLoading(true)
        try {
            if (mainTab === 'workouts') {
                const status = workoutSubTab === 'pending' ? 'pending' : 'official'
                const data = await adminApi.getWorkouts({ status, search: searchTerm || undefined })
                setWorkouts(data.workouts)
            } else {
                const data = await adminApi.getFoods({ search: searchTerm || undefined })
                setFoods(data.foods)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Filter locally by category
    const filteredWorkouts = workoutCategory === 'All'
        ? workouts
        : workouts.filter(w => w.category?.toLowerCase().includes(workoutCategory.toLowerCase()))

    const filteredFoods = mealCategory === 'All'
        ? foods
        : foods.filter(f => f.category?.toLowerCase().includes(mealCategory.toLowerCase().replace(' & ', '_').replace(' ', '_')))

    const handleApprove = async (id: string) => {
        if (!window.confirm('Approve this workout for public release?')) return
        try {
            await adminApi.updateWorkoutStatus(id, 'approved')
            setRefreshTrigger(prev => prev + 1)
        } catch { alert('Failed to approve') }
    }

    const handleReject = async () => {
        if (!rejectingId || !rejectionReason) return
        try {
            await adminApi.updateWorkoutStatus(rejectingId, 'rejected', rejectionReason)
            setRejectingId(null)
            setRejectionReason('')
            setRefreshTrigger(prev => prev + 1)
        } catch { alert('Failed to reject') }
    }

    const handleDeleteWorkout = async (id: string) => {
        if (!window.confirm('Delete this workout permanently?')) return
        try {
            await adminApi.deleteWorkout(id)
            setRefreshTrigger(prev => prev + 1)
        } catch { alert('Failed to delete') }
    }

    const handleDeleteFood = async (id: string) => {
        if (!window.confirm('Delete this meal permanently?')) return
        try {
            await adminApi.deleteFood(id)
            setRefreshTrigger(prev => prev + 1)
        } catch { alert('Failed to delete') }
    }

    const handleSearch = () => {
        setRefreshTrigger(prev => prev + 1)
    }

    return (
        <div className="space-y-6 relative">
            {/* Main Tabs */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setMainTab('workouts')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${mainTab === 'workouts'
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <Dumbbell className="w-4 h-4" />
                        Workouts
                    </button>
                    <button
                        onClick={() => setMainTab('meals')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${mainTab === 'meals'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <Utensils className="w-4 h-4" />
                        Meals
                    </button>
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder={`Search ${mainTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                        />
                    </div>
                    <button
                        onClick={() => setRefreshTrigger(p => p + 1)}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {mainTab === 'workouts' ? (
                <WorkoutsSection
                    subTab={workoutSubTab}
                    setSubTab={setWorkoutSubTab}
                    category={workoutCategory}
                    setCategory={setWorkoutCategory}
                    categories={WORKOUT_CATEGORIES}
                    workouts={filteredWorkouts}
                    loading={loading}
                    onApprove={handleApprove}
                    onReject={(id: string) => setRejectingId(id)}
                    onDelete={handleDeleteWorkout}
                />
            ) : (
                <MealsSection
                    category={mealCategory}
                    setCategory={setMealCategory}
                    categories={MEAL_CATEGORIES}
                    foods={filteredFoods}
                    loading={loading}
                    onDelete={handleDeleteFood}
                />
            )}

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
                            <button onClick={() => setRejectingId(null)} className="px-4 py-2 text-slate-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim()}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg font-medium"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ========== Workouts Section ==========
function WorkoutsSection({ subTab, setSubTab, category, setCategory, categories, workouts, loading, onApprove, onReject, onDelete }: any) {
    return (
        <div className="space-y-4">
            {/* Sub-tabs & Category Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setSubTab('pending')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${subTab === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <AlertCircle className="w-4 h-4" />
                        Pending Review
                    </button>
                    <button
                        onClick={() => setSubTab('official')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${subTab === 'official' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <CheckCircle className="w-4 h-4" />
                        Official Library
                    </button>
                </div>

                <CategoryDropdown value={category} onChange={setCategory} options={categories} />
            </div>

            {/* Table */}
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
                {loading ? (
                    <LoadingState />
                ) : workouts.length === 0 ? (
                    <EmptyState message="No workouts found" />
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
                                {workouts.map((w: any) => (
                                    <tr key={w._id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4"><StatusBadge status={w.status} /></td>
                                        <td className="p-4">
                                            <div className="font-medium text-white">{w.name}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">{w.description}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs px-2 py-1 rounded-lg bg-violet-500/10 text-violet-400 capitalize">
                                                {w.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-400 capitalize">{w.muscle_group}</td>
                                        <td className="p-4">
                                            {subTab === 'pending' ? (
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => onApprove(w._id)} className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/20 transition-colors" title="Approve">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => onReject(w._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors" title="Reject">
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => onDelete(w._id)} className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/10 transition-colors" title="Delete">
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
        </div>
    )
}

// ========== Meals Section ==========
function MealsSection({ category, setCategory, categories, foods, loading, onDelete }: any) {
    // Group foods by category for visual organization
    const groupedFoods = foods.reduce((acc: any, food: any) => {
        const cat = food.category || 'Other'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(food)
        return acc
    }, {})

    const categoryKeys = Object.keys(groupedFoods).sort()

    return (
        <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-slate-400">
                    <span className="text-white font-medium">{foods.length}</span> meals in database
                </div>
                <CategoryDropdown value={category} onChange={setCategory} options={categories} />
            </div>

            {/* Category Cards */}
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
                {loading ? (
                    <LoadingState />
                ) : foods.length === 0 ? (
                    <EmptyState message="No meals found" />
                ) : category === 'All' ? (
                    // Show grouped by category
                    <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
                        {categoryKeys.map(cat => (
                            <div key={cat}>
                                <div className="flex items-center gap-2 mb-3">
                                    <h4 className="text-sm font-medium text-white capitalize">{cat.replace(/_/g, ' ')}</h4>
                                    <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{groupedFoods[cat].length}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {groupedFoods[cat].slice(0, 6).map((food: any) => (
                                        <FoodCard key={food._id} food={food} onDelete={onDelete} />
                                    ))}
                                    {groupedFoods[cat].length > 6 && (
                                        <div className="flex items-center justify-center text-slate-500 text-sm bg-white/5 rounded-xl p-4">
                                            +{groupedFoods[cat].length - 6} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Show flat list for specific category
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                        {foods.map((food: any) => (
                            <FoodCard key={food._id} food={food} onDelete={onDelete} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function FoodCard({ food, onDelete }: any) {
    return (
        <div className="group bg-black/30 border border-white/5 rounded-xl p-4 hover:border-violet-500/30 transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-white text-sm truncate">{food.name}</h5>
                    <div className="text-xs text-emerald-400 mt-1">{food.nutrients?.calories} kcal</div>
                </div>
                <button
                    onClick={() => onDelete(food._id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition-all"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="flex gap-3 mt-3 text-[10px] text-slate-500 font-mono">
                <span className="text-blue-400">{food.nutrients?.protein}P</span>
                <span className="text-amber-400">{food.nutrients?.carbs}C</span>
                <span className="text-pink-400">{food.nutrients?.fat}F</span>
            </div>
        </div>
    )
}

// ========== Shared Components ==========
function CategoryDropdown({ value, onChange, options }: any) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none bg-slate-900/50 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 cursor-pointer"
            >
                {options.map((opt: string) => (
                    <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
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

function LoadingState() {
    return <div className="flex items-center justify-center h-40 text-slate-500">Loading...</div>
}

function EmptyState({ message }: { message: string }) {
    return <div className="flex items-center justify-center h-40 text-slate-500">{message}</div>
}
