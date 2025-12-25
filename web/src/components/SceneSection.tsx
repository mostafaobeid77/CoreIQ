import { motion, useScroll, useTransform, type Variants } from 'framer-motion'
import { cn } from '../utils/cn'
import { type ReactNode, useRef } from 'react'


interface SceneSectionProps {
    children: ReactNode
    className?: string
    id?: string
    type?: 'fade' | 'spotlight' | 'zoom'
}

export function SceneSection({ children, className, id, type = 'fade' }: SceneSectionProps) {
    const ref = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    // Parallax / Zoom effect for all scenes
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95])
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])



    // Continuous motion style
    const motionStyle = type === 'zoom' ? { scale, opacity } : {}

    const variants: Variants = {
        hidden: {
            opacity: 0,
            filter: 'blur(10px)',
            scale: 0.95
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            scale: 1,
            transition: {
                duration: 1,
                ease: [0.22, 1, 0.36, 1] as const
            }
        }
    }

    const spotlightVariants: Variants = {
        hidden: { clipPath: "circle(0% at 50% 50%)", opacity: 0 },
        visible: {
            clipPath: "circle(150% at 50% 50%)",
            opacity: 1,
            transition: {
                duration: 1.5,
                ease: [0.22, 1, 0.36, 1] as const
            }
        }
    }

    return (
        <section
            id={id}
            ref={ref}
            className={cn("relative min-h-[50vh] flex items-center justify-center py-24", className)}
        >
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-10%" }}
                variants={type === 'spotlight' ? spotlightVariants : variants}
                style={motionStyle}
                className="w-full max-w-7xl mx-auto px-6"
            >
                {children}
            </motion.div>
        </section>
    )
}
