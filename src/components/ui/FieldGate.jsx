import { useContext } from 'react'
import { SectionIdContext } from './SectionWrapper'
import { useConfigContext } from '@/App'

/**
 * Wraps any portfolio field/block.
 * If config.sections[sectionId].fields[field] === false → renders nothing.
 * Usage: <FieldGate field="badge"> … </FieldGate>
 */
export default function FieldGate({ field, children, fallback = null }) {
  const id           = useContext(SectionIdContext)
  const { config }   = useConfigContext()
  const fields       = config?.sections?.[id]?.fields ?? {}
  const visible      = fields[field] !== false
  return visible ? children : fallback
}
