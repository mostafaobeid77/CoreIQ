import { motion, useScroll, useTransform } from 'framer-motion'

export function ExperienceNarrative() {
    const { scrollYProgress } = useScroll()

    const chapters = [
        { id: 0, label: "GENESIS", pos: 0.1 },
        { id: 1, label: "NEURAL_ENGINE", pos: 0.4 },
        { id: 2, label: "SINGULARITY", pos: 0.7 },
        { id: 3, label: "EVOLUTION", pos: 0.9 }
    ]

    return (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-12 items-end">
            <div className="absolute right-[3px] top-0 bottom-0 w-[1px] bg-white/5" />
            <motion.div
                style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
                className="absolute right-[3px] top-0 bottom-0 w-[1px] bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
            />

            {chapters.map((chapter) => (
                <ChapterPoint key={chapter.id} chapter={chapter} scroll={scrollYProgress} />
            ))}
        </div>
    )
}

function ChapterPoint({ chapter, scroll }: any) {
    const opacity = useTransform(scroll, [chapter.pos - 0.1, chapter.pos, chapter.pos + 0.1], [0.3, 1, 0.3])
    const x = useTransform(scroll, [chapter.pos - 0.1, chapter.pos, chapter.pos + 0.1], [0, -10, 0])
    const scale = useTransform(scroll, [chapter.pos - 0.1, chapter.pos, chapter.pos + 0.1], [0.8, 1, 0.8])

    return (
        <motion.div
            style={{ opacity, x, scale }}
            className="flex items-center gap-4 group"
        >
            <span className="text-[10px] font-black tracking-widest text-white/50 group-hover:text-white transition-colors">
                {chapter.label}
            </span>
            <div className="w-2 h-2 rounded-full border border-white/20 bg-slate-950 z-10 relative">
                <motion.div
                    style={{ opacity }}
                    className="absolute inset-0 rounded-full bg-violet-500 blur-[4px]"
                />
            </div>
        </motion.div>
    )
}
