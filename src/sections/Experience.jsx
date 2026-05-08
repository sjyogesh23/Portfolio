import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { FiExternalLink, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import DOMPurify from 'dompurify'
import { useCollection } from '@/hooks/useFirestore'
import SectionWrapper, { SectionHeading } from '@/components/ui/SectionWrapper'
import FieldGate from '@/components/ui/FieldGate'
import { SkeletonTimeline } from '@/components/ui/Skeleton'

// ── Single timeline card ─────────────────────────────────────────────────────
function TimelineCard({ exp, index, isLeft, isNew }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, threshold: 0.15 })

  return (
    <motion.div
      ref={ref}
      className={`relative flex items-start gap-0 md:gap-6 ${isLeft ? 'md:flex-row-reverse' : ''}`}
      initial={{ opacity: 0, x: isLeft ? 40 : -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07 }}
    >
      {/* Timeline dot (desktop only) */}
      <div className="hidden md:flex flex-col items-center flex-shrink-0 w-8">
        <motion.div
          className="w-3.5 h-3.5 rounded-full border-2 border-bg z-10 mt-1"
          style={{ background: isNew ? 'rgb(var(--color-accent))' : 'rgb(var(--color-primary))' }}
          animate={inView ? { scale: [0, 1.4, 1] } : {}}
          transition={{ duration: 0.4, delay: index * 0.07 + 0.2 }}
        />
      </div>

      {/* Card */}
      <div
        className={`flex-1 glass rounded-2xl p-5 border transition-colors group
          ${isNew
            ? 'border-accent/30 hover:border-accent/50'
            : 'border-border/60 hover:border-primary/30'
          }`}
      >
        {/* "Newly visible" label when expanded */}
        <FieldGate field="featuredBadge">
          {isNew && (
            <span className="inline-block mb-2 text-[11px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              + more experience
            </span>
          )}
        </FieldGate>

        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h3 className={`font-bold text-lg transition-colors group-hover:${isNew ? 'text-accent' : 'text-primary'} text-ctext`}>
              {exp.title}
            </h3>
            <FieldGate field="company">
              <p className={`font-medium text-sm ${isNew ? 'text-accent' : 'text-primary'}`}>
                {exp.company}
              </p>
            </FieldGate>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <FieldGate field="dates">
              <span className="flex items-center gap-1.5 text-xs text-muted bg-surface px-3 py-1 rounded-full border border-border">
                <FiCalendar size={11} />
                {exp.startDate} - {exp.endDate ?? 'Present'}
              </span>
            </FieldGate>
            <FieldGate field="link">
              {exp.link && (
                <a
                  href={exp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-muted hover:text-primary transition-colors"
                >
                  <FiExternalLink size={14} />
                </a>
              )}
            </FieldGate>
          </div>
        </div>

        <FieldGate field="description">
          {exp.description && (
            <div
              className="prose prose-sm max-w-none text-muted [&_strong]:text-ctext [&_li]:text-muted mb-4"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exp.description) }}
            />
          )}
        </FieldGate>

        <FieldGate field="skillsTags">
          {exp.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {exp.skills.map(s => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/20">
                  {s}
                </span>
              ))}
            </div>
          )}
        </FieldGate>
      </div>
    </motion.div>
  )
}

// ── Section ──────────────────────────────────────────────────────────────────
export default function Experience() {
  const { data: all, loading } = useCollection('experience', {
    orderBy: 'order',
    direction: 'asc',
    filterVisible: true,
  })

  const [showAll, setShowAll] = useState(false)

  // Split into featured (shown by default) and extra
  const featured = all.filter(e => e.featured !== false && (e.featured === true || e.order <= 2))
  const extra    = all.filter(e => !featured.includes(e))

  // What is rendered in the timeline
  const visible = showAll ? all : featured

  return (
    <SectionWrapper id="experience" className="bg-surface/20">
      <SectionHeading label="Where I've worked" title="Experience" />

      {loading ? (
        <SkeletonTimeline count={3} />
      ) : (
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical centre line */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

          <div className="space-y-8">
            {/* Featured entries */}
            {featured.map((exp, i) => (
              <TimelineCard
                key={exp.id}
                exp={exp}
                index={i}
                isLeft={i % 2 === 0}
                isNew={false}
              />
            ))}

            {/* Extra entries - slide in when expanded */}
            <AnimatePresence>
              {showAll && extra.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  style={{ overflow: 'hidden' }}
                >
                  <TimelineCard
                    exp={exp}
                    index={featured.length + i}
                    isLeft={(featured.length + i) % 2 === 0}
                    isNew={true}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Show all / Collapse button */}
          {extra.length > 0 && (
            <div className="flex justify-center mt-10">
              <motion.button
                onClick={() => setShowAll(v => !v)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border hover:border-primary/50 text-sm font-medium text-muted hover:text-ctext transition-all group"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                {showAll ? (
                  <>
                    <FiChevronUp size={16} className="transition-transform group-hover:-translate-y-0.5" />
                    Show Less
                  </>
                ) : (
                  <>
                    <FiChevronDown size={16} className="transition-transform group-hover:translate-y-0.5" />
                    Show All {all.length} Experiences
                  </>
                )}
              </motion.button>
            </div>
          )}

          {all.length === 0 && (
            <p className="text-center text-muted py-16">No experience entries yet.</p>
          )}
        </div>
      )}
    </SectionWrapper>
  )
}
