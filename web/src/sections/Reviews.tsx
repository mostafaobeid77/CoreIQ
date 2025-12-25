
import { SceneSection } from '../components/SceneSection'
import { GlassCard } from '../components/ui/GlassCard'
import { Badge } from '../components/ui/Badge'
import { Star, Quote } from 'lucide-react'
import { motion } from 'framer-motion'

const reviews = [
    {
        id: 1,
        author: "Sarah J.",
        role: "Fitness Enthusiast",
        text: "Finally an app that adapts to MY schedule. The macro tracking is actually fun.",
        rating: 5
    },
    {
        id: 2,
        author: "Mike T.",
        role: "Powerlifter",
        text: "CoreIQ's AI coaching spotted a plateau I didn't see. Added 15lbs to my squat in a month.",
        rating: 5
    },
    {
        id: 3,
        author: "Elena R.",
        role: "Yoga Instructor",
        text: "Beautiful design and deep insights. It doesn't just track numbers, it tracks wellness.",
        rating: 5
    }
]

export function Reviews() {
    return (
        <SceneSection id="reviews">
            <div className="flex flex-col items-center text-center mb-16 space-y-4">
                <Badge icon={Star}>Community Stories</Badge>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
                    Results speak <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                        louder.
                    </span>
                </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {reviews.map((review, i) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <GlassCard className="h-full flex flex-col justify-between" intensity="low">
                            <div className="space-y-4">
                                <Quote className="w-8 h-8 text-violet-500/50" />
                                <p className="text-slate-300 leading-relaxed">"{review.text}"</p>
                            </div>
                            <div className="mt-8 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                                    {review.author[0]}
                                </div>
                                <div>
                                    <div className="font-semibold text-white">{review.author}</div>
                                    <div className="text-xs text-slate-500">{review.role}</div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </SceneSection>
    )
}
