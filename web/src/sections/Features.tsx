import { SceneSection } from '../components/SceneSection'
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
export function Features() {
	return (
		<SceneSection id="features">
			<div className="flex flex-col items-center text-center mb-16 space-y-4">
				<Badge icon={Brain}>Intelligence Layer</Badge>
				<h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
					Not just tracking. <br />
					<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
						Coaching.
					</span>
				</h2>
				<p className="text-slate-400 text-lg max-w-2xl text-balance">
					Most apps are glorified spreadsheets. CoreIQ analyzes your data to tell you what to do next.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
				{/* Hero Feature: Live Macro Tracking */}
				<div className="md:col-span-2 md:row-span-2 relative group">
					<GlassCard className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-violet-900/20 to-transparent p-0" intensity="high">
						<div className="absolute inset-0 bg-noise opacity-30 pointer-events-none mix-blend-overlay" />
						<div className="absolute top-6 left-6 z-10">
							<h3 className="text-xl font-bold text-white">Live Macro Tracking</h3>
							<p className="text-slate-400 text-sm">Real-time visualizations of your daily targets.</p>
						</div>
						<div className="scale-90 md:scale-100 transition-transform duration-500 group-hover:scale-105">
							<MacroWidget />
						</div>
					</GlassCard>
				</div>

				{features.map((feature, i) => (
					<FeatureCard
						key={i}
						{...feature}
						delay={i * 0.1}
						className={i === 0 || i === 3 ? "md:col-span-1" : ""}
					/>
				))}
			</div>
		</SceneSection>
	)
}
