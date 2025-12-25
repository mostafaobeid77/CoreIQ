
export const LANDING_CONFIG = {
    layout: {
        container: "max-w-6xl mx-auto px-6 lg:px-8",
        sectionSpacing: "py-24 lg:py-32",
        headerHeight: "h-20",
    },
    motion: {
        reduceMotion: false, // Should be hooked to media query in real implementation
        fadeUp: {
            initial: { opacity: 0, y: 16, scale: 0.98 },
            whileInView: { opacity: 1, y: 0, scale: 1 },
            viewport: { once: true, margin: "-100px" },
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as any // cubic-bezier custom
            }
        },
        stagger: 0.1,
    },
    typography: {
        h1: "text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white",
        h2: "text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white",
        body: "text-lg text-slate-400 leading-relaxed",
    }
}
