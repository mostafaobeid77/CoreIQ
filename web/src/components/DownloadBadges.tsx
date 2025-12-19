import { motion } from 'framer-motion'
import { cn } from '../utils/cn'

type DownloadBadgesProps = {
	className?: string
}

const stores = [
	{
		label: 'App Store',
		href: 'https://apps.apple.com/',
		icon: (
			<svg width="22" height="22" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
				<path d="M22.5 17.9c0-3.4 2.8-5.1 2.9-5.2-1.6-2.5-4-2.8-4.9-2.9-2-.2-3.9 1.2-5 1.2s-2.6-1.2-4.3-1.1c-2.2.1-4.3 1.3-5.5 3.3-2.4 4.1-.6 10.1 1.7 13.4 1.2 1.7 2.6 3.6 4.5 3.5 1.8-.1 2.5-1.1 4.7-1.1 2.2 0 2.8 1.1 4.7 1.1 1.9 0 3.1-1.7 4.3-3.4 1.4-2.1 2-4.1 2-4.2-.1 0-3.8-1.5-3.8-5.6zm-2.2-10.3c.9-1.1 1.5-2.7 1.4-4.3-1.4.1-3 1-4 2.1-.9 1-1.6 2.6-1.5 4.1 1.5.1 3.1-.8 4.1-1.9z" />
			</svg>
		),
	},
	{
		label: 'Google Play',
		href: 'https://play.google.com/',
		icon: (
			<svg width="22" height="22" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
				<path d="M4.9 4c-.6.3-1 .9-1 1.6v20.8c0 .7.4 1.3 1 1.6l14.4-12.1L4.9 4zm18.6 8.2l-3.4 2.9 4.4 3.7-5 4.2 8.2 4.7c.6-.3 1-.9 1-1.6V10.4c0-.7-.4-1.3-1-1.6l-4.2 3.4z" />
			</svg>
		),
	},
]

export function DownloadBadges({ className }: DownloadBadgesProps) {
	return (
		<div className={cn('flex flex-wrap items-center gap-3', className)}>
			{stores.map((store) => (
				<motion.a
					key={store.label}
					href={store.href}
					target="_blank"
					rel="noreferrer"
					whileHover={{ scale: 1.03 }}
					whileTap={{ scale: 0.98 }}
					className="inline-flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/10 backdrop-blur transition duration-300 hover:border-indigo-400/80 hover:text-indigo-600 dark:border-slate-700/60 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-indigo-900/30 dark:hover:border-indigo-400"
				>
					<span className="text-indigo-500">{store.icon}</span>
					<div className="flex flex-col leading-none">
						<span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
							Get it on
						</span>
						<span>{store.label}</span>
					</div>
				</motion.a>
			))}
		</div>
	)
}

