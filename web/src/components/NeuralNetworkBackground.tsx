import { useEffect, useRef } from 'react'


export function NeuralNetworkBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let width = canvas.width = window.innerWidth
        let height = canvas.height = window.innerHeight

        const particles: { x: number, y: number, vx: number, vy: number, size: number }[] = []
        const particleCount = width > 768 ? 80 : 40
        const connectionDistance = 180

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2 + 1
            })
        }

        function animate() {
            if (!ctx || !canvas) return
            ctx.clearRect(0, 0, width, height)

            particles.forEach((p, i) => {
                p.x += p.vx
                p.y += p.vy

                if (p.x < 0 || p.x > width) p.vx *= -1
                if (p.y < 0 || p.y > height) p.vy *= -1

                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(139, 92, 246, 0.4)'
                ctx.fill()

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j]
                    const dx = p.x - p2.x
                    const dy = p.y - p2.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < connectionDistance) {
                        ctx.beginPath()
                        ctx.moveTo(p.x, p.y)
                        ctx.lineTo(p2.x, p2.y)
                        const opacity = 1 - (distance / connectionDistance)
                        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.15})`
                        ctx.lineWidth = 1
                        ctx.stroke()
                    }
                }
            })
            requestAnimationFrame(animate)
        }
        const animationId = requestAnimationFrame(animate)

        const handleResize = () => {
            if (canvas) {
                width = canvas.width = window.innerWidth
                height = canvas.height = window.innerHeight
            }
        }
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(animationId)
        }
    }, [])

    return (
        <div className="absolute inset-0 overflow-hidden bg-[#050505]">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0a0a0a] to-[#050505]" />
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]" />
            <canvas ref={canvasRef} className="absolute inset-0 block" />
        </div>
    )
}
