import { motion, useScroll, useTransform } from 'framer-motion'
import { Badge } from '../components/ui/Badge'
import { Section } from '../components/ui/Section'
import { MagneticButton } from '../components/ui/MagneticButton'
import { PhoneMockup } from '../components/PhoneMockup'
import { Sparkles, ArrowRight } from 'lucide-react'
import { useRef } from 'react'

export function Hero() {
	const containerRef = useRef<HTMLDivElement>(null)
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"]
	})

	const phoneY = useTransform(scrollYProgress, [0, 1], [0, -150])
	const phoneRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 10])

	// 3D Perspective shifts
	const rotateX = useTransform(scrollYProgress, [0, 1], [0, 15])
	const z = useTransform(scrollYProgress, [0, 1], [0, -200])
	const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0])

	return (
		<Section className="relative overflow-visible" noPadding>
			<motion.div
				ref={containerRef}
				className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center preserve-3d pt-20 pb-12 lg:pt-32 lg:pb-20"
				style={{ rotateX, z, opacity }}
			>
				{/* Content */}
				<div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 preserve-3d">
					<motion.div
						initial={{ opacity: 0, z: 100 }}
						animate={{ opacity: 1, z: 0 }}
						transition={{ duration: 1 }}
					>
						<Badge icon={Sparkles}>Reimagining Fitness Tracking</Badge>
					</motion.div>

					<motion.h1
						className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance"
						initial={{ opacity: 0, rotateX: 45, z: -100 }}
						animate={{ opacity: 1, rotateX: 0, z: 0 }}
						transition={{ duration: 1, ease: "easeOut" }}
					>
						Master your body <br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
							with intelligence.
						</span>
					</motion.h1>

					<motion.p
						className="text-lg text-slate-400 max-w-xl leading-relaxed text-balance"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 1, delay: 0.1 }}
					>
						CoreIQ combines advanced analytics with intuitive design to help you build muscle, lose fat, and stay consistent. Zero guesswork.
					</motion.p>

					<motion.div
						className="flex flex-wrap gap-4 justify-center lg:justify-start"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
					>
						<MagneticButton className="group">
							Download App <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
						</MagneticButton>
						<MagneticButton variant="ghost">
							Learn More
						</MagneticButton>
					</motion.div>

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
					className="w-full max-w-[320px] mx-auto lg:max-w-none lg:mx-0 flex justify-center relative perspective-container"
					style={{ y: phoneY, rotate: phoneRotate }}
				>
					<div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[300px] w-[300px] bg-violet-600/40 blur-[120px] rounded-full z-[-1] animate-pulse" />
					<PhoneMockup />
				</motion.div>
			</motion.div>
		</Section>
	)
}
