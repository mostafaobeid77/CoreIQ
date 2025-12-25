import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import type { ReactNode } from 'react'

interface SectionProps {
    children: ReactNode
    className?: string
    id?: string
    noPadding?: boolean
}

export function Section({ children, className, id, noPadding = false }: SectionProps) {
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
                {children}
            </motion.div>
        </section>
    )
}
