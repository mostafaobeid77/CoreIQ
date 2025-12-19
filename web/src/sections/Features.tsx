import { motion } from 'framer-motion'
import { Activity, Bolt, BrainCircuit, HeartPulse, MoonStar, Dumbbell } from 'lucide-react'
import { fadeUp, staggerChildren, scaleIn } from '../lib/motion'

const features = [
	{
		title: 'AI Coach',
		description: 'Real-time coaching cues, tempo adjustments, and progressive overload tailored to your training age.',
		icon: BrainCircuit,
		color: 'from-indigo-500 to-purple-500',
	},
	{
		title: 'Progress Tracker',
		description: 'Granular analytics across strength, endurance, body composition, and energy so you can optimise every phase.',
		icon: Activity,
		color: 'from-cyan-400 to-sky-500',
	},
	{
		title: '14-Day Smart Plans',
		description: 'Instantly generate cycles tuned to your goals with automatic recalibration as your stats evolve.',
		icon: Bolt,
		color: 'from-emerald-400 to-teal-500',
	},
	{
		title: 'Mood & Sleep Insights',
		description: 'Sync wearable data and daily check-ins to adapt recovery, nutrition, and intensity recommendations.',
		icon: MoonStar,
		color: 'from-fuchsia-400 to-indigo-500',
	},
	{
		title: 'Metabolic Fueling',
		description: 'Precision macro plans and hydration prompts guided by your output, schedule, and recovery demands.',
		icon: HeartPulse,
		color: 'from-rose-400 to-amber-400',
	},
	{
		title: 'Workout Library',
		description: 'Access hundreds of exercises with video guides, form tips, and variations for all fitness levels.',
		icon: Dumbbell,
		color: 'from-orange-400 to-red-500',
	},
]

export function Features() {
	return (
		<section id="features" className="relative overflow-hidden bg-slate-950 py-24">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),_transparent_60%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(20,184,166,0.15),_transparent_60%)]" />

			<div className="relative mx-auto max-w-6xl px-6">
				<div className="max-w-2xl">
					<motion.p
						variants={fadeUp}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true }}
						className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-300"
					>
						Everything you need
					</motion.p>
					<motion.h2
						variants={fadeUp}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, amount: 0.4 }}
						className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
					>
						An intelligent ecosystem that keeps training, nutrition, and recovery in sync
					</motion.h2>
					<motion.p
						variants={fadeUp}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, amount: 0.4 }}
						className="mt-5 max-w-xl text-base text-slate-300"
					>
						Designed for athletes and everyday movers who expect more from their data. CoreIQ translates signals
						into guidance that feels personal, actionable, and sustainable.
					</motion.p>
				</div>

				<motion.div
					variants={staggerChildren(0.12, 0.1)}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.3 }}
					className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
				>
					{features.map(({ title, description, icon: Icon, color }) => (
						<motion.div
							key={title}
							variants={scaleIn}
							className="group relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-lg shadow-indigo-900/30 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/60 hover:shadow-indigo-900/50"
						>
							<div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
								<div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20`} />
							</div>
							<div className="relative flex flex-col gap-5">
								<span
									className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg shadow-indigo-900/40`}
								>
									<Icon size={22} strokeWidth={1.6} />
								</span>
								<div>
									<h3 className="text-lg font-semibold text-white">{title}</h3>
									<p className="mt-3 text-sm text-slate-300">{description}</p>
								</div>
								<div className="mt-auto flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-300">
									Learn more
									<span aria-hidden="true">→</span>
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	)
}


