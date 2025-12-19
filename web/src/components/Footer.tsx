import { Github, Instagram, Linkedin } from 'lucide-react'

const socials = [
	{ icon: Instagram, href: 'https://instagram.com/', label: 'Instagram' },
	{ icon: Github, href: 'https://github.com/', label: 'GitHub' },
	{ icon: Linkedin, href: 'https://linkedin.com/', label: 'LinkedIn' },
]

export function Footer() {
	return (
		<footer className="relative border-t border-slate-200/10 bg-slate-950/80 text-slate-300 backdrop-blur-[6px] drop-shadow-lg">
			<div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-600/40 to-transparent pointer-events-none" />
			<div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-3">
					<a href="#home" className="flex items-center gap-3">
						<span className="text-lg font-bold text-indigo-400 drop-shadow-sm">CoreIQ</span>
						{/* Logo removed for cleaner look */}
					</a>
					<p className="max-w-sm text-sm text-slate-400 mt-1">
						CoreIQ keeps you moving with adaptive workouts, mindful nutrition, and intelligent coaching tuned to your life.
					</p>
				</div>
				<div className="space-y-3 text-sm">
					<div className="font-semibold uppercase tracking-wider text-indigo-400">Connect</div>
					<div className="flex items-center gap-3 mt-1">
						{socials.map(({ icon: Icon, href, label }) => (
							<a
								key={label}
								href={href}
								target="_blank"
								rel="noreferrer"
								className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-900/60 text-slate-200 transition hover:border-indigo-400/70 hover:text-indigo-300"
								aria-label={label}
							>
								<Icon size={18} strokeWidth={1.7} />
							</a>
						))}
					</div>
				</div>
			</div>
			<div className="border-t border-slate-800/70 px-6 py-4 mt-8">
				<div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
					<p className="mb-1 sm:mb-0">© {new Date().getFullYear()} <span className="text-indigo-400 font-bold">CoreIQ</span>. All rights reserved.</p>
					<div className="flex items-center gap-4 text-slate-400">
						<a href="#about" className="transition hover:text-indigo-300 font-medium">
							About
						</a>
						<a href="#features" className="transition hover:text-indigo-300 font-medium">
							Features
						</a>
						<a href="#download" className="transition hover:text-indigo-300 font-medium">
							Download
						</a>
						<a href="/admin/login" className="transition hover:text-indigo-300 font-medium">
							Admin Login
						</a>
					</div>
				</div>
			</div>
		</footer>
	)
}

