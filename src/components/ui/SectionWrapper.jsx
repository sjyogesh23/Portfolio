import { createContext, useContext } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useConfigContext } from '@/App'

// Inner context so SectionHeading / FieldGate know which section they belong to
export const SectionIdContext = createContext(null)

export default function SectionWrapper({ id, children, className = '' }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.08 })
  const { config }    = useConfigContext()
  const dur = parseFloat(config?.layout?.animationDuration ?? 0.65)

  return (
    <SectionIdContext.Provider value={id}>
      <motion.section
        id={id}
        ref={ref}
        className={`relative section-padding ${className}`}
        initial={{ opacity: 0, y: 48 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.section>
    </SectionIdContext.Provider>
  )
}

// Section heading - reads overrides from admin config, falls back to hardcoded defaults
export function SectionHeading({ label: defaultLabel, title: defaultTitle }) {
  const id               = useContext(SectionIdContext)
  const { config }       = useConfigContext()
  const overrides        = id ? (config?.sections?.[id] ?? {}) : {}

  const label = overrides.label   ?? defaultLabel
  const title = overrides.heading ?? defaultTitle

  return (
    <div className="mb-12">
      <p className="section-subtitle">{label}</p>
      <h2 className="section-title">{title}</h2>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1 w-10 rounded-full bg-primary" />
        <div className="h-1 w-4 rounded-full bg-accent" />
      </div>
    </div>
  )
}
