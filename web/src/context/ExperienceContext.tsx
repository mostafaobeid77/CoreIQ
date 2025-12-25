import React, { createContext, useContext, useState, useEffect } from 'react'

type Quality = 'LOW' | 'MED' | 'HIGH'

interface ExperienceState {
    quality: Quality
    setQuality: (q: Quality) => void
    reducedMotion: boolean
    isMobile: boolean
}

const ExperienceContext = createContext<ExperienceState | undefined>(undefined)

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
    const [quality, setQuality] = useState<Quality>('HIGH')
    const [reducedMotion, setReducedMotion] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // Auto-detect mobile
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)

        // Check for reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        setReducedMotion(mediaQuery.matches)

        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
        mediaQuery.addEventListener('change', handler)

        // Initial quality auto-select
        if (window.innerWidth < 768) {
            setQuality('MED')
        }

        return () => {
            window.removeEventListener('resize', checkMobile)
            mediaQuery.removeEventListener('change', handler)
        }
    }, [])

    return (
        <ExperienceContext.Provider value={{ quality, setQuality, reducedMotion, isMobile }}>
            {children}
        </ExperienceContext.Provider>
    )
}

export function useExperience() {
    const context = useContext(ExperienceContext)
    if (!context) throw new Error('useExperience must be used within ExperienceProvider')
    return context
}
