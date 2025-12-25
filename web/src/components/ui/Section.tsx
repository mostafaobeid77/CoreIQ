import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import { LANDING_CONFIG } from '../../config/landing'
import type { ReactNode } from 'react'

interface SectionProps {
    children: ReactNode
    className?: string
    id?: string
    noPadding?: boolean
}

export function Section({
    children,
    className,
    id,
    noPadding = false,
}: SectionProps) {
    return (
        <section
            id={id}
            className={cn(
                "relative w-full",
                LANDING_CONFIG.layout.container,
                !noPadding && LANDING_CONFIG.layout.sectionSpacing,
                className
            )}
        >
            <motion.div
                initial={LANDING_CONFIG.motion.fadeUp.initial}
                whileInView={LANDING_CONFIG.motion.fadeUp.whileInView}
                viewport={LANDING_CONFIG.motion.fadeUp.viewport}
                transition={LANDING_CONFIG.motion.fadeUp.transition}
            >
                {children}
            </motion.div>
        </section>
    )
}
