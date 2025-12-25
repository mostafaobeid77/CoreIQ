import { SceneSection } from '../components/SceneSection'
import { Badge } from '../components/ui/Badge'
import { DownloadBadges } from '../components/DownloadBadges'
import { Smartphone, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export function Download() {
	return (
		<div className="relative z-10">
			{/* Visual Bridge to Footer */}
			<div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-b from-transparent to-[#020202] pointer-events-none -z-10" />

			<SceneSection id="download" className="pb-0 lg:pb-0" type="spotlight">
				<div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-violet-900/10 to-transparent border border-white/5 p-12 md:p-24 text-center">

					{/* Beam of light */}
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none -z-10 mix-blend-screen" />

					<div className="relative z-10 flex flex-col items-center space-y-8 max-w-3xl mx-auto">
						<Badge icon={Smartphone}>Get Started Today</Badge>

						<h2 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-2 text-balance leading-tight">
							Start your <span className="text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-indigo-400">meta-evolution.</span>
						</h2>

						<p className="text-lg text-slate-300 max-w-xl text-balance">
							Join the community of serious lifters and health enthusiasts.
							Available now on iOS and Android.
						</p>

						<motion.div
							className="pt-8 scale-110"
							whileHover={{ scale: 1.15 }}
							transition={{ type: "spring", stiffness: 400, damping: 10 }}
						>
							<DownloadBadges />
						</motion.div>

						<p className="text-slate-500 text-sm mt-12 flex items-center gap-2">
							<Zap className="w-3 h-3 text-violet-400" /> Secure • Private • Personalized
						</p>
					</div>
				</div>
			</SceneSection >
		</div>
	)
}
