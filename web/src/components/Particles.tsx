
import { useEffect, useRef } from 'react'

export function Particles() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let particles: Particle[] = []

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        class Particle {
            x: number
            y: number
            size: number
            speedX: number
            speedY: number
            opacity: number

            constructor() {
                this.x = Math.random() * (canvas?.width || 0)
                this.y = Math.random() * (canvas?.height || 0)
                this.size = Math.random() * 2
                this.speedX = Math.random() * 0.5 - 0.25
                this.speedY = Math.random() * 0.5 - 0.25
                this.opacity = Math.random() * 0.5 + 0.1
            }

            update() {
                this.x += this.speedX
                this.y += this.speedY

                if (this.x > (canvas?.width || 0)) this.x = 0
                if (this.x < 0) this.x = (canvas?.width || 0)
                if (this.y > (canvas?.height || 0)) this.y = 0
                if (this.y < 0) this.y = (canvas?.height || 0)
            }

            draw() {
                if (!ctx) return
                ctx.fillStyle = `rgba(139, 92, 246, ${this.opacity})` // Violet color
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        const init = () => {
            particles = []
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle())
            }
        }

        const animate = () => {
            if (!ctx || !canvas) return
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach((particle) => {
                particle.update()
                particle.draw()
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        window.addEventListener('resize', resizeCanvas)
        resizeCanvas()
        init()
        animate()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none opacity-40"
        />
    )
}
