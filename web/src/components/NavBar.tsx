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
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = () => {
      const sections = navLinks.map(l => document.querySelector(l.href))
      const scrollPos = window.scrollY + 75
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
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: scrolled ? 0 : -10, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        style={{
          background: scrolled ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(16px)',
          border: scrolled ? '1px solid #333333' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
        }}
        className="absolute left-1/2 top-2 -translate-x-1/2 max-w-6xl w-[96%] rounded-2xl transition-all duration-500"
      />
      <nav className="relative mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl px-7 py-3 md:px-10">
        {/* Logo Text */}
        <a href="#home" className="group flex items-center select-none">
          <motion.span
            className="text-2xl font-black tracking-tight"
            whileHover={{ scale: 1.02 }}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            CoreIQ
          </motion.span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => (
            <motion.a
              key={link.href}
              href={link.href}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className={`px-3 py-2 font-medium transition-colors duration-200 text-sm tracking-tight ${activeHref === link.href
                  ? 'text-violet-400'
                  : 'text-white/70 hover:text-white'
                }`}
            >
              {link.label}
            </motion.a>
          ))}

          {/* Admin Link */}
          <motion.a
            href="/admin"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: '#a78bfa',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            Admin
          </motion.a>
        </div>

        {/* Mobile Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl transition-all lg:hidden"
          style={{
            backgroundColor: '#121212',
            border: '1px solid #333333',
            color: '#ffffff',
          }}
          onClick={() => setOpen(val => !val)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} strokeWidth={1.8} /> : <Menu size={24} strokeWidth={1.8} />}
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] backdrop-blur-lg"
            style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          >
            <motion.div
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="mx-auto mt-16 w-[96%] max-w-sm rounded-3xl p-7 shadow-2xl flex flex-col gap-6"
              style={{ backgroundColor: '#121212', border: '1px solid #333333' }}
            >
              <div className="flex items-center mb-2">
                <span
                  className="text-2xl font-black"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  CoreIQ
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`block text-lg px-5 py-3 rounded-xl font-semibold transition-all ${activeHref === link.href
                        ? 'text-violet-400 bg-violet-400/10'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {link.label}
                  </motion.a>
                ))}
                <motion.a
                  href="/admin"
                  onClick={() => setOpen(false)}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="block text-lg px-5 py-3 rounded-xl font-semibold mt-2"
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                  }}
                >
                  Admin Panel
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
