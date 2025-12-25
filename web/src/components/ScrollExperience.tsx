import { motion, useScroll, useTransform } from 'framer-motion'
import { PhoneMockup } from './PhoneMockup'

export function ScrollExperience({ children }: { children: React.ReactNode }) {
    const { scrollYProgress } = useScroll()

    // Animation Keyframes
    // 0% -> Hero (Right side)
    // 35% -> Features (Left side) 
    // 75% -> HowItWorks (Center)
    // 100% -> Footer (Exit)

    const x = useTransform(scrollYProgress,
        [0, 0.35, 0.75, 1],
        ["60%", "15%", "50%", "50%"]
    )

    const y = useTransform(scrollYProgress,
        [0, 0.35, 0.75, 1],
        ["15%", "20%", "10%", "-50%"]
    )

    const rotate = useTransform(scrollYProgress,
        [0, 0.35, 0.75],
        [-5, 5, 0]
    )

    const scale = useTransform(scrollYProgress,
        [0, 0.35, 0.75],
        [1, 0.9, 1.1]
    )

    const opacity = useTransform(scrollYProgress,
        [0, 0.85, 1],
        [1, 1, 0]
    )

    return (
        <div className="relative min-h-screen">
            {/* Desktop Sticky Phone */}
            <div className="fixed inset-0 pointer-events-none z-0 hidden lg:block overflow-hidden">
                <motion.div
                    style={{ left: x, top: y, rotate, scale, opacity, x: "-50%" }}
                    className="absolute w-[350px] origin-center"
                >
                    {/* Glow behind phone */}
                    <div className="absolute inset-0 bg-violet-500/20 blur-[100px] rounded-full z-[-1]" />
                    <PhoneMockup />
                </motion.div>
            </div>

            {/* Scrollable Content */}
            <div className="relative z-10 w-full">
                {children}
            </div>
        </div>
    )
}
