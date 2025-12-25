import { Section } from '../components/ui/Section'
import { Badge } from '../components/ui/Badge'
import { Star, Quote } from 'lucide-react'
import { motion } from 'framer-motion'

const reviews = [
    {
        quote: "CoreIQ completely changed how I track my progress. The AI suggestions are actually useful.",
        author: "Alex M.",
        role: "Powerlifter",
        rating: 5
    },
    {
        quote: "Finally an app that combines nutrition and training without feeling clunky. Love the dark mode!",
        author: "Sarah J.",
        role: "Yoga Instructor",
        rating: 5
    },
    {
        quote: "The analytics are insane. I can see exactly why my bench press stalled and how to fix it.",
        author: "David K.",
        role: "Fitness Enthusiast",
        rating: 5
    }
]

export function Testimonials() {
    return (
        <Section className="bg-white/[0.02] border-y border-white/5">
            <div className="flex flex-col items-center text-center mb-16 space-y-4">
                <Badge icon={Star}>Community</Badge>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                    Loved by <span className="text-violet-400">athletes.</span>
                </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {reviews.map((review, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-2xl bg-slate-900/50 border border-white/10 relative overflow-hidden"
                    >
                        <Quote className="absolute top-4 right-4 w-12 h-12 text-white/5 -rotate-12" />

                        <div className="flex gap-1 text-orange-400 mb-6">
                            {[...Array(review.rating)].map((_, j) => (
                                <Star key={j} className="w-4 h-4 fill-current" />
                            ))}
                        </div>

                        <p className="text-slate-300 mb-6 italic leading-relaxed">"{review.quote}"</p>

                        <div>
                            <p className="font-bold text-white">{review.author}</p>
                            <p className="text-slate-500 text-sm">{review.role}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Section>
    )
}
