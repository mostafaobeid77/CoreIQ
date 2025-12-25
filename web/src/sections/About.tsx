import { motion } from 'framer-motion'
import { Target, TrendingUp, BarChart3 } from 'lucide-react'

const steps = [
	{
		title: 'Set Your Goals',
		description: 'Define your target weight and choose to lose, maintain, or gain.',
		icon: Target,
		color: '#8b5cf6',
	},
	{
		title: 'Track Daily',
		description: 'Log workouts, meals, water, sleep, and mood in seconds.',
		icon: BarChart3,
		color: '#10b981',
	},
	{
		title: 'See Progress',
		description: 'Get weekly reports with clear verdicts on your journey.',
		icon: TrendingUp,
		color: '#f59e0b',
	},
]

const stats = [
	{ value: '500+', label: 'Exercises', color: '#8b5cf6' },
	{ value: '1500+', label: 'Foods', color: '#10b981' },
	{ value: '14-90', label: 'Day Plans', color: '#f59e0b' },
]

export function About() {
	return (
		<section id="about" className="relative py-24 overflow-hidden" style={{ background: '#050505' }}>
			{/* Decorative elements */}
			<div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(to right, transparent, #8b5cf620, transparent)' }} />
			<motion.div
				className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none"
				style={{ background: '#8b5cf6' }}
				animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
				transition={{ duration: 10, repeat: Infinity }}
			/>

			<div className="relative mx-auto max-w-6xl px-6">
				{/* Header */}
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
						How It Works
					</motion.p>
					<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
						Simple steps to{' '}
						<span style={{ color: '#a78bfa' }}>transform your health</span>
					</h2>
				</motion.div>

				{/* Steps */}
				<div className="grid gap-8 md:grid-cols-3 mb-20">
					{steps.map(({ title, description, icon: Icon, color }, index) => (
						<motion.div
							key={title}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.15 }}
							className="relative group"
						>
							{/* Connection line */}
							{index < steps.length - 1 && (
								<div className="hidden md:block absolute top-8 left-full w-full h-px" style={{ background: 'linear-gradient(to right, #333333, transparent)' }} />
							)}

							<motion.div
								whileHover={{ y: -5 }}
								className="relative rounded-3xl p-6"
								style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}
							>


								<motion.div
									className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
									style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
									whileHover={{ scale: 1.1, rotate: 5 }}
								>
									<Icon size={26} style={{ color }} />
								</motion.div>

								<h3 className="text-lg font-bold text-white mb-2">{title}</h3>
								<p className="text-sm" style={{ color: '#888888' }}>{description}</p>
							</motion.div>
						</motion.div>
					))}
				</div>

				{/* Stats */}
				<motion.div
					className="rounded-3xl p-8 md:p-12"
					style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a' }}
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
				>
					<div className="grid grid-cols-3 gap-8">
						{stats.map(({ value, label, color }, i) => (
							<motion.div
								key={i}
								className="text-center"
								initial={{ scale: 0.8, opacity: 0 }}
								whileInView={{ scale: 1, opacity: 1 }}
								viewport={{ once: true }}
								transition={{ delay: i * 0.1 }}
								whileHover={{ scale: 1.05 }}
							>
								<motion.p
									className="text-3xl md:text-4xl font-black mb-1"
									style={{ color }}
								>
									{value}
								</motion.p>
								<p className="text-sm font-medium" style={{ color: '#666666' }}>{label}</p>
							</motion.div>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	)
}
