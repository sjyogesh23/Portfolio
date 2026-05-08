import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-3xl' }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            className={`
              relative z-10 w-full ${maxWidth} max-h-[90vh]
              glass rounded-2xl shadow-2xl overflow-hidden flex flex-col
            `}
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                <h2 className="text-lg font-semibold text-ctext">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-surface transition-colors text-muted hover:text-ctext"
                  aria-label="Close"
                >
                  <FiX size={20} />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6">
              {!title && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-surface/80 transition-colors text-muted hover:text-ctext z-10"
                  aria-label="Close"
                >
                  <FiX size={20} />
                </button>
              )}
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
