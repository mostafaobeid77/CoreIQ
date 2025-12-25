import { motion } from 'framer-motion'
import { Github, Instagram, Linkedin } from 'lucide-react'

const socials = [
	{ icon: Instagram, href: 'https://instagram.com/', label: 'Instagram' },
	{ icon: Github, href: 'https://github.com/', label: 'GitHub' },
	{ icon: Linkedin, href: 'https://linkedin.com/', label: 'LinkedIn' },
]

export function Footer() {
	return (
		<footer style={{ backgroundColor: '#050505', borderTop: '1px solid #151515' }}>
			<div className="mx-auto max-w-6xl px-6 py-12">
				<div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
					{/* Logo */}
					<a href="#home">
						<span
							className="text-xl font-bold"
							style={{
								background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
							}}
						>
							CoreIQ
						</span>
					</a>

					{/* Social links */}
					<div className="flex items-center gap-4">
						{socials.map(({ icon: Icon, href, label }) => (
							<motion.a
								key={label}
								href={href}
								target="_blank"
								rel="noreferrer"
								whileHover={{ y: -2 }}
								className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
								style={{
									backgroundColor: '#111111',
									color: '#666666',
								}}
								aria-label={label}
							>
								<Icon size={16} strokeWidth={1.5} />
							</motion.a>
						))}
					</div>
				</div>

				{/* Bottom bar */}
				<div className="mt-10 pt-6 text-center text-xs" style={{ borderTop: '1px solid #151515', color: '#444444' }}>
					© {new Date().getFullYear()} CoreIQ. All rights reserved.
				</div>
			</div>
		</footer>
	)
}
