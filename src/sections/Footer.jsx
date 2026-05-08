import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDocument } from '@/hooks/useFirestore'
import { useConfigContext } from '@/App'

const DEFAULT_STATS = [
  { label: 'Framework',    value: 'React 18 + Vite' },
  { label: 'Styling',      value: 'Tailwind CSS' },
  { label: 'Animations',   value: 'Framer Motion' },
  { label: 'Database',     value: 'Firebase Firestore' },
  { label: 'Skills Graph', value: 'D3.js force-directed' },
  { label: 'Easter eggs',  value: '7 hidden 🥚' },
]

export default function Footer() {
  const { data: hero }  = useDocument('hero', 'main')
  const { config }      = useConfigContext()
  const footerConf      = config?.footer ?? {}
  const [terminalOpen, setTerminalOpen] = useState(false)
  const year = new Date().getFullYear()

  const copyrightName  = footerConf.copyrightName  || hero?.name || 'Portfolio'
  const centerText     = footerConf.centerText     ?? 'Built with React + Firebase ✦ click me'
  const rightText      = footerConf.rightText      ?? '∀ data ∈ world : insight(data) → decision'
  const showTerminal   = footerConf.showTerminal   !== false
  const terminalTitle  = footerConf.terminalHeading ?? 'portfolio - about this site'
  const terminalCmd    = footerConf.terminalCommand  ?? '$ portfolio --info'
  const buildStats     = footerConf.terminalStats   ?? DEFAULT_STATS

  const logoInitials = copyrightName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <footer className="relative border-t border-border/40 bg-surface/30">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold gradient-text">
            {logoInitials}
          </div>
          <span className="text-sm text-muted">
            © {year}{' '}
            <span className="text-ctext font-medium">{copyrightName}</span>
          </span>
        </div>

        {/* Center - clickable easter egg */}
        <button
          onClick={() => showTerminal && setTerminalOpen(true)}
          className={`text-xs text-muted/50 font-mono transition-colors select-none ${showTerminal ? 'hover:text-primary cursor-pointer' : 'cursor-default'}`}
          title={showTerminal ? 'Click for a surprise' : undefined}
        >
          {centerText}
        </button>

        {/* Right */}
        <p className="text-xs text-muted/40 font-mono">
          {rightText}
        </p>
      </div>

      {/* Terminal modal */}
      <AnimatePresence>
        {terminalOpen && showTerminal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setTerminalOpen(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-lg rounded-2xl overflow-hidden border border-primary/30 shadow-2xl"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              style={{ background: '#0d0d12', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {/* Terminal title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <span className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer" onClick={() => setTerminalOpen(false)} />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-white/40">{terminalTitle}</span>
              </div>

              {/* Terminal content */}
              <div className="p-5 space-y-1.5 text-sm">
                <p className="text-green-400">{terminalCmd}</p>
                <p className="text-white/60">Initialising knowledge graph... done ✓</p>
                <p className="text-white/40 mt-2">── Build Information ──────────────────</p>
                {buildStats.map((s, i) => (
                  <motion.p
                    key={s.label + i}
                    className="text-white/70"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <span className="text-primary/70">{String(s.label).padEnd(16)}</span>
                    <span className="text-accent/80">{s.value}</span>
                  </motion.p>
                ))}
                <p className="text-white/40 mt-3">──────────────────────────────────────</p>
                <motion.p
                  className="text-green-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  $ P(you finding this) was low. Respect. 🫡
                </motion.p>
                <motion.span
                  className="inline-block w-2 h-4 bg-green-400 align-middle"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  )
}
