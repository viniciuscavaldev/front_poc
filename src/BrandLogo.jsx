import React, { useState } from 'react'

export default function BrandLogo({ sizeClass = 'w-8 h-8', textSize = 'text-sm' }) {
  const [logoFailed, setLogoFailed] = useState(false)

  if (logoFailed) {
    return (
      <div
        className={`${sizeClass} rounded-lg bg-[var(--accent-highlight)] text-[var(--accent-on-highlight)] flex items-center justify-center font-extrabold ${textSize} shrink-0 border border-[var(--border-subtle)]`}
      >
        N
      </div>
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-lg overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0`}
    >
      <img
        src="/cipetran.jpg"
        alt="Logo CIPETRAN / NECAVA"
        referrerPolicy="no-referrer"
        onError={() => setLogoFailed(true)}
        onLoad={(e) => {
          if (!e.currentTarget.naturalWidth) setLogoFailed(true)
        }}
        className="w-full h-full object-cover"
      />
    </div>
  )
}
