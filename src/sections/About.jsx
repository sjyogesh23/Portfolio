import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import CountUp from 'react-countup'
import DOMPurify from 'dompurify'
import { FiCalendar, FiAward, FiBookOpen } from 'react-icons/fi'
import { useDocument, useCollection } from '@/hooks/useFirestore'
import SectionWrapper, { SectionHeading } from '@/components/ui/SectionWrapper'
import FieldGate from '@/components/ui/FieldGate'
import { SkeletonText, SkeletonBox } from '@/components/ui/Skeleton'

// ── Animated stat card ───────────────────────────────────────────────────────
function StatCard({ value, label, suffix = '+', delay = 0 }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      className="glass rounded-2xl p-4 text-center glow-border"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <p className="text-2xl font-extrabold gradient-text">
        {inView ? <CountUp end={value} duration={2.2} suffix={suffix} /> : '0'}
      </p>
      <p className="text-muted text-xs mt-0.5">{label}</p>
    </motion.div>
  )
}

// ── Education card ───────────────────────────────────────────────────────────
function EduCard({ edu, index }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, threshold: 0.15 })

  return (
    <motion.div
      ref={ref}
      className="relative pl-6 border-l-2 border-primary/30 hover:border-primary/70 transition-colors"
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08 }}
    >
      {/* Dot on the line */}
      <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-bg border-2 border-primary flex items-center justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      </span>

      <div className="glass rounded-2xl p-5 border border-border/60 hover:border-primary/30 transition-colors">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
          <div>
            <h4 className="font-bold text-ctext text-base">{edu.degree}</h4>
            <p className="text-primary font-medium text-sm">{edu.institution}</p>
            {edu.field && (
              <p className="text-muted text-sm">{edu.field}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center gap-1.5 text-xs text-muted bg-surface px-2.5 py-1 rounded-full border border-border">
              <FiCalendar size={10} />
              {edu.startYear} - {edu.endYear ?? 'Present'}
            </span>
            {edu.grade && (
              <span className="flex items-center gap-1 text-xs text-accent bg-accent/8 px-2.5 py-1 rounded-full border border-accent/20">
                <FiAward size={10} />
                {edu.grade}
              </span>
            )}
          </div>
        </div>

        {edu.description && (
          <p className="text-muted text-sm mt-2 leading-relaxed">{edu.description}</p>
        )}

        {edu.activities?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {edu.activities.map(a => (
              <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-surface border border-border text-muted">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Section ──────────────────────────────────────────────────────────────────
export default function About() {
  const { data, loading }        = useDocument('about', 'main')
  const { data: education, loading: eduLoading } = useCollection('education', {
    orderBy: 'order',
    direction: 'desc',
  })

  return (
    <SectionWrapper id="about">
      <SectionHeading label="Get to know me" title="About Me" />

      {/* ── Top row: stats + bio ─────────────────────────────────────── */}
      <div className="grid md:grid-cols-[1fr_1fr] gap-12 items-start mb-16">

        {/* Left - stats + interests */}
        {/* <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard value={15} suffix="+" label="Projects Built"  delay={0}   />
            <StatCard value={8}  suffix="+" label="Skills Mastered" delay={0.1} />
            <StatCard value={3}  suffix="+" label="Years Learning"  delay={0.2} />
            <StatCard value={5}  suffix="+" label="Certifications"  delay={0.3} />
          </div>

          <FieldGate field="interests">
            {loading ? (
              <div className="flex flex-wrap gap-2">
                {[80,100,65,90,75,85].map((w, i) => (
                  <SkeletonBox key={i} className="h-7 rounded-full" style={{ width: w }} />
                ))}
              </div>
            ) : (
              <div>
                <p className="text-xs font-mono text-muted tracking-widest uppercase mb-3">
                  Interests
                </p>
                <div className="flex flex-wrap gap-2">
                  {(data?.interests ?? []).map((interest, i) => (
                    <motion.span
                      key={interest}
                      className="px-3 py-1 rounded-full text-sm border border-primary/30 bg-primary/5 text-primary hover:bg-primary/15 transition-colors cursor-default"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {interest}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
          </FieldGate>
        </div> */}

        {/* Right - bio */}
        <FieldGate field="bio">
          <div>
            {loading ? (
              <div className="space-y-4">
                <SkeletonText lines={4} />
                <SkeletonText lines={3} />
              </div>
            ) : (
              <motion.div
                className="prose prose-lg max-w-none text-ctext leading-relaxed space-y-4
                           [&_strong]:text-ctext [&_code]:text-accent [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(data?.bio ?? '<p>Bio coming soon.</p>'),
                }}
              />
            )}

            {/* Decorative dot grid */}
            <div className="mt-10 grid grid-cols-10 gap-1.5 opacity-15">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full bg-primary"
                  style={{ opacity: Math.random() > 0.35 ? 1 : 0.2 }}
                />
              ))}
            </div>
          </div>
        </FieldGate>

        <FieldGate field="education">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <FiBookOpen className="text-primary" size={20} />
            <div>
              <h3 className="text-2xl font-bold text-ctext">Education</h3>
            </div>
          </div>

          {eduLoading ? (
            <div className="space-y-5 pl-6">
              {[1, 2].map(i => (
                <div key={i} className="space-y-2">
                  <SkeletonBox className="h-5 w-1/2 rounded" />
                  <SkeletonBox className="h-4 w-1/3 rounded" />
                  <SkeletonText lines={2} />
                </div>
              ))}
            </div>
          ) : education.length === 0 ? (
            <p className="text-muted pl-6">No education entries yet.</p>
          ) : (
            <div className="space-y-6 max-w-3xl">
              {education.map((edu, i) => (
                <EduCard key={edu.id} edu={edu} index={i} />
              ))}
            </div>
          )}
        </div>
      </FieldGate>
      </div>

      {/* ── Education ───────────────────────────────────────────────────── */}
      {/* <FieldGate field="education">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <FiBookOpen className="text-primary" size={20} />
            <div>
              <p className="text-xs font-mono text-muted tracking-widest uppercase">Academic background</p>
              <h3 className="text-2xl font-bold text-ctext">Education</h3>
            </div>
          </div>

          {eduLoading ? (
            <div className="space-y-5 pl-6">
              {[1, 2].map(i => (
                <div key={i} className="space-y-2">
                  <SkeletonBox className="h-5 w-1/2 rounded" />
                  <SkeletonBox className="h-4 w-1/3 rounded" />
                  <SkeletonText lines={2} />
                </div>
              ))}
            </div>
          ) : education.length === 0 ? (
            <p className="text-muted pl-6">No education entries yet.</p>
          ) : (
            <div className="space-y-6 max-w-3xl">
              {education.map((edu, i) => (
                <EduCard key={edu.id} edu={edu} index={i} />
              ))}
            </div>
          )}
        </div>
      </FieldGate> */}
    </SectionWrapper>
  )
}
