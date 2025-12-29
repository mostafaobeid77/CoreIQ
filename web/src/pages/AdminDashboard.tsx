import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
	Activity,
	Users,
	Shield,
	LogOut,
	Menu,
	X,
	LayoutDashboard,
	Dumbbell,
	Utensils,
} from 'lucide-react'
import { useAdmin } from '../context/AdminContext'
import { adminApi } from '../api/adminApi'
import { NeuralNetworkBackground } from '../components/NeuralNetworkBackground'
import { WorkoutsManager } from '../components/admin/WorkoutsManager'
import { MealsManager } from '../components/admin/MealsManager'
import { UserDirectory } from '../components/admin/UserDirectory'
import { CommandCenter } from '../components/admin/CommandCenter'

type Tab = 'dashboard' | 'users' | 'workouts' | 'meals' | 'team'

export function AdminDashboardPage() {
	const navigate = useNavigate()
	const { admin, logout, isSuperadmin, isLoading } = useAdmin()
	const [activeTab, setActiveTab] = useState<Tab>('dashboard')
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	// useEffect(() => {
	//     if (!isLoading && !admin) {
	//         navigate('/admin/login')
	//     }
	// }, [isLoading, admin, navigate])

	if (isLoading) {
		return (
			<div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
				<Activity className="w-8 h-8 animate-pulse text-violet-500" />
			</div>
		)
	}

	const menuItems = [
		{ id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
		{ id: 'users', label: 'Athletes', icon: Users },
		{ id: 'workouts', label: 'Workouts', icon: Dumbbell },
		{ id: 'meals', label: 'Meals', icon: Utensils },
		...(isSuperadmin ? [{ id: 'team', label: 'Team', icon: Shield }] : []),
	]

	// Full Dashboard Home with Stats and Live Events
	const DashboardHome = () => {
		const [stats, setStats] = useState<any>(null);
		const [events, setEvents] = useState<any[]>([]);
		const [loading, setLoading] = useState(true);

		useEffect(() => {
			const loadData = async () => {
				try {
					const [statsData, eventsData] = await Promise.all([
						adminApi.getDashboardStats(),
						adminApi.getRecentEvents(30)
					]);
					setStats(statsData.stats);
					setEvents(eventsData.events);
				} catch (e) { console.error(e); }
				finally { setLoading(false); }
			};
			loadData();

			// Refresh every 30 seconds
			const interval = setInterval(loadData, 30000);
			return () => clearInterval(interval);
		}, []);

		if (loading) {
			return <div className="flex items-center justify-center h-40 text-slate-500">Loading dashboard...</div>;
		}

		const formatAction = (action: string) => {
			return action.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
		};

		const getActionColor = (action: string) => {
			if (action.includes('login') || action.includes('signup')) return 'text-emerald-400';
			if (action.includes('created') || action.includes('approved')) return 'text-blue-400';
			if (action.includes('rejected') || action.includes('deleted')) return 'text-red-400';
			return 'text-slate-400';
		};

		return (
			<div className="space-y-6">
				{/* Stats Grid */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard label="Total Athletes" value={stats?.totalUsers || 0} icon={Users} color="violet" />
					<StatCard label="Active Admins" value={stats?.activeAdmins || 0} icon={Shield} color="blue" />
					<StatCard label="Pending Approvals" value={stats?.pendingWorkouts || 0} icon={Activity} color="amber" highlight={stats?.pendingWorkouts > 0} />
					<StatCard label="Active Plans" value={stats?.activePlans || 0} icon={LayoutDashboard} color="emerald" />
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Secondary Stats */}
					<div className="bg-slate-900/50 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
						<h4 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Knowledge Base</h4>
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-slate-500">Total Workouts</span>
								<span className="text-white font-medium">{stats?.totalWorkouts || 0}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-500">Total Meals</span>
								<span className="text-white font-medium">{stats?.totalMeals || 0}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-500">Total Admins</span>
								<span className="text-white font-medium">{stats?.totalAdmins || 0}</span>
							</div>
						</div>
					</div>

					{/* Live Events Feed */}
					<div className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden">
						<div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
							<h4 className="text-sm font-medium text-white flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
								Live Activity
							</h4>
							<span className="text-xs text-slate-500 font-mono">Last 30 events</span>
						</div>
						<div className="max-h-64 overflow-y-auto divide-y divide-white/5">
							{events.length === 0 ? (
								<div className="p-6 text-center text-slate-500">No recent activity</div>
							) : (
								events.map((event) => (
									<div key={event._id} className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
										<span className="text-xs text-slate-600 font-mono w-16 shrink-0">
											{new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
										</span>
										<div className="flex-1 min-w-0">
											<span className={`text-sm font-medium ${getActionColor(event.action)}`}>
												{formatAction(event.action)}
											</span>
											{event.actorName && (
												<span className="text-slate-500 text-sm ml-2">by {event.actorName}</span>
											)}
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		);
	};

	const StatCard = ({ label, value, icon: Icon, color, highlight }: any) => {
		const colors: any = {
			violet: { bg: 'bg-violet-500/10', text: 'text-violet-400' },
			blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
			amber: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
			emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
		};
		const c = colors[color] || colors.violet;
		return (
			<div className={`bg-slate-900/50 border border-white/10 p-5 rounded-2xl backdrop-blur-sm ${highlight ? 'ring-1 ring-amber-500/30' : ''}`}>
				<div className="flex items-center gap-3">
					<div className={`p-2.5 rounded-xl ${c.bg}`}>
						<Icon className={`w-5 h-5 ${c.text}`} />
					</div>
					<div>
						<p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
						<h3 className="text-xl font-bold text-white flex items-center gap-2">
							{value}
							{highlight && <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
						</h3>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen w-full flex text-white font-sans relative overflow-hidden">
			<NeuralNetworkBackground />

			{/* Sidebar Navigation */}
			<aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a]/95 backdrop-blur-xl border-r border-white/5 
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:relative
            `}>
				<div className="p-8">
					<div className="flex items-center gap-3 mb-10">
						<div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
							<Shield className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-lg font-bold tracking-tight">CoreIQ<span className="text-violet-500">.Admin</span></h1>
						</div>
					</div>

					<nav className="space-y-1">
						{menuItems.map((item) => (
							<button
								key={item.id}
								onClick={() => {
									setActiveTab(item.id as Tab)
									setIsMobileMenuOpen(false)
								}}
								className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                    ${activeTab === item.id
										? 'bg-white/10 text-white font-medium'
										: 'text-slate-400 hover:text-white hover:bg-white/5'}
                                `}
							>
								<item.icon className="w-5 h-5 opacity-75" />
								<span className="text-sm">{item.label}</span>
							</button>
						))}
					</nav>
				</div>

				<div className="absolute bottom-0 w-full p-6 border-t border-white/5">
					<button
						// Placeholder for Settings - can be added to nav if needed
						className="flex items-center gap-3 mb-4 text-slate-400 hover:text-white transition-colors"
						onClick={() => navigate('/admin/profile')} // Assuming we'll make this route
					>
						<div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
							<span className="text-xs font-bold text-slate-300">
								{admin?.username?.charAt(0).toUpperCase()}
							</span>
						</div>
						<div className="text-xs text-left">
							<p className="text-white font-medium">{admin?.username}</p>
							<p className="text-slate-500">Edit Profile</p>
						</div>
					</button>

					<button
						onClick={logout}
						className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-xs font-medium uppercase tracking-wider"
					>
						<LogOut className="w-4 h-4" /> Sign Out
					</button>
				</div>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 h-screen overflow-y-auto relative z-10 bg-[#050505]/50">
				{/* Mobile Header */}
				<header className="lg:hidden flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-40">
					<div className="font-bold">CoreIQ Admin</div>
					<button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
						{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
					</button>
				</header>

				<div className="p-6 lg:p-10 max-w-7xl mx-auto">
					<header className="mb-8 flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold text-white mb-1">
								{menuItems.find(i => i.id === activeTab)?.label}
							</h2>
							<p className="text-slate-500 text-sm">Manage your application data and users.</p>
						</div>
					</header>

					<AnimatePresence mode='wait'>
						<motion.div
							key={activeTab}
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -5 }}
							transition={{ duration: 0.15 }}
						>
							{activeTab === 'dashboard' && <DashboardHome />}
							{activeTab === 'users' && <UserDirectory />}
							{activeTab === 'workouts' && <WorkoutsManager />}
							{activeTab === 'meals' && <MealsManager />}
							{activeTab === 'team' && isSuperadmin && <CommandCenter />}
						</motion.div>
					</AnimatePresence>
				</div>
			</main>
		</div>
	)
}
