import { motion } from 'framer-motion'
import {
  FiLinkedin, FiGithub, FiInstagram, FiTwitter, FiMail 
} from 'react-icons/fi'
import { FaXTwitter } from "react-icons/fa6";
import { useDocument } from '@/hooks/useFirestore'
import SectionWrapper, { SectionHeading } from '@/components/ui/SectionWrapper'
import FieldGate from '@/components/ui/FieldGate'
import { SkeletonBox } from '@/components/ui/Skeleton'

const SOCIAL_CONFIG = [
  { key: 'linkedin',  icon: FiLinkedin,  label: 'LinkedIn',  color: 'hover:text-blue-500 hover:border-blue-500/40 hover:bg-blue-500/5' },
  { key: 'github',    icon: FiGithub,    label: 'GitHub',    color: 'hover:text-ctext hover:border-ctext/40 hover:bg-surface' },
  { key: 'instagram', icon: FiInstagram, label: 'Instagram', color: 'hover:text-pink-500 hover:border-pink-500/40 hover:bg-pink-500/5' },
  { key: 'twitter',   icon: FaXTwitter,   label: 'X', color: 'hover:text-sky-400 hover:border-sky-400/40 hover:bg-sky-400/5' },
  { key: 'email',     icon: FiMail,      label: 'Email',     color: 'hover:text-accent hover:border-accent/40 hover:bg-accent/5',
    href: (v) => `mailto:${v}` },
]

function SocialButton({ config, value, index }) {
  const Icon = config.icon
  const href = config.href ? config.href(value) : value

  return (
    <motion.a
      href={href}
      target={config.key !== 'email' ? '_blank' : undefined}
      rel="noopener noreferrer"
      className={`
        flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-border
        text-muted transition-all duration-300 group ${config.color}
      `}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
    >
      <Icon size={26} className="transition-transform duration-300 group-hover:scale-110" />
      <span className="text-xs font-medium">{config.label}</span>
    </motion.a>
  )
}

export default function Contact() {
  const { data, loading } = useDocument('contact', 'main')

  return (
    <SectionWrapper id="contact">
      <SectionHeading label="Say hello" title="Contact" />

      <div className="max-w-2xl mx-auto text-center">
        <motion.p
          className="text-muted text-lg mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Let's build something intelligent together. I'm always open to new ideas, collaborations, or just a good data science conversation.
        </motion.p>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonBox key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {SOCIAL_CONFIG.map((cfg, i) => {
              const value = data?.[cfg.key]
              if (!value) return null
              return (
                <FieldGate key={cfg.key} field={cfg.key}>
                  <SocialButton config={cfg} value={value} index={i} />
                </FieldGate>
              )
            })}
          </div>
        )}

        {/* Decorative formula */}
        <motion.div
          className="mt-16 font-mono text-sm text-muted/40 select-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          response = model.predict(your_message) ✦ confidence = 1.0
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
