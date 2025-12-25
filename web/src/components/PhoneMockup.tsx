import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { Activity, Apple, Brain, Flame, Target, Trophy } from 'lucide-react'

export function PhoneMockup() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    // Smooth values
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

    // Parallax values for layers
    const phoneRotateY = useTransform(smoothProgress, [0, 1], [-25, 25])
    const phoneRotateX = useTransform(smoothProgress, [0, 1], [15, -15])

    // UI elements fly further
    const uiTranslateZ = useTransform(smoothProgress, [0, 1], [40, 100])
    const uiRotateY = useTransform(smoothProgress, [0, 1], [-10, 10])

    return (
        <div ref={containerRef} className="relative w-full h-full flex items-center justify-center perspective-[1500px]">
            {/* 3D Container */}
            <motion.div
                style={{
                    rotateY: phoneRotateY,
                    rotateX: phoneRotateX,
                    transformStyle: "preserve-3d"
                }}
                className="relative w-[280px] h-[580px]"
            >
                {/* 1. The Phone Chassis (Back) */}
                <div className="absolute inset-0 bg-slate-900 border-[8px] border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden">
                    <div className="absolute inset-x-0 top-[10%] bottom-[10%] bg-violet-600/5 blur-3xl rounded-full" />
                </div>

                {/* 2. The Screen Glass (Middle) */}
                <div
                    style={{ transform: "translateZ(20px)" }}
                    className="absolute inset-[4px] bg-slate-950 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-inner"
                >
                    {/* Screen Content Layers */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <div className="w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-violet-400" />
                            </div>
                            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] text-slate-400 font-mono">
                                CORE-OS v2.4
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="h-2 w-16 bg-slate-800 rounded-full" />
                                <div className="h-8 w-48 bg-white/5 rounded-lg border border-white/5" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />
                                <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Floating 3D Elements (Front - Parallax) */}

                {/* Macro Widget */}
                <motion.div
                    style={{
                        translateZ: uiTranslateZ,
                        rotateY: uiRotateY,
                        transformStyle: "preserve-3d"
                    }}
                    className="absolute -right-16 top-32 w-48 h-24 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 flex flex-col justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
                            <Flame className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-white uppercase tracking-tighter">Metabolism</div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="text-2xl font-black text-white">+14%</div>
                        <div className="text-[10px] text-slate-400 uppercase">Efficiency</div>
                    </div>
                    {/* Depth highlight */}
                    <div className="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none" style={{ transform: "translateZ(10px)" }} />
                </motion.div>

                {/* Goal Widget */}
                <motion.div
                    style={{
                        translateZ: useTransform(smoothProgress, [0, 1], [60, 140]),
                        rotateY: useTransform(smoothProgress, [0, 1], [-5, 5]),
                        transformStyle: "preserve-3d"
                    }}
                    className="absolute -left-12 bottom-20 w-44 h-28 bg-violet-600/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(139,92,246,0.3)] p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-white" />
                        <div className="text-[10px] font-bold text-white uppercase tracking-widest">Prediction</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-lg font-bold text-white leading-tight">Goal reached in 12 days</div>
                        <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white"
                                initial={{ width: 0 }}
                                animate={{ width: "85%" }}
                                transition={{ delay: 1, duration: 1.5 }}
                            />
                        </div>
                    </div>
                    {/* Depth highlight */}
                    <div className="absolute inset-0 rounded-2xl border border-white/40 pointer-events-none" style={{ transform: "translateZ(15px)" }} />
                </motion.div>

                {/* Floating Metric Particles */}
                <FloatingMetric icon={Apple} color="text-red-400" top="10%" left="-20%" delay={0} progress={smoothProgress} />
                <FloatingMetric icon={Trophy} color="text-yellow-400" bottom="30%" right="-30%" delay={0.2} progress={smoothProgress} />
                <FloatingMetric icon={Target} color="text-blue-400" top="40%" right="-15%" delay={0.4} progress={smoothProgress} />

                {/* Reflection/Glare */}
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-30" />
            </motion.div>
        </div>
    )
}

function FloatingMetric({ icon: Icon, color, top, left, right, bottom, delay, progress }: any) {
    const y = useTransform(progress, [0, 1], [0, -100 * (delay + 1)])
    const rotate = useTransform(progress, [0, 1], [0, 45 * (delay + 1)])

    return (
        <motion.div
            style={{ top, left, right, bottom, y, rotate, transformStyle: "preserve-3d", translateZ: 150 }}
            className={`absolute w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center ${color} shadow-2xl`}
        >
            <Icon className="w-5 h-5" />
        </motion.div>
    )
}
