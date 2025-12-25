import { Section } from '../components/ui/Section'
import { FeatureCard } from '../components/ui/FeatureCard'
import { Badge } from '../components/ui/Badge'
import { Activity, Calendar, BrainCircuit, Moon, Droplets, Dumbbell, Zap } from 'lucide-react'
import { MacroWidget } from '../components/MacroWidget'
import { GlassCard } from '../components/ui/GlassCard'

const features = [
	// Highlight Feature (Smart Nutrition) - Handled separately
	{
		title: 'Workout Tracking',
		description: 'Log exercises with precision. Track sets, reps, and RPE with an interface designed for speed.',
		icon: Dumbbell,
	},
	{
		title: 'Adaptive Plans',
		description: 'Generate 14-90 day training cycles that evolve based on your performance feedback.',
		icon: Calendar,
	},
	{
		title: 'Sleep & Recovery',
		description: 'Monitor sleep quality and correlate rest with your strength gains.',
		icon: Moon,
	},
	{
		title: 'Hydration Tracking',
		description: 'Quick-add water logging to ensure you stay hydrated for peak performance.',
		icon: Droplets,
	},
	{
		title: 'Deep Analytics',
		description: 'Visualize your progress with cinema-quality charts and weekly insights.',
		icon: BrainCircuit,
	},
]

export function Features() {
	return (
		<Section id="features" className="relative z-10">
			<div className="flex flex-col items-center text-center mb-16 space-y-4">
				<Badge icon={Zap}>Powerful Tools</Badge>
				<h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
					Everything you need to <span className="text-violet-400">excel.</span>
				</h2>
				<p className="text-slate-400 max-w-2xl text-lg text-balance">
					CoreIQ isn't just a tracker. It's a complete operating system for your body.
				</p>
			</div>

			<div className="grid md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
				{/* Signature Interaction: Live Macro Tracking */}
				<div className="md:col-span-2 md:row-span-2">
					<GlassCard
						className="h-full flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-violet-900/10 to-transparent"
						intensity="high"
					>
						<div className="absolute top-0 right-0 p-6 opacity-50">
							<Activity className="w-24 h-24 text-violet-500/20" />
						</div>
						<div className="relative z-10 w-full">
							<div className="mb-6 text-center md:text-left">
								<h3 className="text-2xl font-bold text-white mb-2">Smart Nutrition</h3>
								<p className="text-slate-400">Real-time macro adjustments based on your activity.</p>
							</div>
							<MacroWidget />
						</div>
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
		</Section>
	)
}
