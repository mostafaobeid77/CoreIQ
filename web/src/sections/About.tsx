import { motion } from 'framer-motion'
import { Brain, LineChart, Sparkles } from 'lucide-react'
import { fadeUp, staggerChildren } from '../lib/motion'

const highlights = [
	{
		title: 'Precision AI planning',
		description:
			'Generate personalised training splits and nutrition using CoreIQ’s adaptive models trained on thousands of coaching hours.',
		icon: Brain,
	},
	{
		title: 'Continuous intelligence',
		description:
			'Every rep, meal, mood, and recovery log feeds your profile so plans evolve automatically around life and schedule shifts.',
		icon: LineChart,
	},
	{
		title: 'Holistic coaching',
		description:
			'Guided breathwork, mobility, and mental reset protocols help you recharge so consistency feels natural, not forced.',
		icon: Sparkles,
	},
]

export function About() {
	return (
		<section id="about" className="relative bg-slate-50 py-24 dark:bg-slate-950">
			<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
			<div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:grid lg:grid-cols-[minmax(0,_1.2fr)_minmax(0,_1fr)] lg:items-center">
				<motion.div
					variants={staggerChildren(0.15)}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.4 }}
					className="space-y-6"
				>
					<motion.h2
						variants={fadeUp}
						className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
					>
						Plans crafted by intelligence, built around how you actually live
					</motion.h2>
					<motion.p variants={fadeUp} className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
						CoreIQ combines metabolic modelling, recovery analytics, and behavioural science to design routines
						that absorb every fluctuation—whether you&apos;re travelling, shifting sleep schedules, or ramping up
						for competition.
					</motion.p>
					<motion.div variants={fadeUp} className="rounded-3xl border border-indigo-500/20 bg-white/80 p-6 backdrop-blur dark:border-indigo-400/30 dark:bg-slate-900/60">
						<p className="text-sm font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-300">
							Predict · Adapt · Sustain
						</p>
						<p className="mt-3 text-base text-slate-600 dark:text-slate-300">
							Powered by CoreIQ Synapse Engine™ — blending biometric, behavioural, and contextual signals to
							generate routines that stay aligned with your goals.
						</p>
					</motion.div>
				</motion.div>
				<motion.div
					variants={staggerChildren(0.12)}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.3 }}
					className="grid gap-5"
				>
					{highlights.map(({ title, description, icon: Icon }) => (
						<motion.div
							key={title}
							variants={fadeUp}
							className="group rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-lg shadow-indigo-500/5 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/60 hover:shadow-indigo-500/30 dark:border-slate-800/70 dark:bg-slate-900/80 dark:shadow-indigo-900/30"
						>
							<div className="flex items-start gap-4">
								<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/30">
									<Icon size={22} strokeWidth={1.6} />
								</span>
								<div>
									<h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
										{description}
									</p>
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	)
}

