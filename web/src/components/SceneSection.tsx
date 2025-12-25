import { motion } from 'framer-motion'
import { cn } from '../utils/cn'
import { LANDING_CONFIG } from '../config/landing'
import type { ReactNode } from 'react'

interface SceneSectionProps {
    children: ReactNode
    className?: string
    id?: string
}

export function SceneSection({ children, className, id }: SceneSectionProps) {
    return (
        <section
            id={id}
            className={cn(
                "relative flex items-center justify-center w-full",
                LANDING_CONFIG.layout.sectionSpacing,
                className
            )}
        >
            <motion.div
                initial={LANDING_CONFIG.motion.fadeUp.initial}
                whileInView={LANDING_CONFIG.motion.fadeUp.whileInView}
                viewport={LANDING_CONFIG.motion.fadeUp.viewport}
                transition={LANDING_CONFIG.motion.fadeUp.transition}
                className={cn("w-full", LANDING_CONFIG.layout.container)}
            >
                {children}
            </motion.div>
        </section>
    )
}
