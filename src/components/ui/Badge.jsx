const VARIANTS = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  accent:  'bg-accent/10 text-accent border-accent/20',
  muted:   'bg-surface text-muted border-border',
  success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  gold:    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  silver:  'bg-gray-400/10 text-gray-400 border-gray-400/20',
  bronze:  'bg-orange-600/10 text-orange-600 border-orange-600/20',
}

export default function Badge({ children, variant = 'primary', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5
        text-xs font-medium rounded-full border
        transition-colors
        ${VARIANTS[variant] ?? VARIANTS.primary}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
