
import type { ReactNode } from 'react'
// import ReactLenis from '@studio-freight/react-lenis' // Assuming Lenis might be used later, but for now standard div

interface ScrollExperienceProps {
    children: ReactNode
}

export function ScrollExperience({ children }: ScrollExperienceProps) {
    // For now, a simple wrapper. We can add smooth scrolling (Lenis) here later if requested.
    return (
        <div className="w-full relative perspective-container preserve-3d">
            {children}
        </div>
    )
}
