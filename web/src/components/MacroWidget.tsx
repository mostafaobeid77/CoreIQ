
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function MacroWidget() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => setProgress(1), 500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="w-full max-w-sm mx-auto p-4">
            <div className="relative aspect-square max-h-[300px] mx-auto flex items-center justify-center">
                {/* Central Calorie Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-center"
                    >
                        <span className="text-4xl font-bold text-white block">2,450</span>
                        <span className="text-sm text-slate-400 uppercase tracking-wider font-medium">kcal left</span>
                    </motion.div>
                </div>

                {/* Circular Progress Rings */}
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Background Ring */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(139, 92, 246, 0.1)"
                        strokeWidth="8"
                    />

                    {/* Progress Ring */}
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 0.75 }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        style={{ pathLength: progress }}
                    />

                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#d946ef" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Floating Macro Pills */}
                <MacroPill label="Protein" value="180g" color="bg-emerald-500" delay={0.8} angle={-30} />
                <MacroPill label="Carbs" value="220g" color="bg-blue-500" delay={0.9} angle={90} />
                <MacroPill label="Fats" value="65g" color="bg-amber-500" delay={1.0} angle={210} />
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <MacroStat label="Protein" value="145/180g" color="text-emerald-400" />
                <MacroStat label="Carbs" value="110/220g" color="text-blue-400" />
                <MacroStat label="Fats" value="45/65g" color="text-amber-400" />
            </div>
        </div>
    )
}

function MacroPill({ label, value, color, delay, angle }: { label: string, value: string, color: string, delay: number, angle: number }) {
    // Calculate position on the circle border (radius 45% roughly)
    // We'll just position them absolutely for simplicity in this mock, or use transform

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay }}
            className={`absolute px-3 py-1 rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-700 flex items-center gap-2 text-xs font-semibold shadow-xl z-20`}
            style={{
                transform: `rotate(${angle}deg) translate(140px) rotate(-${angle}deg)`, // Translate out from center
                // Note: The translate value depends on container size. 
                // Let's use standard CSS positioning for a cleaner look in the simpler version
                // Actually, let's just create a decorative visual layout
            }}
        >
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-slate-200">{label}</span>
            <span className="text-white">{value}</span>
        </motion.div>
    )
}


function MacroStat({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div>
            <div className={`text-sm font-bold ${color} mb-1`}>{label}</div>
            <div className="text-slate-400 text-xs">{value}</div>
        </div>
    )
}
