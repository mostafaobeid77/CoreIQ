import { motion, useScroll, useTransform } from 'framer-motion'
import React, { type ReactNode } from 'react'

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children?: ReactNode
    showRadialGradient?: boolean
}

export const AuroraBackground = ({
    className,
    children,
    showRadialGradient = true,
    ...props
}: AuroraBackgroundProps) => {
    const { scrollYProgress } = useScroll()
    const rotateX = useTransform(scrollYProgress, [0, 1], [0, 10])
    const z = useTransform(scrollYProgress, [0, 1], [0, -100])
    const opacity = useTransform(scrollYProgress, [0, 1], [0.7, 0.4])

    return (
        <motion.div
            className={`fixed inset-0 bg-zinc-950 bg-grid transition-bg -z-50 ${className}`}
            style={{
                rotateX,
                z,
                opacity,
                perspective: "1200px",
                transformStyle: "preserve-3d"
            }}
        >
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className={`
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,#3b82f6_10%,#a855f7_15%,#7c3aed_20%,#8b5cf6_25%,#60a5fa_30%)]
            [background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--dark-gradient),var(--aurora)] 
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-100 will-change-transform
            ${showRadialGradient ? `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]` : ''}`}
                ></div>
            </div>
            {children}
        </motion.div>
    )
}
