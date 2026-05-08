import { motion } from 'framer-motion'
import { FiExternalLink, FiCalendar, FiBookOpen } from 'react-icons/fi'
import DOMPurify from 'dompurify'
import { useCollection } from '@/hooks/useFirestore'
import SectionWrapper, { SectionHeading } from '@/components/ui/SectionWrapper'
import FieldGate from '@/components/ui/FieldGate'
import DefaultImage from '@/components/ui/DefaultImage'
import { SkeletonCard } from '@/components/ui/Skeleton'

function PublicationCard({ pub, index }) {
  return (
    <motion.div
      className="glass rounded-2xl border border-border/60 overflow-hidden flex flex-col sm:flex-row gap-0 hover:border-primary/30 transition-colors group"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
    >
      {/* Cover image */}
      <FieldGate field="image">
        <div className="sm:w-36 sm:flex-shrink-0 h-40 sm:h-auto overflow-hidden">
          <DefaultImage
            src={pub.imageUrl}
            alt={pub.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </FieldGate>

      <div className="flex-1 p-5 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-ctext text-base leading-snug group-hover:text-primary transition-colors">
              {pub.title}
            </h3>
            <FieldGate field="link">
              {pub.link && (
                <a
                  href={pub.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-1.5 rounded-lg text-muted hover:text-primary transition-colors"
                >
                  <FiExternalLink size={15} />
                </a>
              )}
            </FieldGate>
          </div>

          <FieldGate field="date">
            {pub.date && (
              <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
                <FiCalendar size={11} />
                {new Date(pub.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            )}
          </FieldGate>

          <FieldGate field="description">
            {pub.description && (
              <div
                className="mt-3 text-sm text-muted line-clamp-3 prose prose-sm max-w-none [&_p]:m-0"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pub.description) }}
              />
            )}
          </FieldGate>
        </div>

        <FieldGate field="link">
          {pub.link && (
            <a
              href={pub.link}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
            >
              <FiBookOpen size={12} />
              Read Publication
            </a>
          )}
        </FieldGate>
      </div>
    </motion.div>
  )
}

export default function Publications() {
  const { data: publications, loading } = useCollection('publications', { filterVisible: true })

  return (
    <SectionWrapper id="publications">
      <SectionHeading label="Research & writing" title="Publications" />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : publications.length === 0 ? (
        <p className="text-center text-muted py-16">No publications added yet.</p>
      ) : (
        <div className="space-y-4">
          {publications.map((pub, i) => (
            <PublicationCard key={pub.id} pub={pub} index={i} />
          ))}
        </div>
      )}
    </SectionWrapper>
  )
}
