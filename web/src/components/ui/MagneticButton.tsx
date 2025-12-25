
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef } from 'react'
import type { MouseEvent, ReactNode } from 'react'

interface MagneticButtonProps {
    children: ReactNode
    className?: string
    variant?: 'primary' | 'ghost'
    onClick?: () => void
}

export function MagneticButton({ children, className = '', variant = 'primary', onClick }: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null)

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }
    const xSpring = useSpring(x, springConfig)
    const ySpring = useSpring(y, springConfig)

    const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
        if (!ref.current) return

        const { left, top, width, height } = ref.current.getBoundingClientRect()
        const centerX = left + width / 2
        const centerY = top + height / 2

        const distanceX = e.clientX - centerX
        const distanceY = e.clientY - centerY

        // Magnetic strength - how far it moves relative to cursor
        x.set(distanceX * 0.35)
        y.set(distanceY * 0.35)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    const baseStyles = "relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold transition-colors duration-200 rounded-full outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-slate-950"

    const variants = {
        primary: "bg-white text-slate-950 hover:bg-slate-200",
        ghost: "bg-slate-800/50 text-white hover:bg-slate-800 border border-slate-700/50 backdrop-blur-sm"
    }

    return (
        <motion.button
            ref={ref}
            style={{ x: xSpring, y: ySpring }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            whileTap={{ scale: 0.95 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
        </motion.button>
    )
}
