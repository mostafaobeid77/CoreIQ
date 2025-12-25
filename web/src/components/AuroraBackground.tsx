import { motion, useScroll, useTransform } from 'framer-motion'

export function AuroraBackground() {
    const { scrollYProgress } = useScroll()

    // Parallax layers
    const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"])
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 45])

    return (
        <div className="fixed inset-0 z-[-15] overflow-hidden pointer-events-none">
            {/* Deep Base */}
            <div className="absolute inset-0 bg-[#050505]" />

            {/* Blob 1: Top Left Violet */}
            <motion.div
                style={{ y: y1, rotate }}
                className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-violet-600/20 blur-[120px] rounded-full mix-blend-screen opacity-60"
            />

            {/* Blob 2: Bottom Right Indigo */}
            <motion.div
                style={{ y: y2 }}
                className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-indigo-600/15 blur-[100px] rounded-full mix-blend-screen opacity-50"
            />

            {/* Blob 3: Center Pulse */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-fuchsia-500/10 blur-[150px] rounded-full"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    )
}
