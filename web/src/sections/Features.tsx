import { SceneSection } from '../components/SceneSection'
import { motion } from 'framer-motion'
import { Badge } from '../components/ui/Badge'
import { FeatureCard } from '../components/ui/FeatureCard'
import { MacroWidget } from '../components/MacroWidget'
import { GlassCard } from '../components/ui/GlassCard'
import { BarChart3, Calculator, Utensils, Zap, Brain, Target } from 'lucide-react'

const features = [
	{
		title: 'Smart Meal Plans',
		description: 'AI-generated nutrition plans that update weekly based on your metabolism.',
		icon: Utensils,
	},
	{
		title: 'Macro Precision',
		description: 'Track every gram. Our database verifies labels against USDA standards.',
		icon: Calculator,
	},
	{
		title: 'Workout Analytics',
		description: 'Visualize your progressive overload. See strength gains in real-time.',
		icon: BarChart3,
	},
	{
		title: 'Goal Automation',
		description: 'Set a target weight. We adjust your calories automatically as you progress.',
		icon: Target,
	},
	{
		title: 'Zero Latency',
		description: 'Optimized for speed. Log sets and meals instantly, even offline.',
		icon: Zap,
	},
]

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.1, delayChildren: 0.2 }
	}
}

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export function Features() {
	return (
		<SceneSection id="features">
			{/* Animated Header */}
			<motion.div
				className="flex flex-col items-center text-center mb-16 space-y-4"
				variants={containerVariants}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
			>
				<motion.div variants={itemVariants}>
					<Badge icon={Brain}>THE NEURAL ENGINE</Badge>
				</motion.div>
				<motion.h2
					variants={itemVariants}
					className="text-4xl md:text-7xl font-black tracking-tighter text-white mb-4 leading-none"
				>
					Not just tracking. <br />
					<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-emerald-400 to-fuchsia-400 animate-gradient">
						blueprint your future.
					</span>
				</motion.h2>
				<motion.p
					variants={itemVariants}
					className="text-slate-400 text-xl font-medium max-w-2xl text-balance"
				>
					Most apps are glorified spreadsheets. CoreIQ is a prediction engine that blueprints your evolution.
				</motion.p>
			</motion.div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
				{/* Hero Feature: Live Macro Tracking */}
				<motion.div
					className="md:col-span-2 md:row-span-2 relative group mt-8 md:mt-0"
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
					whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
				>
					<GlassCard className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-violet-600/10 via-transparent to-indigo-600/10 p-0 border-white/10" intensity="high">
						{/* Animated background grid */}
						<div className="absolute inset-0 bg-grid-white/[0.04] -z-10" />

						{/* Floating glow orb */}
						<motion.div
							className="absolute -top-20 -right-20 w-60 h-60 bg-violet-500/20 rounded-full blur-[80px] pointer-events-none"
							animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
							transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
						/>

						<div className="absolute top-6 left-6 z-10">
							<motion.h3
								initial={{ opacity: 0, x: -20 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.2 }}
								className="text-xl font-bold text-white tracking-tight"
							>
								Live Macro Intelligence
							</motion.h3>
							<motion.p
								initial={{ opacity: 0, x: -20 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.3 }}
								className="text-slate-400 text-sm"
							>
								Real-time visualizations of your bio-targets.
							</motion.p>
						</div>
						<div className="scale-90 md:scale-100 transition-transform duration-700 group-hover:scale-105 pt-16">
							<MacroWidget />
						</div>
					</GlassCard>
				</motion.div>

				{features.map((feature, i) => (
					<FeatureCard
						key={i}
						{...feature}
						delay={0.1 + i * 0.1}
						className={i === 0 || i === 3 ? "md:col-span-1" : ""}
					/>
				))}
			</div>
		</SceneSection>
	)
}
