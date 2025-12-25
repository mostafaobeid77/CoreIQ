import { motion } from 'framer-motion'
import { Activity, Calendar, BrainCircuit, Moon, Droplets, Dumbbell } from 'lucide-react'

const features = [
	{
		title: 'Workout Tracking',
		description: 'Log your exercises with sets, reps, and weights. Track progress over time.',
		icon: Dumbbell,
		color: '#8b5cf6',
		gradient: 'from-violet-500/20 to-purple-500/5',
	},
	{
		title: 'Meal Planning',
		description: 'Track calories and macros for every meal. Build plans that fit your goals.',
		icon: Activity,
		color: '#10b981',
		gradient: 'from-emerald-500/20 to-green-500/5',
	},
	{
		title: 'Smart Plans',
		description: 'Generate personalized workout and meal plans for 14-90 days.',
		icon: Calendar,
		color: '#f59e0b',
		gradient: 'from-amber-500/20 to-yellow-500/5',
	},
	{
		title: 'Sleep Tracking',
		description: 'Log your sleep hours and understand how rest affects performance.',
		icon: Moon,
		color: '#6366f1',
		gradient: 'from-indigo-500/20 to-blue-500/5',
	},
	{
		title: 'Hydration',
		description: 'Track daily water intake with quick-add buttons.',
		icon: Droplets,
		color: '#3b82f6',
		gradient: 'from-blue-500/20 to-cyan-500/5',
	},
	{
		title: 'Progress Analysis',
		description: 'Weekly reports show your calorie balance and weight trends.',
		icon: BrainCircuit,
		color: '#ec4899',
		gradient: 'from-pink-500/20 to-rose-500/5',
	},
]

export function Features() {
	return (
		<section id="features" className="relative overflow-hidden py-24" style={{ background: '#000000' }}>
			{/* Animated accent */}
			<motion.div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-20 pointer-events-none"
				style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 60%)' }}
				animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
				transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
			/>

			<div className="relative mx-auto max-w-6xl px-6">
				<motion.div
					className="text-center max-w-2xl mx-auto mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
				>
					<motion.p
						className="text-sm font-semibold uppercase tracking-[0.3em] mb-4"
						style={{ color: '#8b5cf6' }}
					>
						Features
					</motion.p>
					<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
						Everything you need to{' '}
						<span style={{ color: '#a78bfa' }}>crush your goals</span>
					</h2>
					<p className="mt-5 text-base" style={{ color: '#888888' }}>
						Simple, powerful tools to track your fitness journey
					</p>
				</motion.div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{features.map(({ title, description, icon: Icon, color, gradient }, index) => (
						<motion.div
							key={title}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.2 }}
							transition={{ delay: index * 0.1, duration: 0.5 }}
							whileHover={{ y: -8, transition: { duration: 0.2 } }}
							className="group relative overflow-hidden rounded-3xl p-6"
							style={{
								backgroundColor: '#0a0a0a',
								border: '1px solid #222222',
							}}
						>
							{/* Hover gradient effect */}
							<motion.div
								className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
							/>

							{/* Glow on hover */}
							<motion.div
								className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"
								style={{ backgroundColor: color }}
							/>

							<div className="relative flex flex-col gap-4">
								{/* Icon */}
								<motion.div
									className="inline-flex h-14 w-14 items-center justify-center rounded-2xl"
									style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
									whileHover={{ scale: 1.1, rotate: 5 }}
									transition={{ type: 'spring', stiffness: 400 }}
								>
									<Icon size={26} style={{ color }} strokeWidth={1.8} />
								</motion.div>

								{/* Content */}
								<div>
									<h3 className="text-lg font-bold text-white mb-2">{title}</h3>
									<p className="text-sm leading-relaxed" style={{ color: '#888888' }}>
										{description}
									</p>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}
