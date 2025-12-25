import { cn } from '../../utils/cn'
import { designTokens } from '../../config/design'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    intensity?: 'low' | 'medium' | 'high'
}

export function GlassCard({
    children,
    className,
    intensity = 'medium',
    ...props
}: GlassCardProps) {
    const intensityStyles = {
        low: 'bg-white/2 border-white/5 backdrop-blur-md',
        medium: 'bg-white/5 border-white/10 backdrop-blur-xl',
        high: 'bg-white/8 border-white/20 backdrop-blur-2xl',
    }

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl border shadow-2xl transition-all duration-500',
                intensityStyles[intensity],
                className
            )}
            style={{
                boxShadow: designTokens.glass.innerGlow ? `inset 0 0 20px rgba(255, 255, 255, 0.02)` : undefined
            }}
            {...props}
        >
            {/* Inner highlight sheen */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            <div className="relative z-10 px-8 py-8">
                {children}
            </div>
        </div>
    )
}
