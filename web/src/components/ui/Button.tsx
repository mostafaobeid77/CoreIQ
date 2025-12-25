import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../utils/cn'
import type { ReactNode } from 'react'

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    children: ReactNode
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    children,
    ...props
}: ButtonProps) {
    const variants = {
        primary: "bg-white text-black hover:bg-slate-200 border border-transparent shadow-[0_0_20px_rgba(255,255,255,0.15)]",
        secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/10 backdrop-blur-sm",
        ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5"
    }

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    )
}
