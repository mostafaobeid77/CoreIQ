import { motion } from 'framer-motion'
import { Github, Instagram, Linkedin } from 'lucide-react'


const socials = [
	{ icon: Instagram, href: 'https://instagram.com/', label: 'Instagram' },
	{ icon: Github, href: 'https://github.com/', label: 'GitHub' },
	{ icon: Linkedin, href: 'https://linkedin.com/', label: 'LinkedIn' },
]

export function Footer() {
	return (
		<footer className="relative bg-[#020202] border-t border-white/5 pt-20 pb-10 overflow-hidden">
			{/* Ambient background */}
			<div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-50" />

			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-16">
					{/* Brand & Mission */}
					<div className="space-y-8">
						<a href="#home" className="inline-block">
							<span
								className="text-2xl font-black tracking-tight"
								style={{
									background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
								}}
							>
								CoreIQ
							</span>
						</a>

						<div className="space-y-6 max-w-lg">
							<h3 className="text-white text-lg font-semibold">
								Built for the obsessed.
							</h3>
							<p className="text-slate-400 leading-relaxed text-sm">
								We believe fitness isn't just about moving weight—it's about understanding your body.
								Most trackers are glorified spreadsheets. CoreIQ is an intelligence layer for your health,
								designed to help you make decisions, not just log data.
							</p>
							<p className="text-slate-400 leading-relaxed text-sm">
								No ads. No data selling. Just pure, unadulterated progress tracking for those who take their journey seriously.
							</p>
						</div>
					</div>

					{/* Links & Newsletter */}
					<div className="flex flex-col gap-8 lg:items-end">
						<div className="grid grid-cols-2 gap-8 sm:gap-16">
							<div>
								<h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
								<ul className="space-y-3 text-sm text-slate-500">
									<li><a href="#features" className="hover:text-violet-400 transition-colors">Features</a></li>
									<li><a href="#download" className="hover:text-violet-400 transition-colors">Download</a></li>
									<li><a href="#" className="hover:text-violet-400 transition-colors">Changelog</a></li>
								</ul>
							</div>
							<div>
								<h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
								<ul className="space-y-3 text-sm text-slate-500">
									<li><a href="#" className="hover:text-violet-400 transition-colors">Privacy</a></li>
									<li><a href="#" className="hover:text-violet-400 transition-colors">Terms</a></li>
								</ul>
							</div>
						</div>

						{/* Social links */}
						<div className="flex items-center gap-4 mt-auto">
							{socials.map(({ icon: Icon, href, label }) => (
								<motion.a
									key={label}
									href={href}
									target="_blank"
									rel="noreferrer"
									whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.1)' }}
									className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors bg-white/5 border border-white/10 text-slate-400 hover:text-white"
									aria-label={label}
								>
									<Icon size={18} strokeWidth={1.5} />
								</motion.a>
							))}
						</div>
					</div>
				</div>

				{/* Bottom bar */}
				<div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
					<p>© {new Date().getFullYear()} CoreIQ. All rights reserved.</p>

				</div>
			</div>
		</footer>
	)
}
