import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

interface BadgeProps {
    children: React.ReactNode
    icon?: LucideIcon
    className?: string
}

export function Badge({ children, icon: Icon, className }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
                "bg-white/5 border border-white/10 text-white/80 backdrop-blur-sm",
                "shadow-sm shadow-black/20",
                className
            )}
        >
            {Icon && <Icon className="w-3.5 h-3.5 text-violet-400" />}
            {children}
        </div>
    )
}
