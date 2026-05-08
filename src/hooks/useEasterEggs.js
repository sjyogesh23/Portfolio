import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import { useConfigContext } from '@/App'

const DEFAULT_KONAMI = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a'

const DEFAULTS = {
  konami:     { enabled: true, trigger: DEFAULT_KONAMI, message: '🎮 Konami code activated! Secret project unlocked.' },
  sudo:       { enabled: true, trigger: 'sudo',         message: "⛔ Permission denied - you're not root here." },
  helloworld: { enabled: true, trigger: 'helloworld',   message: "Hello, World! 👋 Every legend starts somewhere." },
  the42:      { enabled: true, trigger: '42',           message: 'The answer to life, the universe, and everything.' },
  nan:        { enabled: true, trigger: 'nan',           message: 'NaN - Not a Number. Or are you?' },
  idle:       { enabled: true, message: '⏳ Still here? The model misses your inputs.', idleSeconds: 90 },
  footer:     { enabled: true },
}

export default function useEasterEggs() {
  const { config } = useConfigContext()
  const eggsRef    = useRef(DEFAULTS)
  const customRef  = useRef([])

  // Keep refs fresh whenever config changes (event listeners read refs, not state)
  useEffect(() => {
    const raw = config?.easterEggs ?? {}
    eggsRef.current = {
      konami:     { ...DEFAULTS.konami,     ...(raw.konami     ?? {}) },
      sudo:       { ...DEFAULTS.sudo,       ...(raw.sudo       ?? {}) },
      helloworld: { ...DEFAULTS.helloworld, ...(raw.helloworld ?? {}) },
      the42:      { ...DEFAULTS.the42,      ...(raw.the42      ?? {}) },
      nan:        { ...DEFAULTS.nan,        ...(raw.nan        ?? {}) },
      idle:       { ...DEFAULTS.idle,       ...(raw.idle       ?? {}) },
      footer:     { ...DEFAULTS.footer,     ...(raw.footer     ?? {}) },
    }
    customRef.current = (raw.custom ?? []).filter(e => e.trigger?.trim())
  }, [config?.easterEggs])

  useEffect(() => {
    const keyBuffer   = []
    let typedBuffer   = ''
    let idleTimer     = null
    let idleFired     = false

    function egg(id)  { return eggsRef.current[id] ?? DEFAULTS[id] }
    function isOn(id) { return egg(id).enabled !== false }
    function msg(id)  { return egg(id).message ?? DEFAULTS[id]?.message ?? '' }

    function handleKeyDown(e) {
      // ── Konami code ──────────────────────────────────────────────
      const konamiConf = egg('konami')
      if (isOn('konami')) {
        const seq = (konamiConf.trigger ?? DEFAULT_KONAMI).split(',').map(k => k.trim()).filter(Boolean)
        keyBuffer.push(e.key)
        if (keyBuffer.length > seq.length) keyBuffer.splice(0, keyBuffer.length - seq.length)
        if (seq.length > 0 && keyBuffer.join(',') === seq.join(',')) {
          keyBuffer.length = 0
          const secret = document.getElementById('secret-project')
          if (secret) { secret.classList.remove('hidden'); secret.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
          toast(msg('konami'), { icon: '🔓' })
          typedBuffer = ''
          return
        }
      }

      // ── Typed word detection ─────────────────────────────────────
      if (e.key.length === 1) {
        typedBuffer = (typedBuffer + e.key).slice(-30).toLowerCase()
      } else {
        typedBuffer = ''
        return
      }

      // Built-in typed words
      const wordEggs = ['sudo', 'helloworld', 'the42', 'nan']
      for (const id of wordEggs) {
        if (!isOn(id)) continue
        const trigger = (egg(id).trigger ?? DEFAULTS[id].trigger ?? '').toLowerCase().trim()
        if (trigger && typedBuffer.endsWith(trigger)) {
          toast(msg(id), { icon: id === 'sudo' ? '🔐' : id === 'helloworld' ? '🌍' : id === 'the42' ? '🌌' : '🤔' })
          typedBuffer = ''
          return
        }
      }

      // Custom eggs
      for (const custom of customRef.current) {
        if (custom.enabled === false) continue
        const trigger = (custom.trigger ?? '').toLowerCase().trim()
        if (trigger && typedBuffer.endsWith(trigger)) {
          toast(custom.message || `✨ ${custom.trigger}`, { icon: '✨' })
          typedBuffer = ''
          return
        }
      }
    }

    // ── Idle detection ───────────────────────────────────────────
    function resetIdle() {
      idleFired = false
      clearTimeout(idleTimer)
      if (!isOn('idle')) return
      const secs = egg('idle').idleSeconds ?? 90
      idleTimer = setTimeout(() => {
        if (!idleFired && isOn('idle')) {
          idleFired = true
          toast(msg('idle'), { icon: '🤖', duration: 5000 })
        }
      }, secs * 1000)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousemove', resetIdle)
    window.addEventListener('click', resetIdle)
    resetIdle()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousemove', resetIdle)
      window.removeEventListener('click', resetIdle)
      clearTimeout(idleTimer)
    }
  }, []) // reads from refs - no deps needed
}
