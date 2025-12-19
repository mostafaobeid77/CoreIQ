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
  const [darkNav, setDarkNav] = useState(false)

  // ✅ Detect scroll for transparency/shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ✅ Highlight active link based on scroll
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

  // ✅ Switch nav color based on visible section
  useEffect(() => {
	const handleNavStyle = () => {
	  // adjust trigger point: ~30% from top instead of middle
	  const y = window.scrollY + window.innerHeight * 0.3 
  
	  const home = document.querySelector('#home') as HTMLElement | null
	  const about = document.querySelector('#about') as HTMLElement | null
	  const features = document.querySelector('#features') as HTMLElement | null
	  const download = document.querySelector('#download') as HTMLElement | null
  
	  let dark = true // default
  
	  // Light nav (white text) in Home + Features
	  if (
		(home && y >= home.offsetTop && about && y < about.offsetTop) ||
		(features && download && y >= features.offsetTop && y < download.offsetTop)
	  ) {
		dark = false
	  }
	  // Dark nav (dark text) in About + Download
	  else if (
		(about && features && y >= about.offsetTop && y < features.offsetTop) ||
		(download && y >= download.offsetTop)
	  ) {
		dark = true
	  }
  
	  setDarkNav(dark)
	}
  
	window.addEventListener('scroll', handleNavStyle, { passive: true })
	handleNavStyle()
	return () => window.removeEventListener('scroll', handleNavStyle)
  }, [])
  
  

  // ✅ Prevent body scroll when mobile menu is open
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
        animate={{ opacity: 1, y: scrolled ? 0 : -18, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        style={{
          background: scrolled ? 'rgba(16,20,32,0.82)' : 'rgba(16,20,32,0.55)',
          backdropFilter: 'blur(16px)',
          border: scrolled ? '1.5px solid rgba(99,102,241,0.10)' : '1.5px solid transparent',
          boxShadow: scrolled ? '0 4px 36px rgba(18,16,47,0.16)' : 'none',
        }}
        className="absolute left-1/2 top-2 -translate-x-1/2 max-w-6xl w-[96%] rounded-2xl shadow-xl transition-all duration-500 border border-transparent"
      />
      <nav
        className={`relative mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl px-7 py-3 md:px-10 ${
          darkNav ? 'text-slate-800' : 'text-slate-100'
        }`}
      >
        <span
          className={`text-xl font-extrabold tracking-tight transition select-none drop-shadow-sm ${
            darkNav ? 'text-slate-800' : 'text-slate-100'
          }`}
        >
          CoreIQ
        </span>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`px-2 py-1 font-semibold transition-all duration-200 rounded-lg text-base tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 ${
                activeHref === link.href
                  ? darkNav
                    ? 'text-indigo-600'
                    : 'text-indigo-300'
                  : darkNav
                    ? 'text-slate-800 hover:text-indigo-600'
                    : 'text-slate-100 hover:text-indigo-200'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile Button */}
        <button
          type="button"
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${
            darkNav ? 'border-slate-300 text-slate-700' : 'border-slate-700 text-slate-100'
          } transition-all lg:hidden shadow`}
          onClick={() => setOpen(val => !val)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} strokeWidth={1.8} /> : <Menu size={24} strokeWidth={1.8} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-slate-900/90 backdrop-blur-lg"
          >
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
              className={`mx-auto mt-16 w-[96%] max-w-sm rounded-3xl border ${
                darkNav ? 'border-slate-300 bg-white/90' : 'border-slate-800 bg-slate-950/95'
              } p-7 shadow-2xl flex flex-col gap-6`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`text-lg font-extrabold tracking-tight ${
                    darkNav ? 'text-slate-800' : 'text-slate-100'
                  }`}
                >
                  CoreIQ
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {navLinks.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block text-lg px-5 py-3 rounded-xl font-semibold transition-all ${
                      activeHref === link.href
                        ? darkNav
                          ? 'text-indigo-600'
                          : 'text-indigo-300'
                        : darkNav
                          ? 'text-slate-800 hover:text-indigo-600'
                          : 'text-slate-100 hover:text-indigo-200'
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
