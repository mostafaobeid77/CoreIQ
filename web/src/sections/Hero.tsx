import { motion, useScroll, useTransform } from 'framer-motion'
import { Badge } from '../components/ui/Badge'
import { Section } from '../components/ui/Section'
import { DownloadBadges } from '../components/DownloadBadges'
import { PhoneMockup } from '../components/PhoneMockup'
import { Sparkles } from 'lucide-react'
import { useRef } from 'react'
import { LANDING_CONFIG } from '../config/landing'

export function Hero() {
	const containerRef = useRef<HTMLDivElement>(null)
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"]
	})

	const phoneY = useTransform(scrollYProgress, [0, 1], [0, -100])
	const phoneRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 10])

	return (
		<Section className="relative overflow-visible min-h-[90vh] flex items-center" noPadding>
			<motion.div
				ref={containerRef}
				className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center pt-32 pb-20"
			>
				{/* Content */}
				<div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-10">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8 }}
					>
						<Badge icon={Sparkles}>THE GENESIS OF THE META-HUMAN</Badge>
					</motion.div>

					<motion.h1
						className={LANDING_CONFIG.typography.h1}
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
					>
						Master the machine <br />
						<span className={`${LANDING_CONFIG.styles.gradient} animate-gradient`}>
							that is your body.
						</span>
					</motion.h1>

					<motion.p
						className={LANDING_CONFIG.typography.body + " max-w-xl"}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.1 }}
					>
						CoreIQ is the neural bridge between your ambition and your biological reality. Stop tracking. Start evolving with predictive intelligence.
					</motion.p>

					<motion.div
						className="flex flex-col gap-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
					>
						<div className="flex flex-wrap gap-4 justify-center lg:justify-start">
							<DownloadBadges />
						</div>
					</motion.div>

					<motion.div
						className="flex items-center gap-6 text-sm text-slate-500 pt-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<div className="flex -space-x-3">
							{[1, 2, 3, 4].map(i => (
								<div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-slate-400 overflow-hidden">
									<img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
								</div>
							))}
						</div>
						<p className="font-semibold tracking-wide uppercase text-[10px] text-slate-400">Join 1,000+ elite performers</p>
					</motion.div>
				</div>

				{/* Product Visual */}
				<motion.div
					className="w-full max-w-[400px] mx-auto lg:max-w-none lg:mx-0 flex justify-center relative perspective-container"
					style={{ y: phoneY, rotate: phoneRotate }}
				>
					<div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[400px] w-[400px] bg-white/5 blur-[120px] rounded-full z-[-1]" />
					<div className="animate-float">
						<PhoneMockup />
					</div>
				</motion.div>


			</motion.div>
		</Section>
	)
}
