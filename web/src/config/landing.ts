export const LANDING_CONFIG = {
    layout: {
        container: "max-w-7xl mx-auto px-6 lg:px-12",
        sectionSpacing: "py-32 lg:py-48", // More breathing room for cinematic feel
        headerHeight: "h-20",
    },
    motion: {
        reduceMotion: false,
        perspective: "1500px", // Deeper perspective
        fadeUp: {
            initial: { opacity: 0, y: 60, z: -150, rotateX: 20 },
            whileInView: { opacity: 1, y: 0, z: 0, rotateX: 0 },
            viewport: { once: false, margin: "-10% 0px -10% 0px" },
            transition: {
                duration: 1.2, // Cinematic duration
                ease: [0.16, 1, 0.3, 1] as any
            }
        },
        stagger: 0.15,
    },
    styles: {
        glass: {
            recipe: "backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]",
            glow: "shadow-[0_0_20px_rgba(255,255,255,0.05)]",
        },
        gradient: "text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40",
    },
    typography: {
        h1: "text-6xl sm:text-7xl lg:text-9xl font-black tracking-tighter text-white",
        h2: "text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white",
        body: "text-xl text-slate-400 leading-relaxed font-medium",
    }
}
