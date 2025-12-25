import { motion } from 'framer-motion'
import { DownloadBadges } from '../components/DownloadBadges'


export function Download() {
	return (
		<section id="download" className="relative py-24" style={{ background: '#000000' }}>
			{/* Subtle gradient */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{ background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 70%)' }}
			/>

			<div className="relative mx-auto max-w-4xl px-6 text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="space-y-8"
				>
					<p
						className="text-sm font-semibold uppercase tracking-[0.3em]"
						style={{ color: '#8b5cf6' }}
					>
						Get Started
					</p>

					<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
						Ready to transform your{' '}
						<span style={{ color: '#a78bfa' }}>fitness journey?</span>
					</h2>

					<p className="max-w-xl mx-auto text-base leading-relaxed" style={{ color: '#888888' }}>
						Join thousands of users who are already tracking their progress and reaching their goals with CoreIQ.
					</p>

					<div className="pt-4">
						<DownloadBadges className="justify-center" />
					</div>

					<motion.p
						className="text-sm pt-4"
						style={{ color: '#555555' }}
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.3 }}
					>
						Free to download · iOS & Android
					</motion.p>
				</motion.div>
			</div>
		</section>
	)
}
