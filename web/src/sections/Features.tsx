import { Section } from '../components/ui/Section'
import { FeatureCard } from '../components/ui/FeatureCard'
import { Badge } from '../components/ui/Badge'
import { Activity, Calendar, BrainCircuit, Moon, Droplets, Dumbbell, Zap } from 'lucide-react'

const features = [
	{
		title: 'Workout Tracking',
		description: 'Log exercises with precision. Track sets, reps, and RPE with an interface designed for speed.',
		icon: Dumbbell,
	},
	{
		title: 'Smart Nutrition',
		description: 'AI-driven meal planning that adapts to your macros and caloric needs automatically.',
		icon: Activity,
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
		<Section id="features" className="bg-gradient-to-b from-transparent to-black/20">
			<div className="flex flex-col items-center text-center mb-16 space-y-4">
				<Badge icon={Zap}>Powerful Tools</Badge>
				<h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
					Everything you need to <span className="text-violet-400">excel.</span>
				</h2>
				<p className="text-slate-400 max-w-2xl text-lg">
					CoreIQ isn't just a tracker. It's a complete operating system for your body,
					built to handle every aspect of your fitness journey.
				</p>
			</div>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{features.map((feature, i) => (
					<FeatureCard
						key={i}
						{...feature}
						delay={i * 0.1}
					/>
				))}
			</div>
		</Section>
	)
}
