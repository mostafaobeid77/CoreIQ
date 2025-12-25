
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Badge } from './ui/Badge'
import { Settings2, Target, TrendingUp, CheckCircle, Activity } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'


// Visual Components for the Right Side
const PlanVisual = () => (
    <div className="w-full h-full p-6 space-y-4">
        <div className="flex justify-between items-center mb-6">
            <h4 className="text-white font-semibold">Your Plan</h4>
            <span className="text-xs text-violet-400 bg-violet-400/10 px-2 py-1 rounded-full">Active</span>
        </div>
        <div className="space-y-3">
            <div className="h-2 w-1/3 bg-slate-700 rounded-full" />
            <div className="h-16 bg-white/5 rounded-xl border border-white/5 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400"><Target size={18} /></div>
                <div>
                    <div className="h-2 w-20 bg-slate-600 rounded-full mb-1.5" />
                    <div className="h-1.5 w-12 bg-slate-700 rounded-full" />
                </div>
            </div>
            <div className="h-16 bg-white/5 rounded-xl border border-white/5 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400"><Activity size={18} /></div>
                <div>
                    <div className="h-2 w-24 bg-slate-600 rounded-full mb-1.5" />
                    <div className="h-1.5 w-16 bg-slate-700 rounded-full" />
                </div>
            </div>
        </div>
    </div>
)

const TrackVisual = () => (
    <div className="w-full h-full p-6 space-y-4">
        <div className="flex justify-between items-center mb-6">
            <h4 className="text-white font-semibold">Today's Macros</h4>
        </div>
        <div className="flex justify-center py-4">
            <div className="w-32 h-32 rounded-full border-4 border-violet-500/30 border-t-violet-500 relative flex items-center justify-center">
                <div className="text-center">
                    <span className="block text-xl font-bold text-white">1,850</span>
                    <span className="text-[10px] text-slate-400">kcal left</span>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg border border-white/5" />)}
        </div>
    </div>
)

const AnalyzeVisual = () => (
    <div className="w-full h-full p-6 flex flex-col justify-end space-y-4">
        <div className="flex justify-between items-end h-32 gap-3 px-2 pb-4 border-b border-white/5">
            {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                <div key={i} className="w-full bg-violet-500/20 rounded-t-sm relative group overflow-hidden">
                    <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="absolute bottom-0 w-full bg-violet-500 rounded-t-sm"
                    />
                </div>
            ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500 font-mono">
            <span>Mon</span><span>Sun</span>
        </div>
    </div>
)

const steps = [
    {
        id: 1,
        title: "Define Your Goal",
        desc: "Tell CoreIQ your target. We build the personalized roadmap to get you there, adapting to your lifestyle.",
        icon: Target,
        Visual: PlanVisual
    },
    {
        id: 2,
        title: "Track Effortlessly",
        desc: "Log meals and workouts in seconds with our smart database. Let AI handle the heavy calculation math.",
        icon: CheckCircle,
        Visual: TrackVisual
    },
    {
        id: 3,
        title: "Analyze & Evolve",
        desc: "Weekly reports and deep insights adapt your plan based on your actual progress. A true feedback loop.",
        icon: TrendingUp,
        Visual: AnalyzeVisual
    }
]

export function PinnedSteps() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    return (
        <div ref={containerRef} id="how-it-works" className="relative h-[250vh]">
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                <div className="w-full max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                    {/* Left: Content */}
                    <div className="space-y-6 lg:space-y-12 z-20">
                        <div className="space-y-3 lg:space-y-4">
                            <Badge icon={Settings2}>Workflow</Badge>
                            <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">From ambition <br /> to <span className="text-violet-400">result.</span></h2>
                        </div>

                        <div className="relative pl-6 lg:pl-8 border-l border-white/10 space-y-8 lg:space-y-12">
                            {steps.map((step, index) => {
                                return (
                                    <OpacityStep key={step.id} index={index} progress={scrollYProgress} step={step} />
                                )
                            })}
                        </div>
                    </div>

                    {/* Right: Visual */}
                    <div className="h-[300px] lg:h-[450px] w-full relative z-10">
                        {steps.map((step, index) => {
                            return <VisualCard key={step.id} index={index} progress={scrollYProgress} Visual={step.Visual} />
                        })}
                    </div>

                </div>
            </div>
        </div>
    )
}

function OpacityStep({ index, progress, step }: { index: number, progress: any, step: any }) {
    // 0 -> 0-1
    // 1 -> 1-2 (normalized to 0.33, 0.66 in total scroll)
    const start = index / 3
    const end = (index + 1) / 3
    const center = (start + end) / 2;

    const rotateX = useTransform(progress, [start, center, end], [30, 0, -30])
    const z = useTransform(progress, [start, center, end], [-100, 0, -100])
    const opacity = useTransform(progress, [start, center, end], [0, 1, 0])
    const color = useTransform(
        progress,
        [start, center, end],
        ["rgba(148, 163, 184, 0.4)", "rgba(255, 255, 255, 1)", "rgba(148, 163, 184, 0.4)"]
    )

    return (
        <motion.div style={{ opacity, color, rotateX, z, transformStyle: "preserve-3d" }} className="transition-colors duration-300">
            <h3 className="text-lg lg:text-3xl font-bold mb-1 lg:mb-4 tracking-tight">{step.title}</h3>
            <p className="text-sm lg:text-xl leading-relaxed opacity-80 max-w-md">{step.desc}</p>
        </motion.div>
    )
}

function VisualCard({ index, progress, Visual }: { index: number, progress: any, Visual: any }) {
    const start = index / 3
    const end = (index + 1) / 3

    // Fade in/out logic
    const opacity = useTransform(progress,
        [start, start + 0.1, end - 0.1, end],
        [0, 1, 1, 0]
    )
    const y = useTransform(progress,
        [start, start + 0.1, end - 0.1, end],
        [40, 0, 0, -40]
    // Removed 'y' transform as it's not in the new instruction
    // const y = useTransform(progress,
    //     [start, start + 0.1, end - 0.1, end],
    //     [40, 0, 0, -40]
    // )

    // New transforms from instruction
    const rotateY = useTransform(progress, [start, center, end], [-15, 0, 15])
    const rotateX = useTransform(progress, [start, center, end], [10, 0, -10])
    const scale = useTransform(progress, [start, center, end], [0.8, 1, 0.8])
    const z = useTransform(progress, [start, center, end], [-200, 0, -200])

    // Using z index to stack properly
    return (
        <motion.div
            style={{ opacity, scale, rotateY, rotateX, z, transformStyle: "preserve-3d" }}
            className="absolute inset-0 flex items-center justify-center backface-hidden"
        >
            <GlassCard className="h-full w-full p-0 overflow-hidden" intensity="high">
                <Visual />
                {/* Gloss effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            </GlassCard>
        </motion.div>
    )
}
