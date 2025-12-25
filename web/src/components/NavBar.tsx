import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { MagneticButton } from './ui/MagneticButton'

export function NavBar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav
            className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${scrolled
                ? 'py-3 bg-white/5 backdrop-blur-xl border-b border-white/10'
                : 'py-6 bg-transparent'
                }`}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between">
                {/* Logo */}
                <a href="#home" className="relative group">
                    <span className="text-2xl font-black tracking-tight text-white">
                        CoreIQ
                    </span>
                    <span className="absolute -inset-2 bg-white/5 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-8 bg-white/5 border border-white/10 px-8 py-2 rounded-full backdrop-blur-md">
                    <a href="#features" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Features</a>
                    <a href="#how-it-works" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">How it works</a>
                    <a href="#download" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Download</a>
                </div>

                <div className="hidden lg:block">
                    <a href="#download">
                        <MagneticButton variant="primary" className="!px-6 !py-2 !text-sm">
                            Get Early Access
                        </MagneticButton>
                    </a>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 text-white bg-white/5 border border-white/10 rounded-full transition-colors"
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden absolute top-full inset-x-0 border-b border-white/10 bg-slate-950/95 backdrop-blur-2xl"
                    >
                        <div className="flex flex-col p-8 space-y-6">
                            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Features</a>
                            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">How it works</a>
                            <a href="#download" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Download</a>
                            <div className="pt-6">
                                <a href="#download" onClick={() => setMobileMenuOpen(false)}>
                                    <MagneticButton className="w-full justify-center py-4">
                                        Get Early Access
                                    </MagneticButton>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
