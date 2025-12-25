import { motion } from 'framer-motion'
import { DownloadBadges } from '../components/DownloadBadges'
import { PhoneMockup } from '../components/PhoneMockup'

export function Hero() {
	return (
		<section
			id="home"
			className="relative overflow-hidden pb-20 pt-36 text-white md:pb-28 md:pt-44"
			style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)' }}
		>
			{/* Animated gradient orb */}
			<motion.div
				className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
				style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%)' }}
				animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }}
				transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
			/>

			<div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:grid lg:grid-cols-[minmax(0,_1fr)_minmax(0,_380px)] lg:items-center lg:gap-16">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7 }}
					className="max-w-xl space-y-6"
				>
					{/* Badge */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.2 }}
						className="inline-flex items-center gap-2 rounded-full px-4 py-2"
						style={{
							background: 'rgba(139, 92, 246, 0.1)',
							border: '1px solid rgba(139, 92, 246, 0.2)',
						}}
					>
						<span
							className="w-2 h-2 rounded-full"
							style={{ backgroundColor: '#8b5cf6' }}
						/>
						<span className="text-sm font-medium" style={{ color: '#a78bfa' }}>
							Fitness · Nutrition · Progress
						</span>
					</motion.div>

					{/* Heading */}
					<h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
						Track your fitness
						<br />
						journey with{' '}
						<span
							style={{
								background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
							}}
						>
							CoreIQ
						</span>
					</h1>

					{/* Subtitle */}
					<p className="text-lg leading-relaxed" style={{ color: '#888888' }}>
						Your complete fitness companion for tracking workouts, planning meals, and reaching your goals.
					</p>

					{/* CTA */}
					<div className="pt-2">
						<DownloadBadges />
					</div>
				</motion.div>

				{/* Phone Mockup */}
				<motion.div
					initial={{ opacity: 0, x: 40 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8, delay: 0.3 }}
				>
					<motion.div
						animate={{ y: [0, -10, 0] }}
						transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
					>
						<PhoneMockup />
					</motion.div>
				</motion.div>
			</div>
		</section>
	)
}
