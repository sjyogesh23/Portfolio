import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiArrowDown, FiMail, FiFileText } from 'react-icons/fi'
import { useDocument } from '@/hooks/useFirestore'
import ParticleBackground from '@/components/ParticleBackground'
import ResumeModal from '@/components/ResumeModal'
import DefaultImage from '@/components/ui/DefaultImage'
import { SkeletonHero } from '@/components/ui/Skeleton'
import { SectionIdContext } from '@/components/ui/SectionWrapper'
import FieldGate from '@/components/ui/FieldGate'
import toast from 'react-hot-toast'

function useTypewriter(words = [], speed = 100, deleteSpeed = 55, pause = 2200) {
  const [display, setDisplay]     = useState('')
  const [wordIdx, setWordIdx]     = useState(0)
  const [deleting, setDeleting]   = useState(false)
  const [blinkOn, setBlinkOn]     = useState(true)

  useEffect(() => {
    const blink = setInterval(() => setBlinkOn((b) => !b), 530)
    return () => clearInterval(blink)
  }, [])

  useEffect(() => {
    if (!words.length) return
    const current = words[wordIdx]

    if (!deleting && display === current) {
      const t = setTimeout(() => setDeleting(true), pause)
      return () => clearTimeout(t)
    }
    if (deleting && display === '') {
      setDeleting(false)
      setWordIdx((i) => (i + 1) % words.length)
      return
    }

    const t = setTimeout(() => {
      setDisplay(deleting ? current.slice(0, display.length - 1) : current.slice(0, display.length + 1))
    }, deleting ? deleteSpeed : speed)
    return () => clearTimeout(t)
  }, [display, deleting, wordIdx, words, speed, deleteSpeed, pause])

  return { display, blinkOn }
}

// Easter egg: triple-click profile image
let clickCount = 0
let clickTimer = null

export default function Hero() {
  const { data, loading } = useDocument('hero', 'main')
  const [resumeOpen, setResumeOpen] = useState(false)
  const [glitch, setGlitch] = useState(false)
  const { display, blinkOn } = useTypewriter(data?.roles ?? [])

  const handleProfileClick = () => {
    clickCount++
    clearTimeout(clickTimer)
    clickTimer = setTimeout(() => { clickCount = 0 }, 500)
    if (clickCount >= 3) {
      clickCount = 0
      setGlitch(true)
      toast('LOADING HUMAN... ████████░░ 80%  - identity confirmed.', { icon: '👤', duration: 3000 })
      setTimeout(() => setGlitch(false), 1200)
    }
  }

  if (loading) return <SkeletonHero />

  const scrollDown = () =>
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <SectionIdContext.Provider value="hero">
      <>
        <section
          id="hero"
          className="relative min-h-screen flex items-center overflow-hidden"
        >
          <FieldGate field="particles">
            <ParticleBackground />
          </FieldGate>

          {/* Gradient orbs */}
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-16 py-32 grid md:grid-cols-2 gap-12 items-center">
            {/* Left - text */}
            <div className="space-y-6">
              <FieldGate field="badge">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    {data?.badge ?? 'Open to opportunities'}
                  </span>
                </motion.div>
              </FieldGate>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
              >
                <p className="text-muted text-lg font-light">Hello, I'm</p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight gradient-text">
                  {data?.name ?? 'Yogesh SJ'}
                </h1>
              </motion.div>

              {/* Typewriter */}
              <FieldGate field="roles">
                <motion.div
                  className="text-2xl md:text-3xl font-semibold text-ctext h-10 flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <span>{display}</span>
                  <span
                    className="ml-0.5 inline-block w-0.5 h-7 bg-primary rounded-full align-middle"
                    style={{ opacity: blinkOn ? 1 : 0, transition: 'opacity 0.1s' }}
                  />
                </motion.div>
              </FieldGate>

              <FieldGate field="tagline">
                <motion.p
                  className="text-muted text-base md:text-lg max-w-lg leading-relaxed"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  {data?.tagline ?? 'Turning data into decisions - one model at a time.'}
                </motion.p>
              </FieldGate>

              <motion.div
                className="flex flex-wrap gap-3 pt-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <FieldGate field="resumeButton">
                  <button
                    onClick={() => setResumeOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/85 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                  >
                    <FiFileText size={16} />
                    View Resume
                  </button>
                </FieldGate>
                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:border-primary/50 text-ctext font-semibold hover:bg-surface transition-all active:scale-95"
                >
                  <FiMail size={16} />
                  Contact Me
                </button>
              </motion.div>

              {/* Quick stats */}
              <FieldGate field="stats">
                {data?.stats && (
                  <motion.div
                    className="flex flex-wrap gap-6 pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                  >
                    {data.stats.map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-2xl font-bold gradient-text">{s.value}</p>
                        <p className="text-xs text-muted">{s.label}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </FieldGate>
            </div>

            {/* Right - profile image */}
            <FieldGate field="profileImage">
              <motion.div
                className="flex justify-center md:justify-end"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className={`
                    relative cursor-pointer select-none
                    ${glitch ? 'animate-pulse' : ''}
                  `}
                  onClick={handleProfileClick}
                >
                  {/* Animated glow ring */}
                  <div className="absolute inset-0 hex-clip animate-glow rounded-full" />
                  <div className="absolute -inset-3 hex-clip bg-gradient-to-br from-primary/30 to-accent/20 blur-xl animate-pulse-slow" />

                  <div className="relative w-56 h-56 md:w-72 md:h-72 hex-clip overflow-hidden border-2 border-primary/40">
                    <DefaultImage
                      src={data?.profileImage}
                      alt={data?.name ?? 'Profile'}
                      className={`w-full h-full object-cover transition-all duration-300 ${glitch ? 'hue-rotate-180 saturate-200' : ''}`}
                    />
                  </div>

                  {/* Floating data tags */}
                  <motion.div
                    className="absolute -top-2 -right-4 glass px-3 py-1.5 rounded-full text-xs font-mono text-accent border border-accent/20"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {'{ data }'}
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-2 -left-4 glass px-3 py-1.5 rounded-full text-xs font-mono text-primary border border-primary/20"
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  >
                    model.fit()
                  </motion.div>
                </div>
              </motion.div>
            </FieldGate>
          </div>

          {/* Scroll indicator */}
          <FieldGate field="scrollHint">
            <motion.button
              onClick={scrollDown}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted hover:text-primary transition-colors"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              aria-label="Scroll down"
            >
              <FiArrowDown size={24} />
            </motion.button>
          </FieldGate>
        </section>

        <ResumeModal
          isOpen={resumeOpen}
          onClose={() => setResumeOpen(false)}
          resumeUrl={data?.resumeUrl}
        />
      </>
    </SectionIdContext.Provider>
  )
}
