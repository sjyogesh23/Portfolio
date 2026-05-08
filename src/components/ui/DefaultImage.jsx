import { useState } from 'react'

// Renders an <img> with a styled SVG fallback if the src is missing / broken
export default function DefaultImage({ src, alt = '', className = '', style = {} }) {
  const [errored, setErrored] = useState(!src)

  if (errored || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-surface border border-border ${className}`}
        style={style}
        aria-label={alt || 'Image unavailable'}
      >
        <svg
          viewBox="0 0 120 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-2/3 h-2/3 opacity-40"
        >
          {/* Background gradient */}
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="120" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgb(var(--color-primary))" />
              <stop offset="100%" stopColor="rgb(var(--color-accent))" />
            </linearGradient>
          </defs>

          {/* Data-science themed placeholder: bar chart + circuit dots */}
          <rect x="10" y="60" width="12" height="25" rx="2" fill="url(#grad)" opacity="0.7" />
          <rect x="28" y="45" width="12" height="40" rx="2" fill="url(#grad)" opacity="0.7" />
          <rect x="46" y="30" width="12" height="55" rx="2" fill="url(#grad)" opacity="0.7" />
          <rect x="64" y="50" width="12" height="35" rx="2" fill="url(#grad)" opacity="0.7" />
          <rect x="82" y="38" width="12" height="47" rx="2" fill="url(#grad)" opacity="0.7" />

          {/* Baseline */}
          <line x1="5" y1="87" x2="100" y2="87" stroke="url(#grad)" strokeWidth="1.5" opacity="0.5" />

          {/* Broken image icon at top-right */}
          <circle cx="95" cy="18" r="10" stroke="url(#grad)" strokeWidth="1.5" opacity="0.6" />
          <path d="M89 24 L95 12 L101 24" stroke="url(#grad)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6" />
          <circle cx="92" cy="16" r="2" fill="url(#grad)" opacity="0.6" />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setErrored(true)}
    />
  )
}
