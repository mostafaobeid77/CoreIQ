import { Section } from '../components/ui/Section'
import { Badge } from '../components/ui/Badge'
import { DownloadBadges } from '../components/DownloadBadges'
import { Smartphone } from 'lucide-react'

export function Download() {
	return (
		<Section id="download">
			<div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-violet-900/20 to-slate-900/50 border border-white/10 p-12 md:p-24 text-center">
				{/* Background Effects */}
				<div className="absolute inset-0 bg-noise opacity-20" />
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/30 blur-[100px] rounded-full pointer-events-none" />

				<div className="relative z-10 flex flex-col items-center space-y-8 max-w-3xl mx-auto">
					<Badge icon={Smartphone}>Get Started Today</Badge>

					<h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-2">
						Start your transformation.
					</h2>

					<p className="text-lg text-slate-300 max-w-xl">
						Join the community of serious lifters and health enthusiasts.
						Available now on iOS and Android.
					</p>

					<div className="pt-4 scale-110">
						<DownloadBadges />
					</div>

					<p className="text-slate-500 text-sm mt-8">
						Secure • Private • Personalized
					</p>
				</div>
			</div>
		</Section >
	)
}
