import { motion, useScroll, type MotionValue, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Badge } from './ui/Badge'
import { Settings2, BookOpen, Activity, Layout } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'

const steps = [
    {
        id: 'plan',
        title: 'I. The Genesis',
        desc: 'CoreIQ deconstructs your biological baseline. Our AI blueprint transforms raw statistics into a dynamic mandate for evolution.',
        icon: BookOpen,
        Visual: PlanVisual
    },
    {
        id: 'track',
        title: 'II. The Feedback Loop',
        desc: 'As you move, the engine learns. Every set, every gram, every heartbeat is ingested to calibrate your trajectory in real-time.',
        icon: Activity,
        Visual: TrackVisual
    },
    {
        id: 'results',
        title: 'III. The Singularity',
        desc: 'Ambition becomes destination. predictive analytics reveal the exact moment your vision becomes your reality. Zero guesswork.',
        icon: Layout,
        Visual: AnalyzeVisual
    }
]

function PlanVisual() {
    return (
        <div className="flex flex-col gap-4 p-8">
            <div className="h-12 w-3/4 bg-violet-500/10 rounded-lg animate-pulse" />
            <div className="grid grid-cols-7 gap-2">
                {[...Array(21)].map((_, i) => (
                    <div key={i} className={`h-8 rounded ${i < 10 ? 'bg-violet-500/40' : 'bg-slate-800'}`} />
                ))}
            </div>
            <div className="h-24 w-full bg-slate-800/50 rounded-xl" />
        </div>
    )
}

function TrackVisual() {
    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-slate-800 rounded-full" />
                <div className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <div className="h-4 w-4 bg-violet-400 rounded-full" />
                </div>
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 w-full bg-gradient-to-r from-violet-500/5 to-transparent border border-white/5 rounded-xl flex items-center px-4">
                        <div className="h-8 w-8 rounded bg-slate-800" />
                        <div className="ml-4 h-4 w-24 bg-slate-700 rounded" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function AnalyzeVisual() {
    return (
        <div className="flex flex-col gap-4 p-8">
            <div className="flex gap-2">
                {[40, 70, 45, 90, 65].map((h, i) => (
                    <div key={i} className="flex-1 bg-violet-500/20 rounded-t-lg relative group overflow-hidden">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            className="absolute bottom-0 inset-x-0 bg-violet-500/40"
                        />
                    </div>
                ))}
            </div>
            <div className="h-32 w-full bg-slate-800/30 rounded-2xl flex items-center justify-center border border-white/5">
                <div className="text-violet-400 font-mono text-2xl">Goal: -4.2kg</div>
            </div>
        </div>
    )
}

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

                        <div className="relative pl-6 lg:pl-8 border-l border-white/10 space-y-8 lg:space-y-12 perspective-container">
                            {steps.map((step, index) => {
                                return (
                                    <OpacityStep key={step.id} index={index} progress={scrollYProgress} step={step} />
                                )
                            })}
                        </div>
                    </div>

                    {/* Right: Visual */}
                    <div className="h-[300px] lg:h-[450px] w-full relative z-10 perspective-container">
                        {steps.map((step, index) => {
                            return <VisualCard key={step.id} index={index} progress={scrollYProgress} Visual={step.Visual} />
                        })}
                    </div>

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
    const start = index / 3
    const end = (index + 1) / 3
    const center = (start + end) / 2

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

function VisualCard({ index, progress, Visual }: { index: number, progress: MotionValue<number>, Visual: React.ElementType }) {
    const start = index / 3
    const end = (index + 1) / 3
    const center = (start + end) / 2

    const opacity = useTransform(progress, [start, center, end], [0, 1, 0])
    const rotateY = useTransform(progress, [start, center, end], [-15, 0, 15])
    const rotateX = useTransform(progress, [start, center, end], [10, 0, -10])
    const scale = useTransform(progress, [start, center, end], [0.8, 1, 0.8])
    const z = useTransform(progress, [start, center, end], [-200, 0, -200])

    return (
        <motion.div
            style={{ opacity, scale, rotateY, rotateX, z, transformStyle: "preserve-3d" }}
            className="absolute inset-0 flex items-center justify-center backface-hidden"
        >
            <GlassCard className="h-full w-full p-0 overflow-hidden" intensity="high">
                <Visual />
            </GlassCard>
        </motion.div>
    )
}
