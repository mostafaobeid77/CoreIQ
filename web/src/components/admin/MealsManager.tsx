import { useState, useEffect } from 'react'
import { Search, Utensils, Plus, Trash2, ChevronDown, RefreshCw, X, Edit3, Flame, Droplets } from 'lucide-react'
import { adminApi, type Food } from '../../api/adminApi'

const MEAL_CATEGORIES = ['All', 'Proteins', 'Grains/Carbs', 'Vegetables', 'Fruits', 'Salads', 'Fast Foods', 'Drinks']

export function MealsManager() {
    const [category, setCategory] = useState('All')
    const [searchTerm, setSearchTerm] = useState('')
    const [foods, setFoods] = useState<Food[]>([])
    const [loading, setLoading] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [selectedFood, setSelectedFood] = useState<Food | null>(null)

    // Load data when filter changes
    useEffect(() => {
        loadData()
    }, [category, refreshTrigger])

    const loadData = async () => {
        setLoading(true)
        try {
            // Server-side filtering for better performance
            const data = await adminApi.getFoods({
                category: category !== 'All' ? category : undefined,
                search: searchTerm || undefined
            })
            setFoods(data.foods)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // No client-side filtering needed - server handles it
    // Just apply instant search filter for responsiveness
    const filteredFoods = searchTerm
        ? foods.filter(f => f.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        : foods

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this meal?')) return
        try {
            await adminApi.deleteFood(id)
            setRefreshTrigger(prev => prev + 1)
            setSelectedFood(null)
        } catch { alert('Failed') }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Meals Library</h2>
                    <p className="text-sm text-slate-500">
                        <span className="text-white font-medium">{filteredFoods.length}</span> of {foods.length} meals
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
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl">
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[600px] overflow-y-auto">
                        {filteredFoods.map((food: any) => (
                            <FoodCard key={food._id} food={food} onClick={() => setSelectedFood(food)} />
                        ))}
                    </div>
                )}
            </div>

            {/* Food Detail Modal */}
            {selectedFood && (
                <FoodDetailModal
                    food={selectedFood}
                    onClose={() => setSelectedFood(null)}
                    onDelete={handleDelete}
                    onSave={(updated) => {
                        // TODO: Call update API
                        console.log('Save:', updated)
                        setSelectedFood(null)
                    }}
                />
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

    // Mode: 'base' for per 100g/ml, or serving index
    const [mode, setMode] = useState<'base' | number>('base')
    const [isEditing, setIsEditing] = useState(false)

    // Editable fields
    const [editName, setEditName] = useState(food.name || '')
    const [editCalories, setEditCalories] = useState(food.nutrients?.calories || 0)
    const [editProtein, setEditProtein] = useState(food.nutrients?.protein || 0)
    const [editCarbs, setEditCarbs] = useState(food.nutrients?.carbs || 0)
    const [editFat, setEditFat] = useState(food.nutrients?.fat || 0)

    // Get macros based on selected mode
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
                {/* Header */}
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

                {/* Mode Selector */}
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

                {/* Macro Display */}
                <div className="px-6 pb-6">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">{currentLabel}</div>
                    <div className="grid grid-cols-4 gap-2">
                        <MacroBox label="Calories" value={currentMacros.calories} color="emerald" icon={<Flame className="w-3 h-3" />} />
                        <MacroBox label="Protein" value={currentMacros.protein} color="blue" suffix="g" />
                        <MacroBox label="Carbs" value={currentMacros.carbs} color="amber" suffix="g" />
                        <MacroBox label="Fat" value={currentMacros.fat} color="pink" suffix="g" />
                    </div>
                </div>

                {/* Edit fields (when editing) */}
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

                {/* Footer */}
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
