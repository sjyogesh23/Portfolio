import { FiDownload, FiExternalLink } from 'react-icons/fi'
import Modal from '@/components/ui/Modal'

export default function ResumeModal({ isOpen, onClose, resumeUrl }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resume" maxWidth="max-w-4xl">
      {resumeUrl ? (
        <>
          <div className="flex justify-end gap-3 mb-4">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted hover:text-ctext hover:border-primary/50 transition-colors text-sm"
            >
              <FiExternalLink size={14} />
              Open in new tab
            </a>
            <a
              href={resumeUrl}
              download
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/80 transition-colors text-sm font-medium"
            >
              <FiDownload size={14} />
              Download
            </a>
          </div>

          <div className="w-full rounded-xl overflow-hidden border border-border" style={{ height: '70vh' }}>
            <iframe
              src={`${resumeUrl}#toolbar=0`}
              title="Resume"
              className="w-full h-full"
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted space-y-3">
          <span className="text-5xl">📄</span>
          <p className="text-lg font-medium text-ctext">Resume not available yet</p>
          <p className="text-sm">Upload it via the data uploader and it will appear here.</p>
        </div>
      )}
    </Modal>
  )
}
