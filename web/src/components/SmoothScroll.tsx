import Lenis from 'lenis'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface SmoothScrollProps {
    children: ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
    const lenisRef = useRef<Lenis | null>(null)
    const requestRef = useRef<number | null>(null)

    useEffect(() => {
        const lenis = new Lenis({
            lerp: 0.08,
            duration: 1.2,
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        })

        lenisRef.current = lenis

        function raf(time: number) {
            lenis.raf(time)
            requestRef.current = requestAnimationFrame(raf)
        }

        requestRef.current = requestAnimationFrame(raf)

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
            lenis.destroy()
        }
    }, [])

    return (
        <div className="smooth-scroll-container">
            {children}
        </div>
    )
}
