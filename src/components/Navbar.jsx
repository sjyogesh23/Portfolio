import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSun, FiMoon, FiMenu, FiX, FiDownload } from 'react-icons/fi'
import { useThemeContext, useConfigContext } from '@/App'
import { useDocument } from '@/hooks/useFirestore'
import ResumeModal from './ResumeModal'

const ALL_NAV_LINKS = [
  { label: 'About',        href: 'about',          group: 'main' },
  { label: 'Skills',       href: 'skills',         group: 'main' },
  { label: 'Projects',     href: 'projects',       group: 'main' },
  { label: 'Experience',   href: 'experience',     group: 'main' },
  { label: 'Seminars',     href: 'seminars',       group: 'more' },
  { label: 'Hackathons',   href: 'hackathons',     group: 'more' },
  { label: 'Publications', href: 'publications',   group: 'more' },
  { label: 'Certifications',href:'certifications', group: 'more' },
  { label: 'Contact',      href: 'contact',        group: 'main' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Navbar() {
  const { isDark, toggleTheme }   = useThemeContext()
  const { config }                = useConfigContext()
  const { data: hero }            = useDocument('hero', 'main')
  const navbarConf                = config?.navbar ?? {}
  const linkVis                   = navbarConf.links ?? {}
  const showResume                = navbarConf.showResumeButton !== false
  const isSticky                  = navbarConf.sticky !== false

  // Build nav links respecting visibility config + label overrides
  const labelOverrides = navbarConf.linkLabels ?? {}
  const applyLabel     = (l) => ({ ...l, label: labelOverrides[l.href]?.trim() || l.label })
  const visibleLinks   = ALL_NAV_LINKS.filter(l => linkVis[l.href] !== false).map(applyLabel)
  const mainLinks      = visibleLinks.filter(l => l.group === 'main')
  const moreLinks      = visibleLinks.filter(l => l.group === 'more')
  const NAV_LINKS      = [
    ...mainLinks.filter(l => l.href !== 'contact'),
    ...(moreLinks.length > 0 ? [{ label: labelOverrides['more']?.trim() || 'More', children: moreLinks }] : []),
    ...mainLinks.filter(l => l.href === 'contact'),
  ]

  const [scrolled,      setScrolled]      = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [moreOpen,      setMoreOpen]      = useState(false)
  const [resumeOpen,    setResumeOpen]    = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  // Scrolled glass effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    const ids = ['hero','about','skills','projects','experience','seminars','hackathons','publications','certifications','contact']
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id) })
      },
      { threshold: 0.3 }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  const initials = navbarConf.logoText
    ? navbarConf.logoText.slice(0, 2).toUpperCase()
    : hero?.name
      ? hero.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
      : 'Y'

  return (
    <>
      <motion.nav
        className={`
          ${isSticky ? 'fixed' : 'absolute'} top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled ? 'glass shadow-lg py-2' : 'bg-transparent py-4'}
        `}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollTo('hero')}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white gradient-text border border-primary/40 bg-primary/10 group-hover:bg-primary/20 transition-colors">
              {initials}
            </div>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.label} className="relative">
                  <button
                    onClick={() => setMoreOpen((o) => !o)}
                    onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${moreOpen ? 'text-primary bg-primary/10' : 'text-muted hover:text-ctext hover:bg-surface'}`}
                  >
                    {link.label} ▾
                  </button>
                  <AnimatePresence>
                    {moreOpen && (
                      <motion.div
                        className="absolute top-full right-0 mt-2 glass rounded-xl shadow-xl p-1.5 min-w-[160px]"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                      >
                        {link.children.map((child) => (
                          <button
                            key={child.href}
                            onClick={() => { scrollTo(child.href); setMoreOpen(false) }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted hover:text-ctext hover:bg-surface/80 transition-colors"
                          >
                            {child.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${activeSection === link.href
                      ? 'text-primary'
                      : 'text-muted hover:text-ctext hover:bg-surface'
                    }`}
                >
                  {link.label}
                  {activeSection === link.href && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </button>
              )
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {showResume && (
              <button
                onClick={() => setResumeOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
              >
                <FiDownload size={14} />
                Resume
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-ctext"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? 'sun' : 'moon'}
                  initial={{ rotate: -30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 30, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors text-muted"
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col glass-dark pt-20 pb-8 px-6 md:hidden"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <nav className="flex flex-col gap-1 mt-4">
              {NAV_LINKS.flatMap((link) =>
                link.children
                  ? link.children.map((child) => (
                      <button
                        key={child.href}
                        onClick={() => { scrollTo(child.href); setMobileOpen(false) }}
                        className="text-left px-4 py-3 rounded-xl text-muted hover:text-ctext hover:bg-surface/60 transition-colors text-base"
                      >
                        {child.label}
                      </button>
                    ))
                  : [
                      <button
                        key={link.href}
                        onClick={() => { scrollTo(link.href); setMobileOpen(false) }}
                        className={`text-left px-4 py-3 rounded-xl transition-colors text-base font-medium
                          ${activeSection === link.href ? 'text-primary bg-primary/10' : 'text-muted hover:text-ctext hover:bg-surface/60'}`}
                      >
                        {link.label}
                      </button>,
                    ]
              )}
            </nav>
            <div className="mt-auto pt-8 border-t border-border">
              <button
                onClick={() => { setResumeOpen(true); setMobileOpen(false) }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-medium"
              >
                <FiDownload size={16} />
                View / Download Resume
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResumeModal
        isOpen={resumeOpen}
        onClose={() => setResumeOpen(false)}
        resumeUrl={hero?.resumeUrl}
      />
    </>
  )
}
