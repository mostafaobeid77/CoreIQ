import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Section } from './ui/Section'
import { Badge } from './ui/Badge'
import { Settings2, Target, BarChart3, TrendingUp } from 'lucide-react'

const steps = [
    {
        id: 1,
        title: "Define Your Goal",
        desc: "Tell CoreIQ your target. We build the roadmap.",
        icon: Target
    },
    {
        id: 2,
        title: "Track Effortlessly",
        desc: "Log meals and workouts in seconds. AI handles the math.",
        icon: BarChart3
    },
    {
        id: 3,
        title: "Analyze & Evolve",
        desc: "Weekly reports adapt your plan for continuous progress.",
        icon: TrendingUp
    }
]

export function PinnedSteps() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    return (
        <div ref={containerRef} className="relative h-[300vh] z-10">
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center">
                {/* Background Focus Light for this scene */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/10 blur-[150px] rounded-full pointer-events-none" />

                <div className="relative z-10 text-center space-y-8 p-6">
                    <Badge icon={Settings2}>Workflow</Badge>

                    <div className="relative h-[200px] w-full max-w-2xl flex items-center justify-center">
                        {steps.map((step, index) => {
                            // Define range for this step
                            const start = index / steps.length
                            const end = (index + 1) / steps.length
                            const mid = (start + end) / 2

                            // Transform: Fade in, Fade out
                            const opacity = useTransform(scrollYProgress,
                                [start, start + 0.1, end - 0.1, end],
                                [0, 1, 1, 0]
                            )
                            const scale = useTransform(scrollYProgress,
                                [start, mid, end],
                                [0.8, 1, 0.8]
                            )
                            const y = useTransform(scrollYProgress,
                                [start, end],
                                [50, -50]
                            )

                            return (
                                <motion.div
                                    key={step.id}
                                    style={{ opacity, scale, y }}
                                    className="absolute inset-0 flex flex-col items-center justify-center"
                                >
                                    <div className="text-[120px] font-black text-white/5 leading-none absolute -top-12 select-none">
                                        0{step.id}
                                    </div>
                                    <h3 className="text-4xl md:text-6xl font-bold text-white mb-6 relative z-10">
                                        {step.title}
                                    </h3>
                                    <p className="text-xl text-slate-400 max-w-md mx-auto text-balance">
                                        {step.desc}
                                    </p>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
