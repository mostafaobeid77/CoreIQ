
export const LANDING_CONFIG = {
    layout: {
        container: "max-w-6xl mx-auto px-6 lg:px-8",
        sectionSpacing: "py-24 lg:py-32",
        headerHeight: "h-20",
    },
    motion: {
        reduceMotion: false,
        perspective: "1200px",
        fadeUp: {
            initial: { opacity: 0, y: 40, z: -100, rotateX: 10 },
            whileInView: { opacity: 1, y: 0, z: 0, rotateX: 0 },
            viewport: { once: false, margin: "-50px" }, // once: false for re-triggering cinematic feel
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1] as any
            }
        },
        tilt: {
            max: 5,
            perspective: 1000
        },
        stagger: 0.1,
    },
    typography: {
        h1: "text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white",
        h2: "text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white",
        body: "text-lg text-slate-400 leading-relaxed",
    }
}
