import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { cn } from '../../utils/cn'
import React, { ElementType } from 'react'

interface FeatureCardProps {
    title: string
    description: string
    icon: ElementType
    className?: string
    delay?: number
}

export function FeatureCard({ title, description, icon: Icon, className, delay = 0 }: FeatureCardProps) {
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x)
    const mouseYSpring = useSpring(y)

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5
        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, z: -20, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, z: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay }}
            viewport={{ once: true }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={cn("group perspective-container", className)}
        >
            <GlassCard className="h-full space-y-4 preserve-3d p-6" intensity="low">
                <div
                    className="p-3 w-fit rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-400 group-hover:scale-110 group-hover:bg-violet-600/30 transition-all duration-500"
                    style={{ transform: "translateZ(30px)" }}
                >
                    <Icon size={24} />
                </div>
                <div style={{ transform: "translateZ(20px)" }}>
                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
                </div>

                {/* Bottom Glow */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-violet-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </GlassCard>
        </motion.div>
    )
}
