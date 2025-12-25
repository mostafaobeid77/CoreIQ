import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'

export function BioThread() {
    const threadRef = useRef<SVGSVGElement>(null)
    const { scrollYProgress } = useScroll()

    // Draw the path as we scroll
    const pathLength = useSpring(scrollYProgress, { stiffness: 400, damping: 90 })

    // Pulse intensity based on scroll
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.8, 0.3])

    return (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <svg
                ref={threadRef}
                viewBox="0 0 100 1000"
                preserveAspectRatio="none"
                className="w-full h-[5000px] opacity-20"
            >
                {/* Background Shadow Link */}
                <motion.path
                    d="M 50 0 Q 60 250 40 500 Q 20 750 50 1000"
                    fill="none"
                    stroke="rgba(139, 92, 246, 0.1)"
                    strokeWidth="0.5"
                    style={{ pathLength }}
                />

                {/* Glowing Core Link */}
                <motion.path
                    d="M 50 0 Q 60 250 40 500 Q 20 750 50 1000"
                    fill="none"
                    stroke="url(#thread-gradient)"
                    strokeWidth="0.2"
                    style={{
                        pathLength,
                        opacity
                    }}
                />

                <defs>
                    <linearGradient id="thread-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Ambient Data Particles floating along the thread */}
            <FloatingData top="10%" left="45%" scroll={scrollYProgress} />
            <FloatingData top="30%" left="55%" scroll={scrollYProgress} />
            <FloatingData top="60%" left="35%" scroll={scrollYProgress} />
            <FloatingData top="85%" left="50%" scroll={scrollYProgress} />
        </div>
    )
}

function FloatingData({ top, left, scroll }: any) {
    const y = useTransform(scroll, [0, 1], [0, -200])
    return (
        <motion.div
            style={{ top, left, y }}
            className="absolute w-1 h-1 bg-violet-400/40 rounded-full blur-[1px]"
        />
    )
}
