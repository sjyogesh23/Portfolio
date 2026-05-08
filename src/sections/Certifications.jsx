import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiExternalLink } from 'react-icons/fi'
import { useCollection } from '@/hooks/useFirestore'
import SectionWrapper, { SectionHeading } from '@/components/ui/SectionWrapper'
import FieldGate from '@/components/ui/FieldGate'
import DefaultImage from '@/components/ui/DefaultImage'
import Badge from '@/components/ui/Badge'
import { SkeletonBox } from '@/components/ui/Skeleton'

// ── Full-screen cert viewer modal ────────────────────────────────────────────
function CertModal({ cert, onClose }) {
  if (!cert) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          className="relative z-10 glass rounded-2xl border border-border shadow-2xl flex flex-col max-w-2xl w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full glass border border-border text-muted hover:text-ctext transition-colors"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>

          {/* Certificate image - object-contain handles any aspect ratio */}
          <div className="bg-white/5 flex items-center justify-center p-6 min-h-[200px] max-h-[65vh]">
            {cert.imageUrl ? (
              <img
                src={cert.imageUrl}
                alt={cert.title}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
              />
            ) : (
              <DefaultImage
                src={null}
                alt={cert.title}
                className="w-full h-48 rounded-lg"
              />
            )}
          </div>

          {/* Title + tags + link */}
          <div className="px-6 py-5 border-t border-border space-y-3">
            <h3 className="font-bold text-ctext text-base leading-snug pr-8">{cert.title}</h3>
            {cert.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {cert.tags.map(tag => (
                  <Badge key={tag} variant="accent">{tag}</Badge>
                ))}
              </div>
            )}
            {cert.link && (
              <a
                href={cert.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
              >
                <FiExternalLink size={13} />
                Verify Credential
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Cert thumbnail card ──────────────────────────────────────────────────────
function CertCard({ cert, index, onClick }) {
  return (
    <motion.button
      className="group relative glass rounded-2xl border border-border/60 overflow-hidden text-left
                 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 focus:outline-none"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      onClick={() => onClick(cert)}
    >
      {/* Thumbnail */}
      <FieldGate field="image">
        <div className="bg-white/5 dark:bg-white/3 flex items-center justify-center p-3 h-36">
          <DefaultImage
            src={cert.imageUrl}
            alt={cert.title}
            className="max-w-full max-h-full object-contain rounded"
          />
        </div>
      </FieldGate>

      {/* Footer strip */}
      <div className="px-3 py-2.5 border-t border-border/40">
        <p className="text-xs font-semibold text-ctext line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {cert.title}
        </p>
        <FieldGate field="tags">
          {cert.tags?.length > 0 && (
            <p className="text-[11px] text-muted mt-0.5 truncate">
              {cert.tags.slice(0, 2).join(' · ')}
              {cert.tags.length > 2 && ` +${cert.tags.length - 2}`}
            </p>
          )}
        </FieldGate>
        <FieldGate field="link">
          {cert.link && (
            <a
              href={cert.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-primary hover:underline mt-1 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              <FiExternalLink size={10} /> Verify
            </a>
          )}
        </FieldGate>
      </div>

      {/* Hover overlay hint */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/5 rounded-2xl pointer-events-none">
        <span className="text-xs font-mono text-primary bg-bg/80 px-2.5 py-1 rounded-full border border-primary/30">
          click to view
        </span>
      </div>
    </motion.button>
  )
}

// ── Section ──────────────────────────────────────────────────────────────────
export default function Certifications() {
  const { data: certs, loading } = useCollection('certifications', { filterVisible: true })
  const [selected, setSelected] = useState(null)

  return (
    <>
      <SectionWrapper id="certifications" className="bg-surface/20">
        <SectionHeading label="Credentials" title="Certifications" />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonBox key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : certs.length === 0 ? (
          <p className="text-center text-muted py-16">No certifications added yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {certs.map((cert, i) => (
              <CertCard key={cert.id} cert={cert} index={i} onClick={setSelected} />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-muted mt-5 font-mono opacity-50">
          click any certificate to view full size
        </p>
      </SectionWrapper>

      {/* Modal lives outside the section so it overlays everything */}
      {selected && (
        <CertModal cert={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
