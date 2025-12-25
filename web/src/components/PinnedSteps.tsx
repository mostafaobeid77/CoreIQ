import { motion } from 'framer-motion'
import { Badge } from './ui/Badge'
import { Settings2, BookOpen, Activity, Layout } from 'lucide-react'
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

// Visual components for the steps
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
                                className={`h-full rounded-full ${i === 0 ? 'bg-emerald-400' : i === 1 ? 'bg-blue-400' : 'bg-violet-400'}`}
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

export function PinnedSteps() {
    return (
        <div id="how-it-works" className="relative min-h-screen py-32">
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
