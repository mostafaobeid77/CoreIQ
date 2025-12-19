import type { Variants } from 'framer-motion'

export const fadeUp: Variants = {
	hidden: { opacity: 0, y: 24 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.21, 0.8, 0.32, 1] },
	},
}

export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
	},
}

export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.95 },
	show: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
	},
}

export const staggerChildren = (delay = 0.12, startDelay = 0): Variants => ({
	hidden: {},
	show: {
		transition: {
			delayChildren: startDelay,
			staggerChildren: delay,
		},
	},
})

export const float: Variants = {
	hidden: { opacity: 0, y: 16 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
	},
}








