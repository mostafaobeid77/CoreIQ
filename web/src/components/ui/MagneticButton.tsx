import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import type { MouseEvent, ReactNode } from 'react'

interface MagneticButtonProps {
    children: ReactNode
    className?: string
    variant?: 'primary' | 'glass' | 'ghost'
    onClick?: () => void
}

export function MagneticButton({ children, className = '', variant = 'primary', onClick }: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null)

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const springConfig = { damping: 20, stiffness: 200, mass: 0.5 }
    const xSpring = useSpring(x, springConfig)
    const ySpring = useSpring(y, springConfig)

    // Sheen animation based on mouse position
    const sheenX = useTransform(xSpring, [-20, 20], ['0%', '100%'])
    const sheenY = useTransform(ySpring, [-20, 20], ['0%', '100%'])

    const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
        if (!ref.current) return

        const { left, top, width, height } = ref.current.getBoundingClientRect()
        const centerX = left + width / 2
        const centerY = top + height / 2

        const distanceX = e.clientX - centerX
        const distanceY = e.clientY - centerY

        x.set(distanceX * 0.4)
        y.set(distanceY * 0.4)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    const baseStyles = "relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold transition-all duration-300 rounded-full outline-none overflow-hidden group"

    const variants = {
        primary: "bg-white text-slate-950 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] glow-pulse",
        glass: "bg-white/5 border border-white/10 backdrop-blur-md text-white hover:bg-white/10 hover:border-white/20",
        ghost: "bg-transparent text-white border border-white/5 hover:bg-white/5"
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
            {/* Interactive Sheen Overlay */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                    left: sheenX,
                    top: sheenY,
                    width: '200%',
                    height: '200%',
                    transform: 'translate(-50%, -50%) rotate(45deg)'
                }}
            />

            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
        </motion.button>
    )
}
