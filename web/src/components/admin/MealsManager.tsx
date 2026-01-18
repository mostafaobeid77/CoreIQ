import { useState, useEffect } from 'react'
import { Search, Utensils, Plus, Trash2, ChevronDown, RefreshCw, X, Edit3, Flame, Droplets } from 'lucide-react'
import { adminApi, type Food } from '../../api/adminApi'
import { adminCache } from '../../utils/adminCache'

const MEAL_CATEGORIES = ['All', 'Proteins', 'Grains/Carbs', 'Vegetables', 'Fruits', 'Salads', 'Fast Foods', 'Drinks']

export function MealsManager() {
    const [category, setCategory] = useState('All')
    const [searchTerm, setSearchTerm] = useState('')
    const [foods, setFoods] = useState<Food[]>([])
    const [loading, setLoading] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [selectedFood, setSelectedFood] = useState<Food | null>(null)

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)

    // Add Meal Modal
    const [showAddModal, setShowAddModal] = useState(false)
    const [newMeal, setNewMeal] = useState({ name: '', description: '', category: 'Proteins', calories: 0, protein: 0, carbs: 0, fat: 0 })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setPage(1) // Reset to page 1 on filter change
    }, [category, searchTerm])

    useEffect(() => {
        loadData()
    }, [page, category, refreshTrigger]) // Trigger load on page change

    // Debounce search would be ideal, but for now we rely on the user typing or hitting enter if we wanted. 
    // Actually the previous code didn't debounce search separately, it used it in loadData directly.
    // We need to trigger loadData when search changes too, handled by the dependency above (conceptually).
    // But `searchTerm` is in the dependency of the reset effect, which resets page to 1. 
    // We need another effect or stricter control. 
    // Let's add a debounced search effect or just a manual trigger?
    // The previous code had `onKeyDown={(e) => e.key === 'Enter' && setRefreshTrigger(p => p + 1)}` for workout, but for meals it was just typing?
    // Ah, previous meals manager just used `searchTerm` in `loadData` but `loadData` was dependent on `[category, refreshTrigger]`.
    // It did NOT depend on `searchTerm`. 
    // So search ONLY worked if client-side filtered?
    // Wait, line 32: `search: searchTerm || undefined`. But `useEffect` only watched `[category, refreshTrigger]`.
    // So `searchTerm` was passed to API but `loadData` wasn't re-called when typing!
    // AND there was client side filtering: `const filteredFoods = searchTerm ? ...`
    // So previously it fetched ALL (limit 50 default) and THEN filtered locally? That's broken if the item isn't in top 50.

    useEffect(() => {
        const timer = setTimeout(() => {
            loadData()
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])


    const loadData = async () => {
        setLoading(true)
        try {
            const params = {
                page,
                limit: 24, // Matches grid nicely (4x6 or 3x8)
                category: category !== 'All' ? category : undefined,
                search: searchTerm || undefined
            }

            // Check cache - simplified to invalidate on search/page change for now or use complex key
            const cacheKey = JSON.stringify(params)
            const cached = adminCache.get<{ foods: Food[], pagination: any }>('foods', params)

            if (cached) {
                setFoods(cached.foods)
                setTotalPages(cached.pagination.pages)
                setTotalItems(cached.pagination.total)
                setLoading(false)
                return
            }

            const data = await adminApi.getFoods(params)
            setFoods(data.foods)
            setTotalPages(data.pagination.pages)
            setTotalItems(data.pagination.total)

            // Set cache
            adminCache.set('foods', params, data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const filteredFoods = foods // Server side filtered now

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this meal?')) return
        try {
            await adminApi.deleteFood(id)
            adminCache.invalidate('foods')
            setRefreshTrigger(prev => prev + 1)
            setSelectedFood(null)
        } catch { alert('Failed') }
    }

    const handleAddMeal = async () => {
        if (!newMeal.name || !newMeal.description) {
            alert('Please fill in name and description')
            return
        }
        setSaving(true)
        try {
            await adminApi.createFood(newMeal)
            adminCache.invalidate('foods')
            setShowAddModal(false)
            setNewMeal({ name: '', description: '', category: 'Proteins', calories: 0, protein: 0, carbs: 0, fat: 0 })
            setRefreshTrigger(prev => prev + 1)
        } catch (error) {
            console.error(error)
            alert('Failed to create meal')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Meals Library</h2>
                    <p className="text-sm text-slate-500">
                        <span className="text-white font-medium">{totalItems}</span> total meals
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search meals..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        />
                    </div>
                    <button onClick={() => setRefreshTrigger(p => p + 1)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex justify-end">
                <div className="relative">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="appearance-none bg-slate-900/50 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:outline-none cursor-pointer"
                    >
                        {MEAL_CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
            </div>

            {/* Content - Card Grid */}
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-40 text-slate-500">Loading...</div>
                ) : filteredFoods.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-slate-500">No meals found</div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[600px] overflow-y-auto">
                            {filteredFoods.map((food: any) => (
                                <FoodCard key={food._id} food={food} onClick={() => setSelectedFood(food)} />
                            ))}
                        </div>
                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4">
                            <div className="text-xs text-slate-500">
                                Showing <span className="text-white font-medium">{filteredFoods.length}</span> items on page {page} of {totalPages} (Total: {totalItems})
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-400">Page {page}</span>
                                </div>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Food Detail Modal */}
            {selectedFood && (
                <FoodDetailModal
                    food={selectedFood}
                    onClose={() => setSelectedFood(null)}
                    onDelete={handleDelete}
                    onSave={(updated) => {
                        console.log('Save:', updated)
                        setSelectedFood(null)
                    }}
                />
            )}

            {/* Add Meal Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Add New Meal</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-wider">Name *</label>
                                <input
                                    type="text"
                                    value={newMeal.name}
                                    onChange={e => setNewMeal({ ...newMeal, name: e.target.value })}
                                    placeholder="e.g. Grilled Chicken Breast"
                                    className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500/50 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-wider">Description *</label>
                                <textarea
                                    value={newMeal.description}
                                    onChange={e => setNewMeal({ ...newMeal, description: e.target.value })}
                                    placeholder="Describe the food item..."
                                    rows={2}
                                    className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500/50 outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-wider">Category</label>
                                <select
                                    value={newMeal.category}
                                    onChange={e => setNewMeal({ ...newMeal, category: e.target.value })}
                                    className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500/50 outline-none cursor-pointer"
                                >
                                    {MEAL_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider">Calories</label>
                                    <input
                                        type="number"
                                        value={newMeal.calories}
                                        onChange={e => setNewMeal({ ...newMeal, calories: parseFloat(e.target.value) || 0 })}
                                        className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:border-emerald-500/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider">Protein (g)</label>
                                    <input
                                        type="number"
                                        value={newMeal.protein}
                                        onChange={e => setNewMeal({ ...newMeal, protein: parseFloat(e.target.value) || 0 })}
                                        className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:border-emerald-500/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider">Carbs (g)</label>
                                    <input
                                        type="number"
                                        value={newMeal.carbs}
                                        onChange={e => setNewMeal({ ...newMeal, carbs: parseFloat(e.target.value) || 0 })}
                                        className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:border-emerald-500/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider">Fat (g)</label>
                                    <input
                                        type="number"
                                        value={newMeal.fat}
                                        onChange={e => setNewMeal({ ...newMeal, fat: parseFloat(e.target.value) || 0 })}
                                        className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:border-emerald-500/50 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2.5 text-slate-400 hover:text-white">Cancel</button>
                            <button onClick={handleAddMeal} disabled={saving} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-medium">
                                {saving ? 'Creating...' : 'Create Meal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function FoodCard({ food, onClick }: { food: Food, onClick: () => void }) {
    const isDrink = food.category?.toLowerCase() === 'drinks'
    return (
        <div
            onClick={onClick}
            className="group bg-black/40 border border-white/5 rounded-xl p-4 hover:border-emerald-500/40 hover:bg-black/60 transition-all cursor-pointer"
        >
            <div className="flex items-start justify-between gap-2 mb-3">
                <h5 className="font-medium text-white text-sm leading-tight line-clamp-2">{food.name}</h5>
                {isDrink && <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
            </div>
            <div className="text-lg font-bold text-emerald-400">{food.nutrients?.calories}<span className="text-xs font-normal text-slate-500 ml-1">kcal</span></div>
            <div className="flex gap-2 mt-2 text-[10px] font-mono">
                <span className="text-blue-400">{food.nutrients?.protein}P</span>
                <span className="text-amber-400">{food.nutrients?.carbs}C</span>
                <span className="text-pink-400">{food.nutrients?.fat}F</span>
            </div>
            <div className="text-[9px] text-slate-600 mt-2 capitalize">{food.category?.replace(/_/g, ' ')}</div>
        </div>
    )
}

interface FoodDetailModalProps {
    food: Food
    onClose: () => void
    onDelete: (id: string) => void
    onSave: (food: Food) => void
}

function FoodDetailModal({ food, onClose, onDelete, onSave }: FoodDetailModalProps) {
    const servings = (food as any).servings || []
    const isDrink = food.category?.toLowerCase() === 'drinks'
    const [mode, setMode] = useState<'base' | number>('base')
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState(food.name || '')
    const [editCalories, setEditCalories] = useState(food.nutrients?.calories || 0)
    const [editProtein, setEditProtein] = useState(food.nutrients?.protein || 0)
    const [editCarbs, setEditCarbs] = useState(food.nutrients?.carbs || 0)
    const [editFat, setEditFat] = useState(food.nutrients?.fat || 0)

    const getCurrentMacros = () => {
        if (mode === 'base') {
            return {
                calories: food.nutrients?.calories || 0,
                protein: food.nutrients?.protein || 0,
                carbs: food.nutrients?.carbs || 0,
                fat: food.nutrients?.fat || 0,
            }
        } else {
            const serving = servings[mode]
            return {
                calories: serving?.calories || 0,
                protein: serving?.protein || 0,
                carbs: serving?.carbs || 0,
                fat: serving?.fat || 0,
            }
        }
    }

    const currentMacros = getCurrentMacros()
    const currentLabel = mode === 'base'
        ? (isDrink ? 'per 100ml' : 'per 100g')
        : servings[mode]?.size || 'per serving'

    const handleSave = () => {
        onSave({
            ...food,
            name: editName,
            nutrients: { calories: editCalories, protein: editProtein, carbs: editCarbs, fat: editFat }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative p-6 pb-4">
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`p-2 rounded-full transition-colors ${isEditing ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400 hover:text-white'}`}
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-slate-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {isEditing ? (
                        <input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="text-xl font-bold text-white bg-transparent border-b border-emerald-500/50 focus:outline-none w-full pr-20"
                        />
                    ) : (
                        <h3 className="text-xl font-bold text-white pr-20">{food.name}</h3>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 capitalize">
                            {food.category?.replace(/_/g, ' ')}
                        </span>
                        {isDrink && <Droplets className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                </div>

                <div className="px-6 pb-4">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">View Nutrition</div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setMode('base')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === 'base'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            {isDrink ? <Droplets className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}
                            {isDrink ? 'Per 100ml' : 'Per 100g'}
                        </button>
                        {servings.map((serving: any, i: number) => (
                            <button
                                key={i}
                                onClick={() => setMode(i)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === i
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                {serving.size}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-6 pb-6">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">{currentLabel}</div>
                    <div className="grid grid-cols-4 gap-2">
                        <MacroBox label="Calories" value={currentMacros.calories} color="emerald" icon={<Flame className="w-3 h-3" />} />
                        <MacroBox label="Protein" value={currentMacros.protein} color="blue" suffix="g" />
                        <MacroBox label="Carbs" value={currentMacros.carbs} color="amber" suffix="g" />
                        <MacroBox label="Fat" value={currentMacros.fat} color="pink" suffix="g" />
                    </div>
                </div>

                {isEditing && (
                    <div className="px-6 pb-6 space-y-3">
                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Edit Base Values (per 100{isDrink ? 'ml' : 'g'})</div>
                        <div className="grid grid-cols-2 gap-3">
                            <EditField label="Calories" value={editCalories} onChange={setEditCalories} />
                            <EditField label="Protein (g)" value={editProtein} onChange={setEditProtein} />
                            <EditField label="Carbs (g)" value={editCarbs} onChange={setEditCarbs} />
                            <EditField label="Fat (g)" value={editFat} onChange={setEditFat} />
                        </div>
                    </div>
                )}

                <div className="p-4 border-t border-white/5 flex gap-3">
                    <button
                        onClick={() => onDelete(food._id!)}
                        className="px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex-1" />
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            Save Changes
                        </button>
                    ) : (
                        <button onClick={onClose} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors">
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function MacroBox({ label, value, color, icon, suffix }: { label: string; value: number; color: string; icon?: React.ReactNode; suffix?: string }) {
    const colors: any = {
        emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
        blue: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/20',
        amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
        pink: 'from-pink-500/20 to-pink-500/5 text-pink-400 border-pink-500/20',
    }
    return (
        <div className={`bg-gradient-to-b ${colors[color]} border rounded-xl p-3 text-center`}>
            {icon && <div className="flex justify-center mb-1">{icon}</div>}
            <div className="text-lg font-bold">{value}{suffix && <span className="text-xs ml-0.5">{suffix}</span>}</div>
            <div className="text-[9px] uppercase tracking-wider opacity-70">{label}</div>
        </div>
    )
}

function EditField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return (
        <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</label>
            <input
                type="number"
                value={value}
                onChange={e => onChange(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50"
            />
        </div>
    )
}
