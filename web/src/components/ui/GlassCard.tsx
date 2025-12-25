import { cn } from '../../utils/cn'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    intensity?: 'low' | 'medium' | 'high'
    hoverEffect?: boolean
}

export function GlassCard({
    children,
    className,
    intensity = 'medium',
    hoverEffect = false,
    ...props
}: GlassCardProps) {
    const intensityStyles = {
        low: 'bg-white/5 border-white/5 backdrop-blur-sm',
        medium: 'bg-white/10 border-white/10 backdrop-blur-md',
        high: 'bg-white/15 border-white/20 backdrop-blur-lg',
    }

    return (
        <div
            className={cn(
                'rounded-2xl border transition-all duration-300',
                intensityStyles[intensity],
                hoverEffect && 'hover:bg-white/20 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/10',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
