import { motion } from 'framer-motion'
import { FiMapPin, FiCalendar, FiExternalLink } from 'react-icons/fi'
import { useCollection } from '@/hooks/useFirestore'
import SectionWrapper, { SectionHeading } from '@/components/ui/SectionWrapper'
import FieldGate from '@/components/ui/FieldGate'
import DefaultImage from '@/components/ui/DefaultImage'
import { SkeletonGrid } from '@/components/ui/Skeleton'

function SeminarCard({ seminar, index }) {
  return (
    <motion.div
      className="glass rounded-2xl overflow-hidden border border-border/60 card-hover group"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
    >
      <div className="relative h-40 overflow-hidden">
        <DefaultImage
          src={seminar.imageUrl}
          alt={seminar.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/70 to-transparent" />
      </div>

      <div className="p-5 space-y-2">
        <h3 className="font-bold text-ctext text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {seminar.title}
        </h3>
        <div className="flex flex-col gap-1">
          <FieldGate field="organization">
            {seminar.organization && (
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <FiMapPin size={11} className="text-primary flex-shrink-0" />
                <span className="truncate">{seminar.organization}</span>
              </div>
            )}
          </FieldGate>
          <FieldGate field="date">
            {seminar.date && (
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <FiCalendar size={11} className="text-accent flex-shrink-0" />
                {new Date(seminar.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </FieldGate>
          <FieldGate field="link">
            {seminar.link && (
              <a
                href={seminar.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium mt-0.5"
              >
                <FiExternalLink size={11} className="flex-shrink-0" />
                View Event
              </a>
            )}
          </FieldGate>
        </div>
      </div>
    </motion.div>
  )
}

export default function Seminars() {
  const { data: seminars, loading } = useCollection('seminars', { filterVisible: true })

  return (
    <SectionWrapper id="seminars">
      <SectionHeading label="Talks & workshops" title="Seminars" />

      {loading ? (
        <SkeletonGrid count={3} cols={3} />
      ) : seminars.length === 0 ? (
        <p className="text-center text-muted py-16">No seminars added yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {seminars.map((s, i) => (
            <SeminarCard key={s.id} seminar={s} index={i} />
          ))}
        </div>
      )}
    </SectionWrapper>
  )
}
