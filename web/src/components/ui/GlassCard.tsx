import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../utils/cn'
import type { ReactNode } from 'react'

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: ReactNode
    hoverEffect?: boolean
    intensity?: 'low' | 'medium' | 'high'
}

export function GlassCard({
    children,
    className,
    hoverEffect = true,
    intensity = 'medium',
    ...props
}: GlassCardProps) {
    return (
        <motion.div
            className={cn(
                "glass-panel rounded-3xl p-6 relative overflow-hidden",
                hoverEffect && "glass-card-hover group",
                className
            )}
            {...props}
        >
            {/* Optional inner gradient for 'high' intensity */}
            {intensity === 'high' && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />
            )}

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
}
