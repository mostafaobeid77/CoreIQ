import { useEffect, useRef } from 'react'

export function Particles() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let width = canvas.width = window.innerWidth
        let height = canvas.height = window.innerHeight

        const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = []
        const particleCount = 40 // Reduced for subtlety

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.2, // Very slow
                vy: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.3 + 0.1
            })
        }

        let animationId: number

        const animate = () => {
            if (!ctx || !canvas) return
            ctx.clearRect(0, 0, width, height)

            particles.forEach(p => {
                p.x += p.vx
                p.y += p.vy

                if (p.x < 0) p.x = width
                if (p.x > width) p.x = 0
                if (p.y < 0) p.y = height
                if (p.y > height) p.y = 0

                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})` // Violet tint
                ctx.fill()
            })

            animationId = requestAnimationFrame(animate)
        }

        animate()

        const resize = () => {
            width = canvas.width = window.innerWidth
            height = canvas.height = window.innerHeight
        }

        window.addEventListener('resize', resize)
        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none opacity-30"
        />
    )
}
