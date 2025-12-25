import { Section } from '../components/ui/Section'
import { Badge } from '../components/ui/Badge'
import { motion } from 'framer-motion'
import { Target, BarChart3, TrendingUp, Settings2 } from 'lucide-react'

const steps = [
	{
		step: '01',
		title: 'Define Your Goals',
		description: 'Tell CoreIQ your target weight and training preferences. We build the roadmap.',
		icon: Target,
	},
	{
		step: '02',
		title: 'Track Effortlessly',
		description: 'Log your daily activity, meals, and metrics in seconds, not minutes.',
		icon: BarChart3,
	},
	{
		step: '03',
		title: 'Analyze & Evolve',
		description: 'Review weekly reports and let our AI adjust your plan for continuous progress.',
		icon: TrendingUp,
	},
]

export function HowItWorks() {
	return (
		<Section id="how-it-works" className="relative">
			<div className="absolute inset-0 bg-grid-mask pointer-events-none -z-10 opacity-30" />

			<div className="flex flex-col items-center text-center mb-20 space-y-4">
				<Badge icon={Settings2}>Workflow</Badge>
				<h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
					From plan to <span className="text-violet-400">performance.</span>
				</h2>
			</div>

			<div className="grid md:grid-cols-3 gap-8 relative">
				{/* Connecting Line (Desktop) */}
				<div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent -z-10" />

				{steps.map((item, i) => (
					<motion.div
						key={i}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: i * 0.2 }}
						className="flex flex-col items-center text-center group"
					>
						<div className="relative mb-6">
							<div className="w-20 h-20 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center relative z-10 group-hover:border-violet-500/50 transition-colors duration-300">
								<item.icon className="w-8 h-8 text-violet-400" />
							</div>
							{/* Blur glow behind icon */}
							<div className="absolute inset-0 bg-violet-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						</div>

						<h3 className="text-xl font-bold text-white mb-3">
							<span className="text-violet-500/50 mr-2 font-mono text-sm">{item.step}</span>
							{item.title}
						</h3>
						<p className="text-slate-400 text-sm leading-relaxed max-w-xs">{item.description}</p>
					</motion.div>
				))}
			</div>
		</Section>
	)
}
