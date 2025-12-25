import { cn } from '../utils/cn'
import { motion } from 'framer-motion'
import { LANDING_CONFIG } from '../config/landing'
import { Section } from './ui/Section'
import type { ReactNode } from 'react'

interface SceneSectionProps {
    children: ReactNode
    className?: string
    id?: string
    noPadding?: boolean
}

export function SceneSection({ children, className, id, noPadding }: SceneSectionProps) {
    return (
        <Section id={id} className={cn("perspective-container relative", className)} noPadding={noPadding}>
            <motion.div
                initial={LANDING_CONFIG.motion.fadeUp.initial}
                whileInView={LANDING_CONFIG.motion.fadeUp.whileInView}
                viewport={LANDING_CONFIG.motion.fadeUp.viewport}
                transition={LANDING_CONFIG.motion.fadeUp.transition}
                className="preserve-3d w-full"
                style={{
                    maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)"
                }}
            >
                {children}
            </motion.div>
        </Section>
    )
}
