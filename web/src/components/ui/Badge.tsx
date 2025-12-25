import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

interface BadgeProps {
    children: React.ReactNode
    className?: string
    icon?: React.ElementType
}

export function Badge({ children, className, icon: Icon }: BadgeProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                "bg-violet-500/10 border border-violet-500/20 text-violet-300 backdrop-blur-sm",
                "shadow-[0_0_15px_rgba(139,92,246,0.1)]",
                className
            )}
        >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {children}
        </motion.div>
    )
}
