import { motion } from 'framer-motion'
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className={cn(
                "group relative p-6 rounded-2xl overflow-hidden transition-colors",
                "bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-violet-500/30",
                "flex flex-col gap-4",
                className
            )}
        >
            {/* Hover Gradient Bloom */}
            <div
                className="absolute -top-[100px] -right-[100px] w-[200px] h-[200px] bg-violet-500/20 blur-[80px] rounded-full 
        opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            />

            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-violet-400 group-hover:text-violet-300 transition-colors" />
            </div>

            <div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
            </div>
        </motion.div>
    )
}
