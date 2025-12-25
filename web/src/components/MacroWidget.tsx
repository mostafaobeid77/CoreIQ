import { motion } from 'framer-motion'
import { GlassCard } from './ui/GlassCard'
import { Activity, Flame, Zap } from 'lucide-react'

export function MacroWidget() {
    const macros = [
        { label: 'Protein', value: 180, total: 200, color: 'bg-blue-500', icon: Activity },
        { label: 'Carbs', value: 240, total: 300, color: 'bg-violet-500', icon: Zap },
        { label: 'Fats', value: 65, total: 80, color: 'bg-pink-500', icon: Flame },
    ]

    return (
        <GlassCard
            className="w-full max-w-sm mx-auto overflow-visible"
            intensity="high"
            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Daily Targets</h3>
                    <p className="text-xs text-slate-400">On track for muscle gain</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center animate-pulse">
                    <span className="text-xs font-bold text-violet-300">92%</span>
                </div>
            </div>

            <div className="space-y-5">
                {macros.map((m, i) => (
                    <div key={m.label} className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-300 flex items-center gap-1">
                                <m.icon className="w-3 h-3" /> {m.label}
                            </span>
                            <span className="text-slate-400">{m.value} / {m.total}g</span>
                        </div>
                        {/* Bar Container */}
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${m.color} shadow-[0_0_10px_currentColor]`}
                                initial={{ width: 0 }}
                                whileInView={{ width: `${(m.value / m.total) * 100}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating 'Live' Badge */}
            <motion.div
                className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-500/40"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                LIVE
            </motion.div>
        </GlassCard>
    )
}
