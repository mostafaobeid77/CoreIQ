import { motion } from 'framer-motion'
import { DownloadBadges } from '../components/DownloadBadges'
import { PhoneMockup } from '../components/PhoneMockup'
import { fadeUp, staggerChildren } from '../lib/motion'

export function Hero() {
	return (
		<section
			id="home"
			className="relative overflow-hidden bg-slate-950 pb-28 pt-32 text-white md:pb-36 md:pt-36"
		>
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.25),_transparent_55%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.2),_transparent_55%)]" />
				<div className="absolute inset-0 opacity-40 mix-blend-screen">
					<div className="bg-grid-mask absolute inset-0" />
				</div>
			</div>

			<div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:grid lg:grid-cols-[minmax(0,_1fr)_minmax(0,_420px)] lg:items-center">
				<motion.div
					variants={staggerChildren(0.15)}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.5 }}
					className="max-w-2xl space-y-7"
				>
					<motion.span
						variants={fadeUp}
						className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200"
					>
						AI Fitness · Nutrition · Recovery
					</motion.span>
					<motion.h1
						variants={fadeUp}
						className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
					>
						Your AI Fitness &amp; Nutrition Companion for effortless consistency
					</motion.h1>
					<motion.p
						variants={fadeUp}
						className="max-w-xl text-lg leading-relaxed text-slate-300"
					>
						CoreIQ builds personalised training and fuel plans in seconds, adapts to your mood and recovery,
						and keeps you motivated with smart insights that evolve with every rep and meal.
					</motion.p>
					<motion.ul
						variants={fadeUp}
						className="grid gap-3 text-sm font-medium text-slate-200 sm:grid-cols-2"
					>
						<li className="flex items-center gap-2">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-xs font-bold text-white">
								1
							</span>
							Adaptive workouts and macros tuned daily
						</li>
						<li className="flex items-center gap-2">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-xs font-bold text-white">
								2
							</span>
							Real-time coaching with actionable feedback
						</li>
						<li className="flex items-center gap-2">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-xs font-bold text-white">
								3
							</span>
							Track mood, sleep, hydration &amp; recovery
						</li>
						<li className="flex items-center gap-2">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-xs font-bold text-white">
								4
							</span>
							Securely syncs with wearables you already use
						</li>
					</motion.ul>
					<motion.div
						variants={fadeUp}
						className="flex flex-col gap-4 sm:flex-row sm:items-center"
					>
						<motion.span
							variants={fadeUp}
							className="text-base font-semibold text-indigo-200 mb-1 text-center sm:text-left"
						>
							Download CoreIQ for free:
						</motion.span>
						<DownloadBadges className="mx-auto sm:mx-0" />
					</motion.div>
				</motion.div>

				<PhoneMockup />
			</div>
		</section>
	)
}


