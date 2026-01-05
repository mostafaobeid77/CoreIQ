import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValueEvent, type MotionValue } from 'framer-motion'
import { useRef, useState } from 'react'
import { Activity, Apple, Brain, Target, Trophy, Calendar, TrendingUp, ArrowUpRight } from 'lucide-react'
import { useMediaQuery } from '../hooks/useMediaQuery'

interface PhoneMockupProps {
    externalProgress?: MotionValue<number>
}

export function PhoneMockup({ externalProgress }: PhoneMockupProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress: internalProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const scrollYProgress = externalProgress || internalProgress
    const isMobile = useMediaQuery('(max-width: 768px)')

    // Smooth values for 3D tilt - optimized spring config for less jank
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20, restDelta: 0.01 })

    // Parallax values for layers - CLAMPED to avoid jitter/overshoot
    // If mobile, keep it static to save GPU
    const phoneRotateY = useTransform(smoothProgress, [0, 1], isMobile ? [0, 0] : [-25, 25], { clamp: true })
    const phoneRotateX = useTransform(smoothProgress, [0, 1], isMobile ? [0, 0] : [15, -15], { clamp: true })

    // UI elements fly further - defined at component level, not in render
    const uiTranslateZ = useTransform(smoothProgress, [0, 1], isMobile ? [0, 0] : [40, 120], { clamp: true })
    const uiRotateY = useTransform(smoothProgress, [0, 1], isMobile ? [0, 0] : [-5, 15], { clamp: true })

    // Secondary widget transforms - moved out of render props
    const neuralTranslateZ = useTransform(smoothProgress, [0, 1], isMobile ? [0, 0] : [80, 180], { clamp: true })
    const neuralRotateY = useTransform(smoothProgress, [0, 1], isMobile ? [0, 0] : [-10, 10], { clamp: true })

    // Use React state for screen switching - more performant than .get() in render
    const [activeScreen, setActiveScreen] = useState<'plan' | 'track' | 'results'>('plan')

    useMotionValueEvent(scrollYProgress, 'change', (value) => {
        const newScreen = value < 0.4 ? 'plan' : value < 0.6 ? 'track' : 'results'
        setActiveScreen((prev) => prev !== newScreen ? newScreen : prev)
    })

    return (
        <div ref={containerRef} className="relative w-full h-full flex items-center justify-center perspective-[2000px]">
            {/* 3D Container */}
            <motion.div
                style={{
                    rotateY: phoneRotateY,
                    rotateX: phoneRotateX,
                    transformStyle: "preserve-3d"
                }}
                className="relative w-[300px] h-[620px]"
            >
                {/* 1. The Phone Chassis (Vision Glass) */}
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-3xl border-[6px] border-slate-800/80 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden z-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50" />
                </div>

                {/* 2. The Screen Glass (Middle) */}
                <div
                    style={{ transform: "translateZ(20px)" }}
                    className="absolute inset-[6px] bg-slate-950 rounded-[3.1rem] border border-white/10 overflow-hidden shadow-inner flex flex-col z-10"
                >
                    {/* Status Bar */}
                    <div className="h-12 px-8 flex justify-between items-center bg-transparent z-50">
                        <div className="text-[10px] font-bold text-white font-mono">10:42</div>
                        <div className="flex gap-1.5 items-center">
                            <Activity className="w-3 h-3 text-white" />
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                    </div>

                    {/* Screen Content Layers */}
                    <div className="flex-1 overflow-hidden relative">
                        <ScreenContent activeScreen={activeScreen} />
                    </div>

                    {/* Navigation Bar */}
                    <div className="h-20 px-8 flex justify-around items-center border-t border-white/5 bg-slate-900/60 backdrop-blur-xl pb-2">
                        <div className="p-2 rounded-xl bg-white/5"><Activity className="w-5 h-5 text-violet-400" /></div>
                        <Calendar className="w-5 h-5 text-slate-500 hover:text-white transition-colors" />
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <Target className="w-5 h-5 text-slate-500 hover:text-white transition-colors" />
                        <TrendingUp className="w-5 h-5 text-slate-500 hover:text-white transition-colors" />
                    </div>
                </div>

                {/* 3. Functional Widgets (Floating 3D) - HIDDEN ON MOBILE */}
                {!isMobile && (
                    <>
                        {/* Macro Distribution Widget */}
                        <motion.div
                            style={{
                                translateZ: uiTranslateZ,
                                rotateY: uiRotateY,
                                transformStyle: "preserve-3d"
                            }}
                            className="absolute -right-16 top-24 w-52 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] p-4 flex flex-col gap-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Macro Dist.</span>
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">ON TRACK</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* CSS Doughnut Chart */}
                                <div className="relative w-12 h-12 rounded-full border-4 border-slate-700 flex items-center justify-center"
                                    style={{ background: 'conic-gradient(#8b5cf6 0% 45%, #ec4899 45% 75%, #10b981 75% 100%)', borderRadius: '50%' }}>
                                    <div className="w-8 h-8 bg-slate-900 rounded-full" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-violet-500" /><span className="text-[9px] font-medium text-slate-300">Prot 45%</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-pink-500" /><span className="text-[9px] font-medium text-slate-300">Carb 30%</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-[9px] font-medium text-slate-300">Fats 25%</span></div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Neural Confidence Widget */}
                        <motion.div
                            style={{
                                translateZ: neuralTranslateZ,
                                rotateY: neuralRotateY,
                                transformStyle: "preserve-3d"
                            }}
                            className="absolute -left-20 bottom-32 w-60 bg-violet-950/90 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-[0_40px_80px_rgba(139,92,246,0.3)] p-5"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    <Brain className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-[10px] font-black text-white uppercase tracking-widest">Neural Conf.</div>
                                    <div className="text-[8px] font-medium text-violet-300">Prediction Model v4.2</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-end justify-between">
                                    <span className="text-3xl font-black text-white">98%</span>
                                    <span className="text-[10px] font-bold text-emerald-400 mb-1">HIGH FIDELITY</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div className="h-full bg-gradient-to-r from-violet-500 to-emerald-400" initial={{ width: 0 }} animate={{ width: '98%' }} transition={{ duration: 1.5 }} />
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="text-[8px] font-bold text-slate-400">Streak: 14 Days</span>
                                    <span className="text-[8px] font-bold text-slate-400">Next: 2h 14m</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}

                {/* Reflection/Glare */}
                <div className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-50" />
            </motion.div>
        </div>
    )
}

function ScreenContent({ activeScreen }: { activeScreen: 'plan' | 'track' | 'results' }) {
    return (
        <div className="w-full h-full p-8 font-sans">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeScreen}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05, y: -20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-8"
                >
                    {activeScreen === 'plan' && <PlanScreen />}
                    {activeScreen === 'track' && <TrackScreen />}
                    {activeScreen === 'results' && <ResultsScreen />}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

function PlanScreen() {
    return (
        <div className="space-y-6 pt-4 px-2">
            <div className="flex justify-between items-end pb-2 border-b border-white/5">
                <div className="space-y-1">
                    <span className="text-[8px] font-bold text-violet-400 uppercase tracking-widest">Active Protocol</span>
                    <h3 className="text-xl font-black text-white leading-none">Hyper-Protein<br />Cycle</h3>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-white">Day 14</div>
                    <div className="text-[8px] font-medium text-slate-500">Phase 2</div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {[
                    { name: 'Breakfast', cal: 450, macros: '45/30/25' },
                    { name: 'Pre-Workout', cal: 320, macros: '20/60/20' },
                    { name: 'Recovery', cal: 580, macros: '50/30/20' }
                ].map((meal, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center">
                                <Apple className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-300 uppercase">{meal.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-white">{meal.cal} kcal</span>
                                    <span className="text-[8px] text-slate-500">{meal.macros}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-12 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 w-3/4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-[9px] font-bold text-violet-300">Next Meal: 2h 45m</span>
            </div>
        </div>
    )
}

function TrackScreen() {
    return (
        <div className="space-y-6 pt-4 px-2">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Live Session</span>
                    <h3 className="text-xl font-black text-white">Power <br /> Foundation</h3>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
                    <span className="text-xs font-black text-white">HIIT</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5 flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">ZONE</span>
                    <span className="text-lg font-black text-orange-400">4.2</span>
                    <span className="text-[8px] font-medium text-slate-500">Anaerobic</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5 flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">LOAD</span>
                    <span className="text-lg font-black text-emerald-400">845</span>
                    <span className="text-[8px] font-medium text-slate-500">Optimal</span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-300 uppercase">
                    <span>Set Progress</span>
                    <span>3 / 5</span>
                </div>
                <div className="flex gap-1 h-8">
                    <div className="flex-1 bg-emerald-500/80 rounded-sm" />
                    <div className="flex-1 bg-emerald-500/80 rounded-sm" />
                    <div className="flex-1 bg-emerald-500/80 rounded-sm" />
                    <div className="flex-1 bg-slate-700/50 rounded-sm" />
                    <div className="flex-1 bg-slate-700/50 rounded-sm" />
                </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">Recording Biometrics...</span>
            </div>
        </div>
    )
}

function ResultsScreen() {
    return (
        <div className="space-y-6 pt-4 px-2">
            <div className="space-y-2 text-center pb-4 border-b border-white/5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400 mb-2">
                    <Trophy className="w-6 h-6" />
                </div>
                <div>
                    <span className="text-[8px] font-bold text-yellow-400 uppercase tracking-widest">Milestone 3</span>
                    <h3 className="text-xl font-black text-white">Goal Achieved</h3>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Muscle Mass</span>
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">+2.4kg</span>
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    </div>
                </div>
                <div className="flex items-center justify-center gap-1 h-32 w-full">
                    {/* CSS Bar Chart */}
                    {[30, 45, 35, 60, 50, 80, 75].map((h, i) => (
                        <div key={i} className="w-2 bg-yellow-400 rounded-t-sm" style={{ height: `${h}%`, opacity: 0.3 + (i * 0.1) }} />
                    ))}
                </div>
                <div className="text-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Optimization Complete</span>
                </div>
            </div>
        </div>
    )
}
