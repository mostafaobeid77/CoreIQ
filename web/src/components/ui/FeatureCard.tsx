import { motion } from 'framer-motion'
import type { ComponentType, SVGProps } from 'react'
import { GlassCard } from './GlassCard'

type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>

interface FeatureCardProps {
    title: string
    description: string
    icon: LucideIcon
    delay?: number
    className?: string
}

export function FeatureCard({
    title,
    description,
    icon: Icon,
    delay = 0,
    className,
}: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className={className}
        >
            <GlassCard
                className="h-full p-6 flex flex-col items-start gap-4"
                hoverEffect
            >
                <div className="p-3 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/10 transition-colors group-hover:bg-violet-500/20 group-hover:text-violet-300">
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                        {description}
                    </p>
                </div>
            </GlassCard>
        </motion.div>
    )
}
