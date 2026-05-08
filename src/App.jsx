import { useEffect, createContext, useContext } from 'react'
import { Toaster } from 'react-hot-toast'
import useTheme from '@/hooks/useTheme'
import useEasterEggs from '@/hooks/useEasterEggs'
import useConfig from '@/hooks/useConfig'
import Navbar from '@/components/Navbar'
import ScrollProgress from '@/components/ScrollProgress'
import Hero from '@/sections/Hero'
import About from '@/sections/About'
import Skills from '@/sections/Skills'
import Projects from '@/sections/Projects'
import Experience from '@/sections/Experience'
import Seminars from '@/sections/Seminars'
import Hackathons from '@/sections/Hackathons'
import Publications from '@/sections/Publications'
import Certifications from '@/sections/Certifications'
import Contact from '@/sections/Contact'
import Footer from '@/sections/Footer'

// ── Contexts ─────────────────────────────────────────────────────────────────
export const ThemeContext  = createContext({ isDark: false, toggleTheme: () => {} })
export const ConfigContext = createContext({ config: null })
export const useThemeContext  = () => useContext(ThemeContext)
export const useConfigContext = () => useContext(ConfigContext)

// ── Theme helpers ─────────────────────────────────────────────────────────────
function hexToRgb(hex = '') {
  const h = hex.replace('#', '')
  if (h.length !== 6) return null
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if (isNaN(r + g + b)) return null
  return `${r} ${g} ${b}`
}

const COLOR_KEYS = ['bg', 'surface', 'surface2', 'border', 'text', 'muted', 'primary', 'accent']

function applyTheme(theme, isDark) {
  if (!theme) return
  const palette = isDark ? theme.dark : theme.light
  if (!palette) return
  const root = document.documentElement
  COLOR_KEYS.forEach(key => {
    const rgb = hexToRgb(palette[key])
    if (rgb) root.style.setProperty(`--color-${key}`, rgb)
  })
}

function applyFont(family) {
  if (!family || family === 'Inter') return
  let link = document.getElementById('dynamic-font')
  if (!link) {
    link = document.createElement('link')
    link.id = 'dynamic-font'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600;700&display=swap`
  document.body.style.fontFamily = `'${family}', system-ui, sans-serif`
}

function applyTypography(t) {
  if (!t) return
  const r = document.documentElement
  const set = (v, val) => val && r.style.setProperty(v, val)
  set('--fs-hero',    t.fontSizeHero    ? `${t.fontSizeHero}rem`    : null)
  set('--fs-h1',      t.fontSizeH1      ? `${t.fontSizeH1}rem`      : null)
  set('--fs-h2',      t.fontSizeH2      ? `${t.fontSizeH2}rem`      : null)
  set('--fs-h3',      t.fontSizeH3      ? `${t.fontSizeH3}rem`      : null)
  set('--fs-body',    t.fontSizeBody    ? `${t.fontSizeBody}rem`    : null)
  set('--fs-small',   t.fontSizeSmall   ? `${t.fontSizeSmall}rem`   : null)
  set('--fw-bold',    t.fontWeightBold  ?? null)
  set('--fw-medium',  t.fontWeightMedium ?? null)
  set('--lh-body',    t.lineHeightBody  ?? null)
  set('--ls-heading', t.letterSpacingHeading != null ? `${t.letterSpacingHeading}em` : null)
  set('--ls-body',    t.letterSpacingBody    != null ? `${t.letterSpacingBody}em`    : null)
}

function applyLayout(l) {
  if (!l) return
  const r = document.documentElement
  const set = (v, val) => val != null && r.style.setProperty(v, val)
  set('--section-py',      l.sectionPaddingY   ? `${l.sectionPaddingY}rem`   : null)
  set('--section-px',      l.sectionPaddingX   ? `${l.sectionPaddingX}rem`   : null)
  set('--section-px-md',   l.sectionPaddingXMd ? `${l.sectionPaddingXMd}rem` : null)
  set('--container-max-w', l.containerMaxWidth ? `${l.containerMaxWidth}rem`  : null)
  set('--radius',          l.borderRadius      ? `${l.borderRadius}rem`      : null)
  set('--radius-lg',       l.borderRadiusLg    ? `${l.borderRadiusLg}rem`    : null)
  set('--anim-dur',        l.animationDuration ? `${l.animationDuration}s`   : null)
  set('--card-hover-y',    l.cardHoverY        ? `${l.cardHoverY}px`         : null)
  set('--scrollbar-w',     l.scrollbarWidth    ? `${l.scrollbarWidth}px`     : null)
}

function applyMeta(meta) {
  if (!meta) return
  // Title
  if (meta.siteTitle) document.title = meta.siteTitle
  // Helper to set/create <meta> tags
  function setMeta(sel, attr, content) {
    if (!content) return
    let el = document.querySelector(sel)
    if (!el) {
      el = document.createElement('meta')
      document.head.appendChild(el)
    }
    el.setAttribute(attr, content)
    el.setAttribute('content', content)
  }
  function setMetaName(name, content)     { setMeta(`meta[name="${name}"]`,        'name',     content); setMeta(`meta[name="${name}"]`, 'content', content) }
  function setMetaProp(prop, content)     { setMeta(`meta[property="${prop}"]`,    'property', content) }
  function setLink(rel, attr, val)        { let el = document.querySelector(`link[rel="${rel}"]`); if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el) } el.setAttribute(attr, val) }

  if (meta.description)   { setMetaName('description',       meta.description) }
  if (meta.keywords)      { setMetaName('keywords',          meta.keywords) }
  if (meta.author)        { setMetaName('author',            meta.author) }
  if (meta.themeColor)    { setMetaName('theme-color',       meta.themeColor) }
  if (meta.ogTitle || meta.siteTitle)    { setMetaProp('og:title',       meta.ogTitle || meta.siteTitle) }
  if (meta.ogDescription || meta.description) { setMetaProp('og:description', meta.ogDescription || meta.description) }
  if (meta.ogImage)       { setMetaProp('og:image',          meta.ogImage) }
  if (meta.siteUrl)       { setMetaProp('og:url',            meta.siteUrl) }
  if (meta.twitterCard)   { setMetaName('twitter:card',      meta.twitterCard) }
  if (meta.ogTitle || meta.siteTitle)    { setMetaName('twitter:title',   meta.ogTitle || meta.siteTitle) }
  if (meta.ogDescription || meta.description) { setMetaName('twitter:description', meta.ogDescription || meta.description) }
  if (meta.ogImage)       { setMetaName('twitter:image',     meta.ogImage) }
  if (meta.faviconUrl)    { setLink('icon', 'href', meta.faviconUrl) }
}

// ── Section order defaults ────────────────────────────────────────────────────
const DEFAULT_ORDER = [
  'hero','about','skills','projects','experience',
  'seminars','hackathons','publications','certifications','contact',
]

const SECTION_MAP = {
  hero:           <Hero />,
  about:          <About />,
  skills:         <Skills />,
  projects:       <Projects />,
  experience:     <Experience />,
  seminars:       <Seminars />,
  hackathons:     <Hackathons />,
  publications:   <Publications />,
  certifications: <Certifications />,
  contact:        <Contact />,
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { isDark, toggleTheme } = useTheme()
  const { config }              = useConfig()
  useEasterEggs()

  // Apply theme colors whenever config or dark/light mode changes
  useEffect(() => {
    if (config?.theme) applyTheme(config.theme, isDark)
  }, [config, isDark])

  // Apply font family
  useEffect(() => {
    if (config?.fontFamily) applyFont(config.fontFamily)
  }, [config?.fontFamily])

  // Apply typography CSS vars
  useEffect(() => {
    if (config?.typography) applyTypography(config.typography)
  }, [config?.typography])

  // Apply layout CSS vars
  useEffect(() => {
    if (config?.layout) applyLayout(config.layout)
  }, [config?.layout])

  // Apply meta / SEO tags
  useEffect(() => {
    if (config?.meta) applyMeta(config.meta)
  }, [config?.meta])

  // Build section render order from config, respecting visibility
  const sectionOrder   = config?.sectionOrder ?? DEFAULT_ORDER
  const sectionConf    = config?.sections ?? {}

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ConfigContext.Provider value={{ config }}>
        <div className="relative min-h-screen bg-bg text-ctext">
          <ScrollProgress />
          <Navbar />
          <main>
            {sectionOrder.map(id => {
              // Skip sections marked invisible
              if (sectionConf[id]?.visible === false) return null
              const el = SECTION_MAP[id]
              if (!el) return null
              return <div key={id}>{el}</div>
            })}
          </main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgb(var(--color-surface))',
                color: 'rgb(var(--color-text))',
                border: '1px solid rgb(var(--color-border))',
                fontFamily: 'inherit',
                fontSize: '13px',
              },
              duration: 3500,
            }}
          />
        </div>
      </ConfigContext.Provider>
    </ThemeContext.Provider>
  )
}
