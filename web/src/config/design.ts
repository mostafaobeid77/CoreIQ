export const designTokens = {
    colors: {
        glass: {
            fill: "rgba(255, 255, 255, 0.03)",
            border: "rgba(255, 255, 255, 0.08)",
            highlight: "rgba(255, 255, 255, 0.12)",
        },
        brand: {
            primary: "#ffffff",
            secondary: "#94a3b8", // slate-400
            accent: {
                brain: "#818cf8", // indigo-400
                muscle: "#f87171", // red-400
            }
        },
        background: "#020617", // slate-950
    },
    glass: {
        recipe: "backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl",
        innerGlow: "inset 0 0 20px rgba(255, 255, 255, 0.02)",
    },
    spacing: {
        container: "max-w-7xl mx-auto px-6 lg:px-8",
        section: "py-24 lg:py-32",
    }
}

export const motionConfig = {
    viewport: { once: false, margin: "-10% 0px -10% 0px" },
    transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1
    },
    duration: {
        fast: 0.3,
        normal: 0.5,
        slow: 0.8,
        cinematic: 1.2
    }
}
