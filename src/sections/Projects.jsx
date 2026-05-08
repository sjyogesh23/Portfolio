import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiGithub, FiExternalLink, FiCalendar, FiX } from 'react-icons/fi'
import DOMPurify from 'dompurify'
import { useCollection } from '@/hooks/useFirestore'
import SectionWrapper, { SectionHeading } from '@/components/ui/SectionWrapper'
import FieldGate from '@/components/ui/FieldGate'
import DefaultImage from '@/components/ui/DefaultImage'
import Badge from '@/components/ui/Badge'
import { SkeletonGrid } from '@/components/ui/Skeleton'

function ProjectCard({ project, onClick }) {
  return (
    <motion.div
      layout
      className="glass rounded-2xl overflow-hidden border border-border/60 card-hover group cursor-pointer"
      onClick={() => onClick(project)}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <FieldGate field="image">
        <div className="relative h-44 overflow-hidden">
          <DefaultImage
            src={project.imageUrl}
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />

          {/* Tags overlay */}
          <FieldGate field="tags">
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
              {(project.tags ?? []).slice(0, 2).map((tag) => (
                <Badge key={tag} variant="primary">{tag}</Badge>
              ))}
            </div>
          </FieldGate>

          {/* Date */}
          <FieldGate field="date">
            {project.date && (
              <div className="absolute bottom-2 right-3 flex items-center gap-1 text-xs text-white/70">
                <FiCalendar size={11} />
                {new Date(project.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            )}
          </FieldGate>
        </div>
      </FieldGate>

      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-bold text-ctext text-base group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <FieldGate field="description">
            <p className="text-muted text-sm mt-0.5">{project.title}</p>
          </FieldGate>
        </div>

        <FieldGate field="tags">
          <div className="flex flex-wrap gap-1.5">
            {(project.skills ?? []).slice(0, 4).map((s) => (
              <span key={s} className="text-xs text-muted bg-surface px-2 py-0.5 rounded-md border border-border">
                {s}
              </span>
            ))}
            {(project.skills?.length ?? 0) > 4 && (
              <span className="text-xs text-muted">+{project.skills.length - 4}</span>
            )}
          </div>
        </FieldGate>

        <div className="flex gap-3 pt-1" onClick={(e) => e.stopPropagation()}>
          <FieldGate field="codeLink">
            {project.codeLink && (
              <a
                href={project.codeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors"
              >
                <FiGithub size={13} /> Code
              </a>
            )}
          </FieldGate>
          <FieldGate field="liveLink">
            {project.liveLink && (
              <a
                href={project.liveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors"
              >
                <FiExternalLink size={13} /> Live
              </a>
            )}
          </FieldGate>
        </div>
      </div>
    </motion.div>
  )
}

function ProjectModal({ project, onClose }) {
  if (!project) return null
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 glass rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="relative h-56 overflow-hidden rounded-t-2xl">
          <DefaultImage
            src={project.imageUrl}
            alt={project.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full glass text-ctext hover:text-primary transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-7 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-ctext">{project.name}</h2>
              <p className="text-muted">{project.title}</p>
            </div>
            {project.date && (
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <FiCalendar size={13} />
                {new Date(project.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(project.tags ?? []).map((t) => <Badge key={t} variant="primary">{t}</Badge>)}
          </div>

          <div
            className="prose prose-sm max-w-none text-ctext/85 [&_strong]:text-ctext [&_a]:text-primary"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.description ?? '') }}
          />

          <div>
            <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Skills used</p>
            <div className="flex flex-wrap gap-2">
              {(project.skills ?? []).map((s) => (
                <span key={s} className="px-3 py-1 rounded-full text-xs bg-surface border border-border text-ctext">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            {project.codeLink && (
              <a
                href={project.codeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:border-primary/50 text-sm font-medium text-ctext hover:text-primary transition-colors"
              >
                <FiGithub size={16} /> View Code
              </a>
            )}
            {project.liveLink && (
              <a
                href={project.liveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/85 transition-colors"
              >
                <FiExternalLink size={16} /> Live Preview
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const ALL_TAGS_LABEL = 'All'

export default function Projects() {
  const { data: projects, loading } = useCollection('projects', { filterVisible: true })
  const [activeTag,      setActiveTag]      = useState(ALL_TAGS_LABEL)
  const [selectedProject, setSelectedProject] = useState(null)

  const allTags = useMemo(() => {
    const tags = new Set()
    projects.forEach((p) => (p.tags ?? []).forEach((t) => tags.add(t)))
    return [ALL_TAGS_LABEL, ...tags]
  }, [projects])

  const filtered = useMemo(() =>
    activeTag === ALL_TAGS_LABEL
      ? projects
      : projects.filter((p) => (p.tags ?? []).includes(activeTag)),
    [projects, activeTag]
  )

  return (
    <>
      <SectionWrapper id="projects">
        <SectionHeading label="What I've built" title="Projects" />

        {/* Tag filter */}
        {/* <div className="flex flex-wrap gap-2 mb-8">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeTag === tag
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted hover:border-primary/50 hover:text-ctext'
              }`}
            >
              {tag}
            </button>
          ))}
        </div> */}

        {loading ? (
          <SkeletonGrid count={6} cols={3} />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={setSelectedProject}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Secret project - unlocked by Konami code */}
        <div id="secret-project" className="hidden mt-6">
          <div className="glass rounded-2xl p-6 border border-accent/30 border-dashed">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔐</span>
              <h3 className="text-lg font-bold gradient-text">Project X - Classified</h3>
            </div>
            <p className="text-muted text-sm">
              You found it. This project is so advanced it can't be described in prose.
              The model accuracy is{' '}
              <span className="font-mono text-accent">
                {(Math.random() * 3 + 97).toFixed(2)}%
              </span>
              . Please don't tell anyone.
            </p>
          </div>
        </div>
      </SectionWrapper>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
