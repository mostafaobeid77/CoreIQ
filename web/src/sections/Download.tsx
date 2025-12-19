import { motion } from 'framer-motion'
import { DownloadBadges } from '../components/DownloadBadges'
import { fadeIn, fadeUp } from '../lib/motion'
import { PhoneMockup } from '../components/PhoneMockup'
import { Dumbbell, HeartPulse, Watch, BrainCog } from 'lucide-react'

export function Download() {
	return (
		<section id="download" className="relative overflow-hidden bg-slate-50 py-14 dark:bg-slate-950">
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.18),_transparent_65%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_60%)]" />
			</div>
			<div className="relative mx-auto max-w-5xl px-6">
				<motion.div
					initial={{ opacity: 0, scale: 0.97 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true, amount: 0.4 }}
					transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
					className="overflow-visible p-0 sm:p-2 text-left shadow-none dark:shadow-none flex flex-col md:flex-row items-center md:items-stretch justify-between gap-2 bg-transparent border-none"
				>
					{/* Left: Description + Badges */}
					<div className="flex-1 px-2 sm:px-8 py-4 flex flex-col justify-center md:items-start items-center text-center md:text-left">
						<h3 className="text-xl sm:text-2xl font-semibold mb-1 tracking-tight text-slate-900 dark:text-white">Download CoreIQ</h3>
						<p className="mb-4 text-base text-slate-600 dark:text-slate-300 max-w-md">Get the app for iOS and Android. AI-powered plans and intelligent insights are one tap away.</p>
						{/* Social proof: star rating and trusted badge */}
						<div className="mb-4 flex flex-col items-start gap-2 w-full max-w-xs pl-px">
							{/* Ratings Row */}
							<div className="flex items-center gap-1">
								{[...Array(5)].map((_, i) => (
									<svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-amber-400"><path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" /></svg>
								))}
								<span className="ml-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">4.9/5</span>
							</div>
							<div className="text-xs text-slate-600 dark:text-slate-400 font-medium">App Store & Google Play rating</div>
							<div className="mt-1 rounded-full px-3 py-1 text-xs font-bold bg-gradient-to-r from-emerald-100 via-indigo-100 to-sky-100 dark:from-indigo-900/60 dark:to-sky-900/60 text-indigo-500 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900 shadow">Trusted by 10,000+ users worldwide</div>
						</div>
						<div className="w-full max-w-xs flex flex-col items-start">
							<DownloadBadges />
						</div>
					</div>
					{/* Right: Phone */}
					<div className="flex-shrink-0 flex items-center justify-center md:pl-2">
						<PhoneMockup minimalLogoOnly />
					</div>
				</motion.div>
			</div>
		</section>
	)
}


