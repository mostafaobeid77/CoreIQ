
import { motion } from 'framer-motion'

export function MacroWidget() {
    return (
        <div className="w-full max-w-md mx-auto p-6">
            {/* Main Ring + Calories */}
            <div className="relative w-64 h-64 mx-auto mb-8">
                {/* Outer glow */}
                <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />

                {/* Ring Container */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background Ring */}
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />

                    {/* Animated Progress Ring */}
                    <motion.circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke="url(#macroGradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 0.72 }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    />

                    <defs>
                        <linearGradient id="macroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="50%" stopColor="#d946ef" />
                            <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                    >
                        <div className="text-5xl font-black text-white tracking-tight">2,450</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">kcal remaining</div>
                    </motion.div>
                </div>
            </div>

            {/* Macro Bars - Horizontal */}
            <div className="grid grid-cols-3 gap-3">
                <MacroBar label="Protein" current={145} target={180} color="from-emerald-500 to-emerald-400" delay={0.6} />
                <MacroBar label="Carbs" current={110} target={220} color="from-blue-500 to-cyan-400" delay={0.7} />
                <MacroBar label="Fats" current={45} target={65} color="from-amber-500 to-orange-400" delay={0.8} />
            </div>

        </div>
    )
}

function MacroBar({ label, current, target, color, delay }: {
    label: string,
    current: number,
    target: number,
    color: string,
    delay: number
}) {
    const percentage = Math.min((current / target) * 100, 100)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="p-3 rounded-xl bg-slate-800/50 border border-white/5 text-center"
        >
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</div>
            <div className="text-lg font-black text-white">{current}<span className="text-xs text-slate-500 font-medium">/{target}g</span></div>
            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden mt-2">
                <motion.div
                    className={`h-full bg-gradient-to-r ${color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: delay + 0.2 }}
                />
            </div>
        </motion.div>
    )
}
