import { motion } from 'framer-motion'
import { Github, Twitter, Mail, ArrowUp } from 'lucide-react'


const socials = [
	{ icon: Twitter, href: 'https://twitter.com/', label: 'Twitter' },
	{ icon: Github, href: 'https://github.com/', label: 'GitHub' },
	{ icon: Mail, href: 'mailto:hello@coreiq.app', label: 'Email' },
]

export function Footer() {
	return (
		<footer className="relative bg-slate-950 border-t border-white/5 overflow-hidden">
			{/* Gradient accent line */}
			<div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

			{/* Ambient glow */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/10 blur-[150px] pointer-events-none" />

			<div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-16">
				{/* Main Content */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 mb-12">
					{/* Brand */}
					<div className="lg:col-span-1">
						<a href="#home" className="inline-block mb-6">
							<span className="text-2xl font-black text-white tracking-tight">CoreIQ</span>
						</a>
						<p className="text-slate-400 text-sm leading-relaxed max-w-sm">
							The intelligent fitness platform for those who take their transformation seriously. Track smarter, not harder.
						</p>
					</div>

					{/* Links */}
					<div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
						<div>
							<h4 className="text-white font-bold mb-4 text-sm">Product</h4>
							<ul className="space-y-3 text-sm text-slate-400">
								<li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
								<li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
								<li><a href="#download" className="hover:text-white transition-colors">Download</a></li>
							</ul>
						</div>
						<div>
							<h4 className="text-white font-bold mb-4 text-sm">Company</h4>
							<ul className="space-y-3 text-sm text-slate-400">
								<li><a href="#" className="hover:text-white transition-colors">About</a></li>
								<li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
								<li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
							</ul>
						</div>
						<div>
							<h4 className="text-white font-bold mb-4 text-sm">Legal</h4>
							<ul className="space-y-3 text-sm text-slate-400">
								<li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
								<li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
							</ul>
						</div>
					</div>
				</div>

				{/* Divider */}
				<div className="h-px w-full bg-white/5 mb-8" />

				{/* Bottom Bar */}
				<div className="flex flex-col sm:flex-row justify-between items-center gap-6">
					<p className="text-slate-500 text-sm">© {new Date().getFullYear()} CoreIQ. All rights reserved.</p>

					<div className="flex items-center gap-6">
						{/* Social Links */}
						<div className="flex items-center gap-3">
							{socials.map(({ icon: Icon, href, label }) => (
								<motion.a
									key={label}
									href={href}
									target="_blank"
									rel="noreferrer"
									whileHover={{ y: -2 }}
									className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
									aria-label={label}
								>
									<Icon size={16} />
								</motion.a>
							))}
						</div>

						{/* Back to top */}
						<motion.button
							onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
							whileHover={{ y: -2 }}
							className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
						>
							<ArrowUp size={14} />
							<span>Top</span>
						</motion.button>
					</div>
				</div>
			</div>
		</footer>
	)
}
