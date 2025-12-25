import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Download', href: '#download' },
]

export function NavBar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeHref, setActiveHref] = useState('#home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = () => {
      const sections = navLinks.map(l => document.querySelector(l.href))
      const scrollPos = window.scrollY + 100
      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i]
        if (sec && (sec as HTMLElement).offsetTop <= scrollPos) {
          setActiveHref(navLinks[i].href)
          break
        }
      }
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <motion.div
          initial={false}
          animate={{
            opacity: 1,
            y: scrolled ? 10 : 20,
            width: scrolled ? '90%' : '96%',
            maxWidth: scrolled ? '64rem' : '72rem', // lg vs xl
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className={`absolute left-1/2 -translate-x-1/2 top-0 h-16 rounded-2xl -z-10`}
          style={{
            background: scrolled ? 'rgba(5, 5, 5, 0.7)' : 'transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            border: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
            boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
          }}
        />

        <nav className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10 h-16">
          {/* Logo */}
          <a href="#home" className="group flex items-center select-none pointer-events-auto">
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-violet-400 to-fuchsia-400">
              CoreIQ
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 bg-black/5 rounded-full p-1 relative z-20">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 relative ${activeHref === link.href ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                {activeHref === link.href && (
                  <motion.div
                    layoutId="navPill"
                    className="absolute inset-0 bg-white/10 rounded-full border border-white/5 shadow-inner"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            ))}
          </div>

          {/* Mobile Button */}
          <button
            type="button"
            className="lg:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10 backdrop-blur-md"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center pointer-events-auto"
          >
            <div className="flex flex-col gap-8 text-center">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-3xl font-bold text-slate-200 hover:text-violet-400 transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
