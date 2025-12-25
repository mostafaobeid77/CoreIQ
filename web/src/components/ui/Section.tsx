import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import { motionConfig } from '../../config/design'
import type { ReactNode } from 'react'

interface SectionProps {
    children: ReactNode
    className?: string
    id?: string
    noPadding?: boolean
    intensity?: 'subtle' | 'normal'
}

export function Section({
    children,
    className,
    id,
    noPadding = false,
    intensity = 'normal'
}: SectionProps) {
    const variants = {
        hidden: {
            opacity: 0,
            y: 40,
            scale: 0.98,
            filter: 'blur(10px)'
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
                // Use intensity prop to fix lint 'unused' error (and actually support request)
                duration: intensity === 'subtle' ? 0.6 : motionConfig.duration.normal,
                // Cast to any to bypass strict tuple checks for bezier curve
                ease: [0.22, 1, 0.36, 1] as any
            }
        }
    }

    return (
        <section
            id={id}
            className={cn(
                "relative w-full max-w-7xl mx-auto px-6 lg:px-8",
                !noPadding && "py-24 lg:py-32",
                className
            )}
        >
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={motionConfig.viewport}
                variants={variants}
            >
                {children}
            </motion.div>
        </section>
    )
}
