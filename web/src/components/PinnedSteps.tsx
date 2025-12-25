import { motion, useScroll, type MotionValue, useTransform, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { Badge } from './ui/Badge'
import { Settings2, BookOpen, Activity, Layout, Zap, Brain, TrendingUp, ShieldCheck, Target } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'

const steps = [
    {
        id: 'plan',
        title: 'Smart Meal Plans',
        desc: 'AI-powered nutrition plans tailored to your body composition, goals, and preferences. Updated weekly as your metabolism adapts.',
        icon: BookOpen,
        Visual: MealPlanVisual
    },
    {
        id: 'track',
        title: 'Workout Tracking',
        desc: 'Log sets, reps, and weights with one tap. Track progressive overload and see your strength gains visualized over time.',
        icon: Activity,
        Visual: WorkoutVisual
    },
    {
        id: 'results',
        title: 'Progress Analytics',
        desc: 'See your transformation unfold with real-time analytics. Caloric balance, macro trends, and predicted milestones all in one view.',
        icon: Layout,
        Visual: AnalyticsVisual
    }
]

// Animated visual components for the steps
function MealPlanVisual() {
    return (
        <div className="h-full w-full bg-gradient-to-br from-emerald-500/5 to-transparent p-3 flex flex-col justify-center overflow-hidden">
            <div className="space-y-1.5">
                {['Breakfast', 'Lunch', 'Dinner'].map((meal, i) => (
                    <motion.div
                        key={meal}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-2"
                    >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-bold ${i === 0 ? 'bg-emerald-500/20 text-emerald-400' :
                                i === 1 ? 'bg-blue-500/20 text-blue-400' : 'bg-violet-500/20 text-violet-400'
                            }`}>{meal[0]}</div>
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${i === 0 ? 'bg-emerald-400' : i === 1 ? 'bg-blue-400' : 'bg-violet-400'
                                    }`}
                                initial={{ width: 0 }}
                                whileInView={{ width: `${[85, 60, 30][i]}%` }}
                                transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                            />
                        </div>
                        <span className="text-[8px] font-bold text-slate-500">{[450, 380, 120][i]}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

function WorkoutVisual() {
    return (
        <div className="h-full w-full bg-gradient-to-br from-orange-500/5 to-transparent p-3 flex items-end justify-center overflow-hidden">
            <div className="flex items-end gap-0.5 h-full pb-2">
                {[35, 50, 40, 65, 55, 75, 60, 80].map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="w-3 bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-sm"
                    />
                ))}
            </div>
        </div>
    )
}

function AnalyticsVisual() {
    return (
        <div className="h-full w-full bg-gradient-to-br from-violet-500/10 to-transparent p-3 flex flex-col justify-center items-center overflow-hidden">
            {/* Smart Analysis Mini Preview */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mb-1">On Track</div>
                <div className="text-2xl font-black text-white">-2.4 kg</div>
                <div className="text-[8px] font-medium text-slate-500 uppercase tracking-wide">This Month</div>
            </motion.div>
            <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-full h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent mt-3 origin-left"
            />
        </div>
    )
}


function PlanVisual() {
    return (
        <div className="flex flex-col h-full bg-slate-950/40 font-mono">
            {/* Header / Status Bar */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                        <Brain className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest leading-none mb-1">System Status</span>
                        <span className="text-xs font-medium text-slate-300">Baseline Analysis Link</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <div className="relative w-1.5 h-1.5">
                        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                        <div className="relative w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Scan Active</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 space-y-6 relative overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Primary Metric: Biological Scan */}
                <div className="relative w-full h-40 rounded-xl bg-slate-900/50 border border-white/10 overflow-hidden group">
                    {/* Scan Line Animation */}
                    <motion.div
                        className="absolute inset-x-0 h-px bg-violet-400/80 shadow-[0_0_20px_rgba(167,139,250,0.5)] z-20"
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
                    />

                    {/* Data Points on Scan */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                        <div className="flex justify-between items-start text-[10px] text-slate-500 uppercase tracking-wider">
                            <span>Sector A-7</span>
                            <span>T-Minus 0.4s</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <div className="text-[10px] text-violet-400 font-bold uppercase">Metabolic Rate</div>
                                <div className="text-2xl font-bold text-white tracking-tight">2,140 <span className="text-xs text-slate-500 font-normal">Kcal</span></div>
                            </div>
                            <div className="h-8 w-24 flex items-end gap-0.5">
                                {[40, 70, 50, 90, 60, 80, 45, 75, 55, 85].map((h, i) => (
                                    <div key={i} className="w-full bg-violet-500/30 rounded-t-sm relative overflow-hidden" style={{ height: `${h}%` }}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-violet-500/80 to-transparent opacity-50" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    {/* Insulin Sensitivity */}
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Insulin Sens.</span>
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        </div>
                        <div className="space-y-1">
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-emerald-400"
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '92%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                            <div className="flex justify-between text-[9px] font-medium">
                                <span className="text-emerald-400">Optimized</span>
                                <span className="text-slate-500">92/100</span>
                            </div>
                        </div>
                    </div>

                    {/* Target Delta */}
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Target Delta</span>
                            <Target className="w-3 h-3 text-blue-400" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-white">-4.5</span>
                            <span className="text-xs font-bold text-blue-400">%</span>
                            <span className="text-[9px] text-slate-500 ml-auto uppercase">Body Fat</span>
                        </div>
                    </div>
                </div>

                {/* Footer / Console Output */}
                <div className="mt-auto pt-4 border-t border-white/5">
                    <div className="flex flex-col gap-1 font-mono text-[9px] text-slate-500">
                        <div className="flex justify-between">
                            <span>{'>'} INITIALIZING BIOMETRIC SEQUENCE...</span>
                            <span className="text-emerald-500">OK</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{'>'} CALIBRATING NEURAL BASELINE...</span>
                            <span className="text-emerald-500">OK</span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

function TrackVisual() {
    return (
        <div className="flex flex-col h-full bg-slate-950/40 font-mono">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none mb-1">Feedback Loop</span>
                        <span className="text-xs font-medium text-slate-300">Live Ingestion</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">T-00:42:12</span>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6 relative overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Primary Metric: Pulse Waveform */}
                <div className="space-y-2 relative z-10 w-full">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Heart Rate Var.</span>
                        <span className="text-2xl font-bold text-white tracking-tight">142 <span className="text-xs text-rose-400 font-bold">BPM</span></span>
                    </div>
                    <div className="h-24 w-full bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden flex items-end px-1 gap-[2px]">
                        {[...Array(40)].map((_, i) => {
                            const height = 20 + Math.random() * 60;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ height: '20%' }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }}
                                    className="flex-1 bg-rose-500/40 rounded-t-[1px]"
                                />
                            )
                        })}
                    </div>
                </div>

                {/* Secondary: Load Heatmap / Trace */}
                <div className="space-y-4 relative z-10">
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Zap className="w-3 h-3 text-orange-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Training Load</span>
                            </div>
                            <span className="text-lg font-bold text-white">1,240 <span className="text-xs text-slate-500">KG</span></span>
                        </div>
                        <div className="flex gap-0.5 h-8">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className={`w-1 h-full rounded-sm ${i > 14 ? 'bg-slate-800' : 'bg-orange-500/60'}`} />
                            ))}
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Recovery State</span>
                            </div>
                            <span className="text-lg font-bold text-white">94% <span className="text-xs text-emerald-400">OPTIMAL</span></span>
                        </div>
                        <div className="relative w-12 h-12">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="4" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="94, 100" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function AnalyzeVisual() {
    return (
        <div className="flex flex-col h-full bg-slate-950/40 font-mono">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                        <TrendingUp className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest leading-none mb-1">Singularity</span>
                        <span className="text-xs font-medium text-slate-300">Predictive Outcome</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">T-PLUS 12W</span>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6 relative overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Primary Metric: Comparison Vector */}
                <div className="relative z-10 p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projected Trajectory</span>
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-slate-500">CURRENT</span>
                            <span className="text-slate-600">→</span>
                            <span className="text-yellow-400 font-bold">TARGET</span>
                        </div>
                    </div>
                    {/* Graph */}
                    <div className="h-32 w-full relative border-l border-b border-white/10">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            {/* Projected Path */}
                            <motion.path
                                d="M0,100 C50,100 80,80 150,50 S250,10 300,5"
                                fill="none"
                                stroke="#fbbf24"
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: "easeOut" }}
                            />
                            {/* Area fill */}
                            <motion.path
                                d="M0,100 C50,100 80,80 150,50 S250,10 300,5 L300,100 L0,100"
                                fill="url(#gradient-yellow)"
                                opacity="0.2"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 0.2 }}
                                transition={{ delay: 0.5, duration: 1 }}
                            />
                            <defs>
                                <linearGradient id="gradient-yellow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#fbbf24" />
                                    <stop offset="100%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute top-0 right-0 p-2 bg-yellow-500/10 rounded border border-yellow-500/20 translate-x-1/2 -translate-y-1/2">
                            <div className="text-[10px] font-bold text-yellow-400">-4.2% BF</div>
                        </div>
                    </div>
                </div>

                {/* Achievement Cores */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                            <Target className="w-5 h-5 text-violet-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Consistency</span>
                            <span className="text-sm font-bold text-white">98.5%</span>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Intensity</span>
                            <span className="text-sm font-bold text-white">ELITE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function PinnedSteps() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress: rawProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    const scrollYProgress = useSpring(rawProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

    return (
        <div ref={containerRef} id="how-it-works" className="relative min-h-screen py-32">
            <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">

                {/* Header */}
                <div className="text-center mb-20">
                    <Badge icon={Settings2}>Workflow</Badge>
                    <h2 className="text-5xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase mt-6">
                        From ambition <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">to result.</span>
                    </h2>
                    <p className="text-slate-400 text-lg mt-6 max-w-2xl mx-auto">
                        Three phases. One transformation. CoreIQ orchestrates your evolution from blueprint to breakthrough.
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                        >
                            <GlassCard className="h-full p-6 border-white/10 hover:border-white/20 transition-colors" intensity="medium">
                                {/* Step Number */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                                        <step.icon className="w-6 h-6 text-violet-400" />
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Phase {index + 1}
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{step.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>

                                {/* Visual Preview */}
                                <div className="mt-6 h-40 rounded-xl bg-slate-900/50 border border-white/5 overflow-hidden">
                                    <step.Visual />
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    )
}


interface StepProps {
    index: number
    progress: MotionValue<number>
    step: typeof steps[0]
}

function OpacityStep({ index, progress, step }: StepProps) {
    // Standardized peaks at 0.3, 0.5, 0.7
    const peaks = [0.3, 0.5, 0.7]
    const peak = peaks[index]
    const range = 0.15 // Transition window

    const opacity = useTransform(progress, [peak - range, peak, peak + range], [0, 1, 0], { clamp: true })
    const y = useTransform(progress, [peak - range, peak, peak + range], [40, 0, -40], { clamp: true })
    const scale = useTransform(progress, [peak - range, peak, peak + range], [0.95, 1, 0.95], { clamp: true })

    return (
        <motion.div style={{ opacity, y, scale }} className="transition-colors duration-300">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-2xl lg:text-4xl font-black text-white tracking-tighter uppercase">{step.title}</h3>
            </div>
            <p className="text-lg lg:text-2xl font-medium text-slate-400 leading-relaxed max-w-lg">{step.desc}</p>
        </motion.div>
    )
}

function VisualCard({ index, progress, Visual }: { index: number, progress: MotionValue<number>, Visual: React.ElementType }) {
    // Adjusted peaks: first card visible from start, then transitions
    // Card 0: visible from 0 to 0.35
    // Card 1: visible from 0.35 to 0.65
    // Card 2: visible from 0.65 to 1.0
    const ranges = [
        { start: 0, peak: 0.2, end: 0.4 },
        { start: 0.35, peak: 0.5, end: 0.7 },
        { start: 0.6, peak: 0.8, end: 1.0 }
    ]
    const { start, peak, end } = ranges[index]

    const opacity = useTransform(progress, [start, peak, end], [0, 1, 0], { clamp: true })
    // First card starts fully visible
    const adjustedOpacity = index === 0
        ? useTransform(progress, [0, 0.35], [1, 0], { clamp: true })
        : opacity

    const scale = useTransform(progress, [start, peak, end], [0.95, 1, 0.95], { clamp: true })

    return (
        <motion.div
            style={{ opacity: adjustedOpacity, scale }}
            className="absolute inset-0 flex items-center justify-center"
        >
            <GlassCard className="h-full w-full p-0 overflow-hidden border-white/20" intensity="high">
                <Visual />
            </GlassCard>
        </motion.div>
    )
}

