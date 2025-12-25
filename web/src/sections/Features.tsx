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
		<SceneSection id="features" className="relative z-10" type="zoom">
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

			<div className="grid md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
				{/* Signature Interaction: Live Macro Tracking */}
				<div className="md:col-span-2 md:row-span-2">
					<GlassCard className="h-full flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-violet-900/10 to-transparent" intensity="high">
						<div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
						<MacroWidget />
					</GlassCard>
				</div>

				{features.map((feature, i) => (
					<FeatureCard
						key={i}
						{...feature}
						delay={i * 0.1 + 0.2}
						className="h-full"
					/>
				))}
			</div>
		</SceneSection>
	)
}
