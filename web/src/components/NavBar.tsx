
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { MagneticButton } from './ui/MagneticButton'

export function NavBar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
                    ? 'py-4 bg-[#020202]/80 backdrop-blur-md border-b border-white/5'
                    : 'py-6 bg-transparent'
                }`}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between">
                {/* Logo */}
                <a href="#home" className="relative group">
                    <span className="text-2xl font-black tracking-tight text-white">
                        CoreIQ
                    </span>
                    <span className="absolute -inset-2 bg-violet-500/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
                    <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How it works</a>
                    <a href="#reviews" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Reviews</a>
                </div>

                {/* CTA */}
                <div className="hidden lg:block">
                    <MagneticButton className="!px-6 !py-2 !text-sm">
                        Get Started
                    </MagneticButton>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden overflow-hidden bg-[#020202] border-b border-white/10"
                    >
                        <div className="flex flex-col p-6 space-y-4">
                            <a href="#features" className="text-lg font-medium text-slate-300">Features</a>
                            <a href="#how-it-works" className="text-lg font-medium text-slate-300">How it works</a>
                            <a href="#reviews" className="text-lg font-medium text-slate-300">Reviews</a>
                            <div className="pt-4">
                                <MagneticButton className="w-full justify-center">
                                    Get Started
                                </MagneticButton>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
