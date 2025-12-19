import { motion } from 'framer-motion'
import { Mail, MessageCircle, Sparkles } from 'lucide-react'
import { fadeIn, fadeUp, staggerChildren } from '../lib/motion'

export function Contact() {
	return (
		<section id="contact" className="relative overflow-hidden bg-slate-950 py-24 text-white">
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.25),_transparent_65%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.2),_transparent_60%)]" />
			</div>
			<div className="relative mx-auto max-w-6xl px-6">
				<motion.div
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.4 }}
					variants={staggerChildren(0.15)}
					className="mx-auto max-w-3xl text-center"
				>
					<motion.span
						variants={fadeUp}
						className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200"
					>
						Stay in sync
					</motion.span>
					<motion.h2
						variants={fadeUp}
						className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl"
					>
						Learn how CoreIQ can elevate your training collective
					</motion.h2>
					<motion.p variants={fadeIn} className="mt-4 text-base text-slate-300">
						Chat with our team for partnerships, coaching collectives, and beta access. We respond within one business
						day.
					</motion.p>
				</motion.div>

				<motion.div
					variants={staggerChildren(0.12)}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.4 }}
					className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,_3fr)_minmax(0,_2fr)]"
				>
					<motion.form
						variants={fadeUp}
						className="group relative overflow-hidden rounded-[2.5rem] border border-indigo-500/20 bg-white/5 p-8 shadow-lg shadow-indigo-900/30 backdrop-blur"
					>
						<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),transparent_55%)]" />
						<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,_rgba(20,184,166,0.12),transparent_60%)]" />
						<div className="flex flex-col gap-6">
							<label className="text-left text-sm font-semibold tracking-wide text-indigo-100">
								Name
								<input
									type="text"
									name="name"
									placeholder="Your name"
									className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-0"
								/>
							</label>
							<label className="text-left text-sm font-semibold tracking-wide text-indigo-100">
								Email
								<input
									type="email"
									name="email"
									placeholder="you@coreiq.app"
									className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-0"
								/>
							</label>
							<label className="text-left text-sm font-semibold tracking-wide text-indigo-100">
								Message
								<textarea
									name="message"
									rows={4}
									placeholder="How can we help?"
									className="mt-2 resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-0"
								/>
							</label>
							<button
								type="submit"
								className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:-translate-y-1 hover:shadow-indigo-900/60"
							>
								Request access
							</button>
						</div>
					</motion.form>
					<motion.div
						variants={fadeUp}
						className="space-y-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-lg shadow-indigo-900/20 backdrop-blur"
					>
						<div className="flex items-start gap-4">
							<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-indigo-300 backdrop-blur">
								<Mail size={22} strokeWidth={1.6} />
							</span>
							<div>
								<h3 className="text-lg font-semibold">Email</h3>
								<p className="mt-1 text-sm text-slate-300">team@coreiq.app</p>
							</div>
						</div>
						<div className="flex items-start gap-4">
							<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-indigo-300 backdrop-blur">
								<MessageCircle size={22} strokeWidth={1.6} />
							</span>
							<div>
								<h3 className="text-lg font-semibold">Community</h3>
								<p className="mt-1 text-sm text-slate-300">Join the CoreIQ Slack to connect with peers.</p>
								<a
									href="https://community.coreiq.app"
									className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-indigo-300 transition hover:text-white"
								>
									Join now <span aria-hidden="true">→</span>
								</a>
							</div>
						</div>
						<div className="flex items-start gap-4">
							<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-indigo-300 backdrop-blur">
								<Sparkles size={22} strokeWidth={1.6} />
							</span>
							<div>
								<h3 className="text-lg font-semibold">Enterprise</h3>
								<p className="mt-1 text-sm text-slate-300">
									Want CoreIQ for your coaching team or corporate wellness? Ask about our pilot programme.
								</p>
							</div>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	)
}








