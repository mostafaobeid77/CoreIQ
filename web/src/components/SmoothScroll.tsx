import { ReactLenis } from '@studio-freight/react-lenis'
import type { ReactNode } from 'react'

interface SmoothScrollProps {
    children: ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
    return (
        <ReactLenis root options={{
            lerp: 0.08,
            duration: 1.2,
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        }}>
            {children}
        </ReactLenis>
    )
}
