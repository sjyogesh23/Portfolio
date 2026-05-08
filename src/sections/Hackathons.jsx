import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiExternalLink, FiCalendar } from 'react-icons/fi'
import confetti from 'canvas-confetti'
import { useCollection } from '@/hooks/useFirestore'
import SectionWrapper, { SectionHeading } from '@/components/ui/SectionWrapper'
import FieldGate from '@/components/ui/FieldGate'
import DefaultImage from '@/components/ui/DefaultImage'
import { SkeletonBox } from '@/components/ui/Skeleton'

const PODIUM_CONFIG = {
  '1st': { rank: 1, height: 'h-32', label: '🥇 1st',  color: 'from-yellow-500/30 to-yellow-600/10', border: 'border-yellow-500/40', badge: 'gold'   },
  '2nd': { rank: 2, height: 'h-20', label: '🥈 2nd',  color: 'from-gray-400/30 to-gray-500/10',     border: 'border-gray-400/40',   badge: 'silver' },
  '3rd': { rank: 3, height: 'h-14', label: '🥉 3rd',  color: 'from-orange-600/30 to-orange-700/10', border: 'border-orange-500/40', badge: 'bronze' },
}

const PODIUM_ORDER = ['2nd', '1st', '3rd']   // visual order: silver, gold, bronze

let celebrationCount = 0

function PodiumCard({ hackathon, config, delay }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, threshold: 0.3 })

  const handleWinnerClick = () => {
    if (config.rank === 1) {
      celebrationCount++
      confetti({ particleCount: 80 + celebrationCount * 10, spread: 70, origin: { y: 0.5 } })
      if (celebrationCount > 1) {
        const el = document.getElementById('celebration-counter')
        if (el) el.textContent = `You've celebrated ${celebrationCount} times 🎉`
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center gap-0"
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Card */}
      <div
        className={`glass rounded-2xl border ${config.border} overflow-hidden cursor-pointer w-full max-w-[220px] bg-gradient-to-b ${config.color}`}
        onClick={handleWinnerClick}
      >
        <div className="relative h-28 overflow-hidden">
          <DefaultImage
            src={hackathon.imageUrl}
            alt={hackathon.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/70 to-transparent" />
          <FieldGate field="result">
            <span className="absolute top-2 left-2 text-xl">{config.label.split(' ')[0]}</span>
          </FieldGate>
        </div>
        <div className="p-3 space-y-1.5">
          <h4 className="font-semibold text-ctext text-xs leading-snug line-clamp-2">{hackathon.title}</h4>
          <FieldGate field="date">
            {hackathon.date && (
              <div className="flex items-center gap-1 text-[11px] text-muted">
                <FiCalendar size={10} />
                {new Date(hackathon.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            )}
          </FieldGate>
          <FieldGate field="link">
            {hackathon.link && (
              <a
                href={hackathon.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <FiExternalLink size={10} /> View
              </a>
            )}
          </FieldGate>
        </div>
      </div>

      {/* Platform block */}
      <motion.div
        className={`w-full max-w-[220px] ${config.height} rounded-b-xl bg-gradient-to-b ${config.color} border ${config.border} border-t-0 flex items-end justify-center pb-2`}
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        style={{ transformOrigin: 'bottom' }}
        transition={{ duration: 0.55, delay: delay + 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-xs font-bold text-muted opacity-60">{config.label}</span>
      </motion.div>
    </motion.div>
  )
}

function ParticipantCard({ hackathon, index }) {
  return (
    <motion.div
      className="glass rounded-2xl border border-border/60 flex items-center gap-4 p-4 hover:border-primary/30 transition-colors"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
        <DefaultImage
          src={hackathon.imageUrl}
          alt={hackathon.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-ctext text-sm truncate">{hackathon.title}</h4>
        <div className="flex items-center gap-3 mt-0.5">
          <FieldGate field="date">
            {hackathon.date && (
              <span className="text-xs text-muted">{new Date(hackathon.date).getFullYear()}</span>
            )}
          </FieldGate>
          <FieldGate field="result">
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-muted">
              {hackathon.result}
            </span>
          </FieldGate>
        </div>
      </div>
      <FieldGate field="link">
        {hackathon.link && (
          <a href={hackathon.link} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors flex-shrink-0">
            <FiExternalLink size={14} />
          </a>
        )}
      </FieldGate>
    </motion.div>
  )
}

export default function Hackathons() {
  const { data: hackathons, loading } = useCollection('hackathons', { filterVisible: true })

  const podiumEntries = PODIUM_ORDER.reduce((acc, rank) => {
    acc[rank] = hackathons.find((h) => h.result === rank) ?? null
    return acc
  }, {})

  const others = hackathons.filter((h) => !['1st', '2nd', '3rd'].includes(h.result))

  return (
    <SectionWrapper id="hackathons" className="bg-surface/20">
      <SectionHeading label="Battle-tested" title="Hackathons" />

      {loading ? (
        <div className="space-y-6">
          <SkeletonBox className="h-72 w-full rounded-2xl" />
          <SkeletonBox className="h-40 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Podium */}
          <div className="flex items-end justify-center gap-4 mb-10">
            {PODIUM_ORDER.map((rank, i) => {
              const h = podiumEntries[rank]
              if (!h) return (
                <div key={rank} className="flex flex-col items-center gap-0">
                  <div className="glass rounded-2xl border border-dashed border-border/40 w-full max-w-[220px] h-28 flex items-center justify-center text-muted text-xs">
                    {PODIUM_CONFIG[rank].label}
                  </div>
                  <div className={`w-full max-w-[220px] ${PODIUM_CONFIG[rank].height} rounded-b-xl border border-dashed border-border/30 border-t-0`} />
                </div>
              )
              return (
                <PodiumCard
                  key={rank}
                  hackathon={h}
                  config={PODIUM_CONFIG[rank]}
                  delay={i * 0.12}
                />
              )
            })}
          </div>

          <p id="celebration-counter" className="text-center text-xs text-muted font-mono min-h-[20px]" />

          {/* Other participations */}
          {others.length > 0 && (
            <div>
              <p className="text-xs font-mono text-muted tracking-widest uppercase mb-4">Other Participations</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {others.map((h, i) => (
                  <ParticipantCard key={h.id} hackathon={h} index={i} />
                ))}
              </div>
            </div>
          )}

          {hackathons.length === 0 && (
            <p className="text-center text-muted py-16">No hackathons added yet.</p>
          )}
        </>
      )}
    </SectionWrapper>
  )
}
