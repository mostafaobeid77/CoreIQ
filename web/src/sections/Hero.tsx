import { motion } from 'framer-motion'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Section } from '../components/ui/Section'
import { PhoneMockup } from '../components/PhoneMockup'
import { Sparkles, ArrowRight } from 'lucide-react'

export function Hero() {
	return (
		<Section className="pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden" noPadding>
			{/* Background Ambience */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-600/20 blur-[120px] rounded-full opacity-30 pointer-events-none -z-10" />

			<div className="grid lg:grid-cols-2 gap-16 items-center">
				{/* Content */}
				<div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 z-10">
					<Badge icon={Sparkles}>Reimagining Fitness Tracking</Badge>

					<motion.h1
						className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
					>
						Master your body <br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
							with intelligence.
						</span>
					</motion.h1>

					<motion.p
						className="text-lg text-slate-400 max-w-xl leading-relaxed text-balance"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.1 }}
					>
						CoreIQ combines advanced analytics with intuitive design to help you build muscle, lose fat, and stay consistent. Zero guesswork.
					</motion.p>

					<motion.div
						className="flex flex-wrap gap-4 justify-center lg:justify-start"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
					>
						<Button size="lg" className="group">
							Download App <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
						</Button>
						<Button variant="ghost" size="lg">
							Learn More
						</Button>
					</motion.div>

					{/* Social Proof / Trust tiny */}
					<motion.div
						className="flex items-center gap-4 text-sm text-slate-500 pt-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<div className="flex -space-x-2">
							{[1, 2, 3, 4].map(i => (
								<div key={i} className="w-8 h-8 rounded-full bg-slate-800 border border-black flex items-center justify-center text-xs font-bold text-slate-400">
									U{i}
								</div>
							))}
						</div>
						<p>Join 1,000+ active users</p>
					</motion.div>
				</div>

				{/* Product Visual */}
				<motion.div
					className="relative mx-auto lg:mx-0 w-[300px] sm:w-[350px]"
					initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
					animate={{ opacity: 1, scale: 1, rotateY: 0 }}
					transition={{ duration: 1, ease: "easeOut" }}
				>
					{/* Glow behind phone */}
					<div className="absolute inset-0 bg-violet-500/30 blur-[60px] rounded-full z-[-1]" />

					<motion.div
						animate={{ y: [0, -15, 0] }}
						transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
						className="relative z-10"
					>
						<PhoneMockup />
					</motion.div>


				</motion.div>
			</div>
		</Section>
	)
}
