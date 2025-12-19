import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
	Activity,
	AlertCircle,
	BarChart3,
	Bell,
	BrainCircuit,
	Command,
	Download,
	Link as LinkIcon,
	Loader2,
	LogOut,
	Plus,
	RefreshCcw,
	Search,
	ServerCrash,
	Settings,
	ShieldCheck,
	Sparkles,
	Users,
	Zap,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:5000/api'

type Tab = 'overview' | 'workouts' | 'meals' | 'users' | 'system'

type WorkoutSummary = {
	_id: string
	name: string
	description: string
	category: string
	muscle_group: string
	equipment?: string
	createdAt?: string
}

type MealSummary = {
	_id: string
	name: string
	description: string
	category: string
	nutrients: {
		calories: number
		protein: number
		carbs: number
		fat: number
	}
	createdAt?: string
}

type MealServingDraft = {
	size: string
	calories: string
	protein: string
	carbs: string
	fat: string
	grams: string
}

type UserSummary = {
	_id: string
	fullName?: string
	username?: string
	email?: string
	gender?: string
	createdAt?: string
}

const overviewCards = [
	{ title: 'Active programs', value: '128', change: '+12.4%', icon: <Zap className="h-5 w-5 text-indigo-400" /> },
	{ title: 'AI sessions today', value: '2,431', change: '+8.1%', icon: <BrainCircuit className="h-5 w-5 text-sky-400" /> },
	{ title: 'New signups', value: '312', change: '+4.3%', icon: <Users className="h-5 w-5 text-emerald-400" /> },
	{ title: 'Downloads', value: '18.9K', change: '+16.7%', icon: <Download className="h-5 w-5 text-amber-400" /> },
]

const fallbackWorkouts: WorkoutSummary[] = [
	{
		_id: 'demo-workout-1',
		name: 'Core Stability Flow',
	description: 'Low-impact sequence focused on midline stability',
	category: 'Mobility',
	muscle_group: 'Core',
	equipment: 'Mat',
	},
	{
		_id: 'demo-workout-2',
		name: 'Power Rack Strength',
	description: 'Heavy compound lifts for advanced athletes',
	category: 'Strength',
	muscle_group: 'Full body',
	equipment: 'Barbell, rack',
	},
]

const fallbackMeals: MealSummary[] = [
	{
		_id: 'demo-meal-1',
		name: 'Recovery Bowl',
	description: 'Quinoa, grilled salmon, citrus greens, and avocado dressing',
	category: 'Dinner',
	nutrients: { calories: 620, protein: 38, carbs: 48, fat: 26 },
	},
	{
		_id: 'demo-meal-2',
		name: 'Focus Fuel Smoothie',
	description: 'Blueberries, greek yogurt, adaptogens, and flax seeds',
	category: 'Breakfast',
	nutrients: { calories: 420, protein: 27, carbs: 49, fat: 12 },
	},
]

const fallbackWorkoutCategories = ['Strength', 'Mobility', 'Conditioning', 'Recovery']
const fallbackMuscleGroups = ['Full body', 'Core', 'Upper body', 'Lower body', 'Back', 'Chest']
const MEAL_CANONICAL_CATEGORIES = ['drinks', 'fast_foods', 'fruits', 'grains_carbs', 'proteins', 'salads', 'vegetables'] as const
const fallbackMealCategories = [...MEAL_CANONICAL_CATEGORIES]

const fallbackUsers: UserSummary[] = [
	{
		_id: 'demo-user-1',
		fullName: 'Dana Rivera',
		username: 'dana_moves',
		email: 'dana@example.com',
		gender: 'female',
		createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
	},
	{
		_id: 'demo-user-2',
		fullName: 'Kyle Patterson',
		username: 'kyle_lifts',
		email: 'kyle@example.com',
		gender: 'male',
		createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
	},
]

const activityLog: Array<{ time: string; actor: string; action: string; impact: string }> = [
	{ time: '14:22', actor: 'Ava Chen', action: 'Updated workout templates', impact: 'Workouts' },
	{ time: '13:49', actor: 'Marcus Lee', action: 'Approved new meal plans', impact: 'Nutrition' },
	{ time: '13:17', actor: 'System', action: 'Generated AI insights digest', impact: 'Analytics' },
	{ time: '12:54', actor: 'Chloe Patel', action: 'Reviewed flagged feedback', impact: 'Support' },
]

const getGlobalScope = () => {
	if (typeof globalThis !== 'undefined') return globalThis as typeof globalThis
	// eslint-disable-next-line no-undef
	if (typeof window !== 'undefined') return window as unknown as typeof globalThis
	// eslint-disable-next-line no-undef
	if (typeof self !== 'undefined') return self as unknown as typeof globalThis
	const maybeNodeGlobal = typeof globalThis !== 'undefined' ? (globalThis as Record<string, unknown>).global : undefined
	if (maybeNodeGlobal && typeof maybeNodeGlobal === 'object') {
		return maybeNodeGlobal as typeof globalThis
	}
	return {} as typeof globalThis
}

const safeRandomId = () => {
	const scope = getGlobalScope()
	try {
		if (scope.crypto && typeof scope.crypto.randomUUID === 'function') {
			return scope.crypto.randomUUID()
		}
	} catch (_) {
		// ignore and fallback to Math.random
	}
	return Math.random().toString(36).slice(2, 12)
}

type MealFormState = {
	name: string
	description: string
	category: string
	calories: string
	protein: string
	carbs: string
	fat: string
}

const createMealFormDefaults = (category: string): MealFormState => ({
	name: '',
	description: '',
	category,
	calories: '',
	protein: '',
	carbs: '',
	fat: '',
})

const normalizeStringList = (values: unknown[], fallback: readonly string[]) => {
	const dedup = new Map<string, string>()
	for (const value of values) {
		if (typeof value === 'string') {
			const trimmed = value.trim()
			if (!trimmed) continue
			const key = trimmed.toLowerCase()
			if (!dedup.has(key)) dedup.set(key, trimmed)
		}
	}
	if (!dedup.size) return [...fallback]
	return [...dedup.values()].sort((a, b) => a.localeCompare(b))
}

const formatMealCategory = (value: string) =>
	value
		.split('_')
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(' ')

const normalizeWorkout = (workout: Partial<WorkoutSummary> & Record<string, unknown>): WorkoutSummary => ({
	_id: typeof workout._id === 'string' ? workout._id : `workout-${safeRandomId()}`,
	name: typeof workout.name === 'string' ? workout.name : 'Untitled workout',
	description: typeof workout.description === 'string' ? workout.description : 'No description provided.',
	category: typeof workout.category === 'string' ? workout.category : 'Uncategorized',
	muscle_group: typeof workout.muscle_group === 'string' ? workout.muscle_group : 'General',
	equipment: typeof workout.equipment === 'string' ? workout.equipment : '',
	createdAt: typeof workout.createdAt === 'string' ? workout.createdAt : undefined,
})

const normalizeMeal = (meal: Partial<MealSummary> & Record<string, unknown>): MealSummary => ({
	_id: typeof meal._id === 'string' ? meal._id : `meal-${safeRandomId()}`,
	name: typeof meal.name === 'string' ? meal.name : 'Untitled meal',
	description: typeof meal.description === 'string' ? meal.description : 'No description provided.',
	category: typeof meal.category === 'string' ? meal.category : 'Uncategorized',
	nutrients: {
		calories: Number(meal.nutrients?.calories ?? meal.calories ?? 0) || 0,
		protein: Number(meal.nutrients?.protein ?? meal.protein ?? 0) || 0,
		carbs: Number(meal.nutrients?.carbs ?? meal.carbs ?? 0) || 0,
		fat: Number(meal.nutrients?.fat ?? meal.fat ?? 0) || 0,
	},
	createdAt: typeof meal.createdAt === 'string' ? meal.createdAt : undefined,
})

const isRecent = (date?: string, hours = 24) => {
	if (!date) return false
	return Date.now() - new Date(date).getTime() <= hours * 3600 * 1000
}

export function AdminDashboardPage() {
	const navigate = useNavigate()
	const [activeTab, setActiveTab] = useState<Tab>('overview')

	const [workoutCategories, setWorkoutCategories] = useState<string[]>(fallbackWorkoutCategories)
	const [muscleGroups, setMuscleGroups] = useState<string[]>(fallbackMuscleGroups)
	const [mealCategories, setMealCategories] = useState<string[]>(fallbackMealCategories)
	const [metaLoading, setMetaLoading] = useState(false)

	const [workoutSearch, setWorkoutSearch] = useState('')
	const [workoutResults, setWorkoutResults] = useState<WorkoutSummary[]>(fallbackWorkouts)
	const [workoutLoading, setWorkoutLoading] = useState(false)
	const [workoutMessage, setWorkoutMessage] = useState<string | null>(null)
	const [workoutError, setWorkoutError] = useState<string | null>(null)
	const [workoutFetched, setWorkoutFetched] = useState(false)
	const [workoutForm, setWorkoutForm] = useState({
		name: '',
		description: '',
		category: fallbackWorkoutCategories[0] ?? 'Uncategorized',
		muscle_group: fallbackMuscleGroups[0] ?? 'General',
		equipment: '',
	})

	const [mealSearch, setMealSearch] = useState('')
	const [mealResults, setMealResults] = useState<MealSummary[]>(fallbackMeals)
	const [mealLoading, setMealLoading] = useState(false)
	const [mealMessage, setMealMessage] = useState<string | null>(null)
	const [mealError, setMealError] = useState<string | null>(null)
	const [mealFetched, setMealFetched] = useState(false)
	const [mealForm, setMealForm] = useState<MealFormState>(createMealFormDefaults(MEAL_CANONICAL_CATEGORIES[0]))
	const [servings, setServings] = useState<MealServingDraft[]>([
		{ size: '', calories: '', protein: '', carbs: '', fat: '', grams: '' },
	])

	const [users, setUsers] = useState<UserSummary[]>(fallbackUsers)
	const [totalUsers, setTotalUsers] = useState<number>(fallbackUsers.length)
	const [userSearch, setUserSearch] = useState('')
	const [userLoading, setUserLoading] = useState(false)
	const [userError, setUserError] = useState<string | null>(null)
	const [usersFetched, setUsersFetched] = useState(false)
	const [userNotificationCount, setUserNotificationCount] = useState(0)
	const latestUserTimestamp = useRef<string | null>(null)

	useEffect(() => {
		const token = localStorage.getItem('coreiq_admin_token')
		if (!token) {
			navigate('/admin/login', { replace: true })
		}
	}, [navigate])

	const refreshMetadata = useCallback(async () => {
		setMetaLoading(true)
		try {
			const [catRes, muscleRes, mealRes] = await Promise.all([
				fetch(`${API_BASE_URL}/workouts/categories`),
				fetch(`${API_BASE_URL}/workouts/muscle-groups`),
				fetch(`${API_BASE_URL}/foods/categories`),
			])

			if (catRes.ok) {
				const categories = await catRes.json()
				const normalized = normalizeStringList(categories, fallbackWorkoutCategories)
				setWorkoutCategories(normalized)
				setWorkoutForm((prev) => ({ ...prev, category: normalized[0] ?? prev.category ?? 'Uncategorized' }))
			}

			if (muscleRes.ok) {
				const groups = await muscleRes.json()
				const normalized = normalizeStringList(groups, fallbackMuscleGroups)
				setMuscleGroups(normalized)
				setWorkoutForm((prev) => ({ ...prev, muscle_group: normalized[0] ?? prev.muscle_group ?? 'General' }))
			}

			if (mealRes.ok) {
				const categories = await mealRes.json()
				const normalized = normalizeStringList([...categories, ...MEAL_CANONICAL_CATEGORIES], MEAL_CANONICAL_CATEGORIES)
				setMealCategories([...normalized])
				setMealForm((prev: MealFormState) => ({ ...prev, category: normalized[0] ?? prev.category ?? MEAL_CANONICAL_CATEGORIES[0] }))
			} else {
				setMealCategories([...MEAL_CANONICAL_CATEGORIES])
				setMealForm((prev: MealFormState) => ({ ...prev, category: prev.category || MEAL_CANONICAL_CATEGORIES[0] }))
			}
		} catch (error) {
			console.warn('Failed to fetch reference data for admin dashboard:', error)
		} finally {
			setMetaLoading(false)
		}
	}, [])

	useEffect(() => {
		refreshMetadata()
	}, [refreshMetadata])

	const fetchWorkouts = useCallback(
		async (query?: string) => {
			setWorkoutLoading(true)
			setWorkoutError(null)
			try {
				const params = new URLSearchParams()
				if (query) params.set('name', query)
				params.set('limit', '25')
				const response = await fetch(`${API_BASE_URL}/workouts?${params.toString()}`)
				if (!response.ok) throw new Error('Unable to retrieve workouts')
				const raw: unknown = await response.json()
				const data = Array.isArray(raw) ? raw.map((item) => normalizeWorkout(item as Record<string, unknown>)) : []
				setWorkoutResults(data.length ? data : fallbackWorkouts)
				setWorkoutFetched(true)
			} catch (error) {
				if (error instanceof Error) setWorkoutError(error.message)
				setWorkoutResults(fallbackWorkouts)
			} finally {
				setWorkoutLoading(false)
			}
		},
		[]
	)

	const fetchMeals = useCallback(
		async (query?: string) => {
			setMealLoading(true)
			setMealError(null)
			try {
				const params = new URLSearchParams()
				if (query) params.set('name', query)
				params.set('limit', '25')
				const response = await fetch(`${API_BASE_URL}/foods?${params.toString()}`)
				if (!response.ok) throw new Error('Unable to retrieve meals')
				const raw: unknown = await response.json()
				const data = Array.isArray(raw) ? raw.map((item) => normalizeMeal(item as Record<string, unknown>)) : []
				setMealResults(data.length ? data : fallbackMeals)
				setMealFetched(true)
			} catch (error) {
				if (error instanceof Error) setMealError(error.message)
				setMealResults(fallbackMeals)
			} finally {
				setMealLoading(false)
			}
		},
		[]
	)

	const fetchUsers = useCallback(
		async (query?: string, options?: { isPoll?: boolean }) => {
			if (!options?.isPoll) {
				setUserLoading(true)
				setUserError(null)
			}

			try {
				const params = new URLSearchParams()
				if (query) params.set('search', query)
				params.set('limit', '50')
				const response = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`)
				if (!response.ok) throw new Error('Unable to retrieve users')
				const data: { users: UserSummary[]; totalUsers?: number } = await response.json()
				const incomingUsers = data.users ?? []
				setUsers(incomingUsers.length ? incomingUsers : fallbackUsers)
				setTotalUsers(data.totalUsers ?? incomingUsers.length ?? fallbackUsers.length)
				setUsersFetched(true)

				const latest = incomingUsers[0]?.createdAt
				if (latest) {
					if (latestUserTimestamp.current) {
						const currentLatest = new Date(latestUserTimestamp.current)
						if (new Date(latest) > currentLatest && activeTab !== 'users') {
							setUserNotificationCount((count) => count + 1)
						}
					}
					latestUserTimestamp.current = latest
				}
			} catch (error) {
				if (!options?.isPoll) {
					if (error instanceof Error) setUserError(error.message)
					setUsers(fallbackUsers)
					setTotalUsers(fallbackUsers.length)
				}
			} finally {
				if (!options?.isPoll) setUserLoading(false)
			}
		},
		[activeTab]
	)

	useEffect(() => {
		if (activeTab === 'workouts' && !workoutFetched) {
			fetchWorkouts()
		}
		if (activeTab === 'meals' && !mealFetched) {
			fetchMeals()
		}
		if (activeTab === 'users' && !usersFetched) {
			fetchUsers()
		}
	}, [activeTab, fetchMeals, fetchUsers, fetchWorkouts, mealFetched, usersFetched, workoutFetched])

	useEffect(() => {
		if (!usersFetched) return
		const interval = window.setInterval(() => {
			fetchUsers(undefined, { isPoll: true })
		}, 30000)
		return () => window.clearInterval(interval)
	}, [fetchUsers, usersFetched])

	useEffect(() => {
		if (activeTab === 'users') {
			setUserNotificationCount(0)
		}
	}, [activeTab])

	const quickActions = useMemo(
		() => [
			{ label: 'Create workout', icon: Activity, onSelect: () => setActiveTab('workouts') },
			{ label: 'Create meal', icon: BrainCircuit, onSelect: () => setActiveTab('meals') },
			{ label: 'Monitor system', icon: ServerCrash, onSelect: () => setActiveTab('system') },
			{ label: 'View new registrations', icon: Users, onSelect: () => setActiveTab('users'), badge: userNotificationCount },
			{ label: 'Marketing site', icon: LinkIcon, onSelect: () => navigate('/') },
		],
		[navigate, userNotificationCount]
	)

	const addServingRow = () => {
		setServings((prev) => [...prev, { size: '', calories: '', protein: '', carbs: '', fat: '', grams: '' }])
	}

	const updateServing = (index: number, field: keyof MealServingDraft, value: string) => {
		setServings((prev) => prev.map((serving, idx) => (idx === index ? { ...serving, [field]: value } : serving)))
	}

	const removeServing = (index: number) => {
		setServings((prev) => prev.filter((_, idx) => idx !== index))
	}

	const handleWorkoutCreate = async () => {
		setWorkoutMessage(null)
		setWorkoutError(null)
		if (!workoutForm.name || !workoutForm.description || !workoutForm.category || !workoutForm.muscle_group) {
			setWorkoutError('Please fill in the required fields.')
			return
		}

		try {
			const response = await fetch(`${API_BASE_URL}/admin/content/workouts`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(workoutForm),
			})

			if (!response.ok) throw new Error('Unable to create workout at this time')
			const data = await response.json()
			const normalized = normalizeWorkout(data.workout ?? {})
			setWorkoutMessage('Workout added successfully. It is now available to athletes.')
			setWorkoutResults((prev) => [normalized, ...prev])
			setWorkoutForm({
				name: '',
				description: '',
				category: workoutCategories[0] ?? 'Uncategorized',
				muscle_group: muscleGroups[0] ?? 'General',
				equipment: '',
			})
		} catch (error) {
			setWorkoutResults((prev) => [
				{
					_id: `demo-${Date.now()}`,
					name: workoutForm.name,
					description: workoutForm.description,
					category: workoutForm.category,
					muscle_group: workoutForm.muscle_group,
					equipment: workoutForm.equipment,
				},
				...prev,
			])
			const message = error instanceof Error ? error.message : 'Created locally for preview. Backend unreachable.'
			setWorkoutMessage(message)
		}
	}

	const handleMealCreate = async () => {
		setMealMessage(null)
		setMealError(null)
		if (!mealForm.name || !mealForm.description || !mealForm.category) {
			setMealError('Please fill in the required fields.')
			return
		}

		const servingsPayload = servings
			.filter((serving) => serving.size.trim())
			.map((serving) => ({
				size: serving.size,
				calories: serving.calories,
				protein: serving.protein,
				carbs: serving.carbs,
				fat: serving.fat,
				grams: serving.grams,
			}))

		const payload = {
			category: mealForm.category,
			name: mealForm.name,
			description: mealForm.description,
			calories: mealForm.calories,
			protein: mealForm.protein,
			carbs: mealForm.carbs,
			fat: mealForm.fat,
			servings: servingsPayload,
			baseQuantity: { amount: 100, unit: 'g', basis: 'per100g' as const },
		}

		try {
			const response = await fetch(`${API_BASE_URL}/admin/content/meals`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})

			if (!response.ok) throw new Error('Unable to create meal right now')
			const data = await response.json()
			const normalized = normalizeMeal(data.food ?? {})
			setMealMessage('Meal created successfully. It is now available to training plans.')
			setMealResults((prev) => [normalized, ...prev])
			setMealForm(createMealFormDefaults(mealCategories[0] ?? MEAL_CANONICAL_CATEGORIES[0]))
			setServings([{ size: '', calories: '', protein: '', carbs: '', fat: '', grams: '' }])
		} catch (error) {
			const fallback: MealSummary = normalizeMeal({
				name: mealForm.name,
				description: mealForm.description,
				category: mealForm.category,
				nutrients: {
					calories: Number(mealForm.calories) || 0,
					protein: Number(mealForm.protein) || 0,
					carbs: Number(mealForm.carbs) || 0,
					fat: Number(mealForm.fat) || 0,
				},
			})
			setMealResults((prev) => [fallback, ...prev])
			const message = error instanceof Error ? error.message : 'Created locally for preview. Backend unreachable.'
			setMealMessage(message)
		}
	}

	const overviewSection = useMemo(
		() => (
			<>
				<section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
					{overviewCards.map((card) => (
						<motion.div
							key={card.title}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
							className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.8)]"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs uppercase tracking-[0.25em] text-slate-400">{card.title}</p>
									<h3 className="mt-3 text-3xl font-semibold text-white">{card.value}</h3>
								</div>
								<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/5">
									{card.icon}
								</div>
							</div>
							<p className="mt-6 text-sm font-medium text-emerald-300">{card.change} vs last week</p>
						</motion.div>
					))}
				</section>

				<section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.05 }}
						className="rounded-3xl border border-white/10 bg-slate-900/70 p-6"
					>
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-lg font-semibold text-white">Engagement pulse</h2>
								<p className="text-sm text-slate-400">30-day view of workouts, meals, and AI sessions</p>
							</div>
							<button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-indigo-100 transition hover:bg-white/10">
								<BarChart3 size={16} /> Export report
							</button>
						</div>

						<div className="mt-8 grid grid-cols-3 gap-6">
							{[
								{ label: 'Workout adherence', value: '87%', detail: '↑ 5.3% vs 14d' },
								{ label: 'Nutrition completion', value: '78%', detail: '↑ 3.1% vs 14d' },
								{ label: 'AI replies', value: '3.5K', detail: '↑ 11% vs 14d' },
							].map((item) => (
								<div key={item.label} className="rounded-2xl border border-white/5 bg-white/5/5 p-4">
									<p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
									<p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
									<p className="mt-2 text-xs text-emerald-300">{item.detail}</p>
								</div>
							))}
						</div>

						<div className="mt-8 h-40 rounded-2xl border border-white/5 bg-gradient-to-r from-indigo-500/15 via-slate-900 to-transparent" />
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.1 }}
						className="rounded-3xl border border-white/10 bg-slate-900/70 p-6"
					>
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-white">Quick actions</h2>
							<span className="text-xs text-slate-400">Focus areas for today</span>
						</div>
						<ul className="mt-6 space-y-4">
							{quickActions.map((action) => (
								<li key={action.label}>
									<button
										onClick={action.onSelect}
										className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
									>
										<span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
											<action.icon className="h-4 w-4 text-indigo-300" />
											{action.badge ? (
												<span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-bold text-slate-900">
													{action.badge}
												</span>
											) : null}
										</span>
										{action.label}
									</button>
								</li>
							))}
						</ul>
					</motion.div>
				</section>

				<section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.15 }}
						className="rounded-3xl border border-white/10 bg-slate-900/70 p-6"
					>
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-white">Operational activity</h2>
							<button className="text-xs font-semibold text-indigo-200 transition hover:text-indigo-100">Filter</button>
						</div>
						<div className="mt-6 space-y-4">
							{activityLog.map((item) => (
								<div key={item.time} className="flex flex-col gap-1 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
									<div className="flex items-center gap-4">
										<div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-slate-300">
											{item.time}
										</div>
										<div>
											<p className="text-sm font-semibold text-white">{item.actor}</p>
											<p className="text-xs text-slate-400">{item.action}</p>
										</div>
									</div>
									<p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-200">{item.impact}</p>
								</div>
							))}
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.2 }}
						className="rounded-3xl border border-white/10 bg-slate-900/70 p-6"
					>
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-white">System status</h2>
							<button className="text-xs font-semibold text-indigo-200 transition hover:text-indigo-100">Refresh</button>
						</div>
						<ul className="mt-6 space-y-4 text-sm text-slate-300">
							<li className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
								<span className="font-medium">API latency</span>
								<span className="text-emerald-300">186 ms</span>
							</li>
							<li className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
								<span className="font-medium">Infrastructure load</span>
								<span className="text-amber-300">63%</span>
							</li>
							<li className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
								<span className="font-medium">AI inference success</span>
								<span className="text-emerald-300">99.1%</span>
							</li>
							<li className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
								<span className="font-medium">Critical alerts</span>
								<span className="text-indigo-200">0</span>
							</li>
						</ul>
					</motion.div>
				</section>

				<section>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.25 }}
						className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/15 via-slate-900 to-transparent p-8"
					>
						<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
							<div>
								<h2 className="text-2xl font-semibold text-white">CoreIQ AI roadmap</h2>
								<p className="mt-2 max-w-2xl text-sm text-slate-300">
									Track experimentation, new coaching models, and platform rollouts. Share updates with the broader team straight from this space.
								</p>
							</div>
							<button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-indigo-100 transition hover:bg-white/10">
								<Command size={16} /> Open workspace
							</button>
						</div>
					</motion.div>
				</section>
			</>
		),
		[quickActions]
	)

	const workoutsSection = (
		<section className="space-y-8">
			<div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
				<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
					<div>
						<h2 className="text-lg font-semibold text-white">Create a new workout</h2>
						<p className="text-sm text-slate-400">Publish strength, cardio, or recovery workouts directly to the library.</p>
					</div>
				</div>

				<div className="mt-6 grid gap-4 md:grid-cols-2">
					<label className="space-y-2 text-sm">
						<span className="text-slate-300">Name*</span>
						<input
							value={workoutForm.name}
							onChange={(event) => setWorkoutForm((prev) => ({ ...prev, name: event.target.value }))}
							placeholder="Power Flow Session"
							className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
						/>
					</label>
					<label className="space-y-2 text-sm">
						<span className="text-slate-300">Category*</span>
						<select
							value={workoutForm.category}
							onChange={(event) => setWorkoutForm((prev) => ({ ...prev, category: event.target.value }))}
							className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
						>
							{workoutCategories.map((category) => (
								<option key={category} value={category}>
									{category}
								</option>
							))}
						</select>
					</label>
					<label className="space-y-2 text-sm md:col-span-2">
						<span className="text-slate-300">Description*</span>
						<textarea
							value={workoutForm.description}
							onChange={(event) => setWorkoutForm((prev) => ({ ...prev, description: event.target.value }))}
							placeholder="Outline the focus, intensity, and key movements for this workout."
							rows={3}
							className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
						/>
					</label>
					<label className="space-y-2 text-sm">
						<span className="text-slate-300">Primary muscle group*</span>
						<select
							value={workoutForm.muscle_group}
							onChange={(event) => setWorkoutForm((prev) => ({ ...prev, muscle_group: event.target.value }))}
							className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
						>
							{muscleGroups.map((group) => (
								<option key={group} value={group}>
									{group}
								</option>
							))}
						</select>
					</label>
					<label className="space-y-2 text-sm">
						<span className="text-slate-300">Equipment</span>
						<input
							value={workoutForm.equipment}
							onChange={(event) => setWorkoutForm((prev) => ({ ...prev, equipment: event.target.value }))}
							placeholder="Optional: dumbbells, bands, etc."
							className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
						/>
					</label>
				</div>

				<div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-2 text-xs text-slate-400">
						<Sparkles size={14} className="text-indigo-300" />
						<span>New workouts sync instantly with CoreIQ athletes once approved.</span>
					</div>
					<button
						onClick={handleWorkoutCreate}
						className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:-translate-y-0.5 hover:shadow-indigo-900/50"
					>
						<Plus size={16} /> Publish workout
					</button>
				</div>

				{workoutMessage && <p className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{workoutMessage}</p>}
				{workoutError && <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{workoutError}</p>}
			</div>

			<div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<h2 className="text-lg font-semibold text-white">Workout library</h2>
					<div className="relative w-full max-w-sm">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
						<input
							value={workoutSearch}
							onChange={(event) => setWorkoutSearch(event.target.value)}
							placeholder="Search workouts"
							onKeyDown={(event) => {
								if (event.key === 'Enter') fetchWorkouts(workoutSearch)
							}}
							className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-900/70 pl-10 pr-4 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
						/>
					</div>
				</div>
				<button
					onClick={() => fetchWorkouts(workoutSearch)}
					className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-indigo-100 transition hover:bg-white/10"
				>
					{workoutLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Refresh results
				</button>

				<div className="mt-6 space-y-3">
					{workoutResults.map((workout) => (
						<div key={workout._id} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
							<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h3 className="text-sm font-semibold text-white">{workout.name}</h3>
									<p className="text-xs text-slate-400">{workout.description}</p>
								</div>
								<div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-indigo-200">
									<span>{workout.category}</span>
									<span>{workout.muscle_group}</span>
									{workout.equipment && <span>{workout.equipment}</span>}
									{isRecent(workout.createdAt) && <span className="text-emerald-300">NEW</span>}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)

	const mealsSection = (
		<section className="space-y-8">
			<div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div className="space-y-2">
						<h2 className="text-lg font-semibold text-white">Create a new meal</h2>
						<p className="max-w-xl text-sm text-slate-400">
							Guide athletes with precise macros. Categories match the food library (drinks, fast foods, fruits, grains & carbs, proteins, salads, vegetables).
						</p>
					</div>
					<div className="flex flex-col items-start gap-2 text-xs text-slate-400">
						<span className="font-semibold uppercase tracking-[0.25em] text-slate-300">Available categories</span>
						<div className="flex flex-wrap gap-2">
							{mealCategories.map((name) => (
								<span key={`category-chip-${name}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-indigo-100">
									{formatMealCategory(name)}
								</span>
							))}
						</div>
						<button
							onClick={() => refreshMetadata()}
							disabled={metaLoading}
							className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-200 transition hover:text-indigo-100 disabled:opacity-60"
						>
							{metaLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />} Refresh list
						</button>
					</div>
				</div>

				<div className="mt-6 grid gap-4 md:grid-cols-2">
					<label className="space-y-2 text-sm">
						<span className="text-slate-300">Meal category*</span>
						<select
							value={mealForm.category}
							onChange={(event) => setMealForm((prev: MealFormState) => ({ ...prev, category: event.target.value }))}
							className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
						>
							{mealCategories.map((category) => (
								<option key={category} value={category}>
									{formatMealCategory(category)}
								</option>
							))}
						</select>
					</label>
					<label className="space-y-2 text-sm">
						<span className="text-slate-300">Name*</span>
						<input
							value={mealForm.name}
							onChange={(event) => setMealForm((prev: MealFormState) => ({ ...prev, name: event.target.value }))}
							placeholder="Antioxidant berry smoothie"
							className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
						/>
					</label>
					<label className="md:col-span-2 space-y-2 text-sm">
						<span className="text-slate-300">Description*</span>
						<textarea
							value={mealForm.description}
							onChange={(event) => setMealForm((prev: MealFormState) => ({ ...prev, description: event.target.value }))}
							placeholder="Describe the ingredients, purpose, and flavour profile."
							rows={3}
							className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
						/>
					</label>
				</div>

				<div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
					<p className="text-sm font-semibold text-white">Nutrients per 100g (required)</p>
					<p className="text-xs text-slate-400">These values will power macros across personalised plans.</p>
					<div className="mt-4 grid gap-3 md:grid-cols-4">
						{[
							{ field: 'calories', label: 'Calories (kcal)' },
							{ field: 'protein', label: 'Protein (g)' },
							{ field: 'carbs', label: 'Carbohydrates (g)' },
							{ field: 'fat', label: 'Fat (g)' },
						].map(({ field, label }) => (
							<label key={field} className="space-y-2 text-sm">
								<span className="text-slate-300">{label}</span>
								<input
									value={mealForm[field as keyof MealFormState]}
									onChange={(event) => setMealForm((prev: MealFormState) => ({ ...prev, [field]: event.target.value }))}
									type="number"
									min="0"
									placeholder="0"
									className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
								/>
							</label>
						))}
					</div>
				</div>

				<div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-sm font-semibold text-white">Servings & ready-to-use sizes</p>
							<p className="text-xs text-slate-400">Add optional serving shortcuts (e.g. "1 cup" or "1 bottle").</p>
						</div>
						<button
							onClick={() => addServingRow()}
							className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-indigo-200 transition hover:bg-white/20"
						>
							<Plus size={14} /> Add serving
						</button>
					</div>

					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-white/10 text-xs text-slate-100">
							<thead>
								<tr className="text-left">
									<th className="px-2 py-2 font-semibold">Serving size</th>
									<th className="px-2 py-2 font-semibold">Calories</th>
									<th className="px-2 py-2 font-semibold">Protein (g)</th>
									<th className="px-2 py-2 font-semibold">Carbs (g)</th>
									<th className="px-2 py-2 font-semibold">Fat (g)</th>
									<th className="px-2 py-2 font-semibold">Grams</th>
									<th className="px-2 py-2 font-semibold">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-white/10">
								{servings.map((serving, index) => (
									<tr key={`serving-${index}`}>
										{(['size', 'calories', 'protein', 'carbs', 'fat', 'grams'] as Array<keyof MealServingDraft>).map((field) => (
											<td key={field} className="px-2 py-2">
												<input
													value={serving[field]}
													onChange={(event) => updateServing(index, field, event.target.value)}
													placeholder={field === 'size' ? 'e.g. 1 cup' : '0'}
													type={field === 'size' ? 'text' : 'number'}
													min={field === 'size' ? undefined : '0'}
													className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 text-xs text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
												/>
											</td>
										))}
										<td className="px-2 py-2">
											{servings.length > 1 && (
												<button onClick={() => removeServing(index)} className="text-xs font-semibold text-red-300 hover:text-red-200">
													Remove
												</button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				<div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-2 text-xs text-slate-400">
						<AlertCircle size={14} className="text-indigo-300" />
						<span>Ensure per-100g macros match the category (e.g. grains vs proteins). Servings are optional shortcuts.</span>
					</div>
					<button
						onClick={() => handleMealCreate()}
						className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:-translate-y-0.5 hover:shadow-indigo-900/50"
					>
						<Plus size={16} /> Publish meal
					</button>
				</div>

				{mealMessage && <p className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{mealMessage}</p>}
				{mealError && <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{mealError}</p>}
			</div>

			<div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<h2 className="text-lg font-semibold text-white">Meals & nutrition catalog</h2>
					<div className="relative w-full max-w-sm">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
						<input
							value={mealSearch}
							onChange={(event) => setMealSearch(event.target.value)}
							placeholder="Search meals"
							onKeyDown={(event) => {
								if (event.key === 'Enter') fetchMeals(mealSearch)
							}}
							className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-900/70 pl-10 pr-4 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
						/>
					</div>
				</div>
				<button
					onClick={() => fetchMeals(mealSearch)}
					disabled={mealLoading}
					className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-indigo-100 transition hover:bg-white/10 disabled:opacity-60"
				>
					{mealLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Refresh results
				</button>

				<div className="mt-6 space-y-3">
					{mealResults.map((meal) => (
						<div key={meal._id} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
							<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h3 className="text-sm font-semibold text-white">{meal.name}</h3>
									<p className="text-xs text-slate-400">{meal.description}</p>
								</div>
								<div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-indigo-200">
									<span>{formatMealCategory(meal.category)}</span>
									<span>{meal.nutrients.protein}g protein</span>
									<span>{meal.nutrients.carbs}g carbs</span>
									<span>{meal.nutrients.fat}g fat</span>
									<span>{meal.nutrients.calories} kcal</span>
									{isRecent(meal.createdAt) && <span className="text-emerald-300">NEW</span>}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)

	const usersSection = (
		<section className="space-y-8">
			<div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
				<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
					<div>
						<h2 className="text-lg font-semibold text-white">Community insights</h2>
						<p className="text-sm text-slate-400">Monitor new registrations and keep a pulse on athlete growth.</p>
					</div>
					<div className="text-right">
						<p className="text-xs uppercase tracking-[0.25em] text-slate-400">Total users</p>
						<p className="text-3xl font-semibold text-white">{totalUsers.toLocaleString()}</p>
						<p className="text-xs font-semibold text-emerald-300">
							{userNotificationCount > 0 ? `+${userNotificationCount} new since last check` : 'Up to date'}
						</p>
					</div>
				</div>

				<div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="relative w-full max-w-sm">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
						<input
							value={userSearch}
							onChange={(event) => setUserSearch(event.target.value)}
							placeholder="Search by name, username, or email"
							onKeyDown={(event) => {
								if (event.key === 'Enter') fetchUsers(userSearch)
							}}
							className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-900/70 pl-10 pr-4 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40"
						/>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => fetchUsers(userSearch)}
							className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-indigo-100 transition hover:bg-white/10"
						>
							{userLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Refresh
						</button>
						<button
							onClick={() => {
								setUserSearch('')
								fetchUsers('')
							}}
							className="text-xs font-semibold text-slate-400 hover:text-indigo-200"
						>
							Clear
						</button>
					</div>
				</div>

				{userError && <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{userError}</p>}

				<div className="mt-6 space-y-3">
					{users.map((user) => (
						<div key={user._id} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
							<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<p className="text-sm font-semibold text-white">{user.fullName ?? user.username ?? 'Unnamed user'}</p>
									<p className="text-xs text-slate-400">{user.email ?? 'No email'}</p>
								</div>
								<div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-indigo-200">
									{user.username && <span>@{user.username}</span>}
									{user.gender && <span>{user.gender}</span>}
									{user.createdAt && <span>{new Date(user.createdAt).toLocaleDateString()}</span>}
									{isRecent(user.createdAt, 12) && <span className="text-emerald-300">NEW</span>}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/15 via-slate-900 to-transparent p-8"
			>
				<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
					<div>
						<h2 className="text-2xl font-semibold text-white">Communication & outreach</h2>
						<p className="mt-2 max-w-2xl text-sm text-slate-300">
							Keep new members engaged with onboarding emails, highlight pro features, and monitor retention cohorts.
						</p>
					</div>
					<button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-indigo-100 transition hover:bg-white/10">
						<Bell size={16} /> Open retention workspace
					</button>
				</div>
			</motion.div>
		</section>
	)

	const systemSection = (
		<section className="space-y-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="rounded-3xl border border-white/10 bg-slate-900/70 p-6"
			>
				<h2 className="text-lg font-semibold text-white">Platform status</h2>
				<p className="mt-2 text-sm text-slate-400">Monitor infrastructure statistics and upcoming maintenance windows.</p>

				<ul className="mt-6 space-y-4 text-sm text-slate-300">
					<li className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
						<span className="font-medium">Realtime analytics</span>
						<span className="text-emerald-300">Operational</span>
					</li>
					<li className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
						<span className="font-medium">Background processing</span>
						<span className="text-emerald-300">Operational</span>
					</li>
					<li className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
						<span className="font-medium">Scheduled maintenance</span>
						<span className="text-amber-300">Sunday 02:00 UTC</span>
					</li>
					<li className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
						<span className="font-medium">Incident response window</span>
						<span className="text-indigo-200">Under 15 minutes</span>
					</li>
				</ul>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.05 }}
				className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/15 via-slate-900 to-transparent p-8"
			>
				<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
					<div>
						<h2 className="text-2xl font-semibold text-white">Developer & compliance workspace</h2>
						<p className="mt-2 max-w-2xl text-sm text-slate-300">
							Integrate observability tooling, update runbooks, and align with security policies across teams.
						</p>
					</div>
					<button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-indigo-100 transition hover:bg-white/10">
						<Settings size={16} /> Manage integrations
					</button>
				</div>
			</motion.div>
		</section>
	)

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100">
			<div className="absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.24),_transparent_60%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_60%)]" />
			</div>

			<header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
							<ShieldCheck className="h-5 w-5 text-indigo-300" />
						</div>
						<div>
							<p className="text-xs uppercase tracking-[0.32em] text-indigo-200">CoreIQ</p>
							<h1 className="text-lg font-semibold text-white">Admin control centre</h1>
						</div>
					</div>
					<div className="flex items-center gap-3 text-xs">
						<nav className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-1 py-1 text-slate-300 md:flex">
							{(
								[
									{ id: 'overview', label: 'Overview' },
									{ id: 'workouts', label: 'Workouts' },
									{ id: 'meals', label: 'Meals' },
									{ id: 'users', label: 'Users' },
									{ id: 'system', label: 'System' },
								] as Array<{ id: Tab; label: string }>
							).map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`relative rounded-xl px-3 py-1.5 text-xs font-semibold transition ${activeTab === tab.id ? 'bg-indigo-500/20 text-indigo-100' : 'text-slate-300 hover:text-indigo-200'}`}
								>
									{tab.label}
									{tab.id === 'users' && userNotificationCount > 0 && activeTab !== 'users' ? (
										<span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-400 text-[8px] font-bold text-slate-900">
											•
										</span>
									) : null}
								</button>
							))}
						</nav>
						<Link
							to="/"
							className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-indigo-100 transition hover:bg-white/10"
						>
							<LogOut size={16} /> Exit to marketing
						</Link>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-6 py-12 space-y-10">
				{activeTab === 'overview' && overviewSection}
				{activeTab === 'workouts' && workoutsSection}
				{activeTab === 'meals' && mealsSection}
				{activeTab === 'users' && usersSection}
				{activeTab === 'system' && systemSection}
			</main>
		</div>
	)
}
