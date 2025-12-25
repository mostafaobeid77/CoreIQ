import { GlassCard } from './GlassCard'
import { cn } from '../../utils/cn'

interface FeatureCardProps {
    title: string
    description: string
    icon: React.ElementType
    className?: string
    delay?: number
}

export function FeatureCard({ title, description, icon: Icon, className, delay = 0 }: FeatureCardProps) {
    return (
        <GlassCard
            className={cn("flex flex-col gap-4", className)}
            hoverEffect={true}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay, duration: 0.5, ease: "easeOut" }}
        >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-violet-400 group-hover:text-violet-300 transition-colors" />
            </div>

            <div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm text-balance">{description}</p>
            </div>
        </GlassCard>
    )
}
