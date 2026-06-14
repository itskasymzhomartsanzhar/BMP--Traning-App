function Icon({ name }) {
  const props = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.9',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  }

  if (name === 'home') {
    return (
      <svg {...props}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V21h13V9.5" />
        <path d="M10 21v-5.5h4V21" />
      </svg>
    )
  }

  if (name === 'dumbbell') {
    return (
      <svg {...props}>
        <path d="M4 9v6" />
        <path d="M7 7v10" />
        <path d="M17 7v10" />
        <path d="M20 9v6" />
        <path d="M7 12h10" />
      </svg>
    )
  }

  if (name === 'nutrition') {
    return (
      <svg {...props}>
        <path d="M4 3v6a3 3 0 0 0 3 3h1" />
        <path d="M7 3v18" />
        <path d="M10 3v6" />
        <path d="M18 3v9" />
        <path d="M15 12h6" />
        <path d="M18 12v9" />
      </svg>
    )
  }

  if (name === 'knowledge') {
    return (
      <svg {...props}>
        <path d="M12 7v14" />
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
      </svg>
    )
  }

  if (name === 'analytics') {
    return (
      <svg {...props}>
        <path d="M4 20V10" />
        <path d="M10 20V4" />
        <path d="M16 20v-7" />
        <path d="M22 20V8" />
        <path d="M2 20h20" />
      </svg>
    )
  }

  if (name === 'chart') {
    return (
      <svg {...props}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 14 4-4 3 3 4-5" />
      </svg>
    )
  }

  if (name === 'user') {
    return (
      <svg {...props}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20a8 8 0 0 1 16 0" />
      </svg>
    )
  }

  if (name === 'bell') {
    return (
      <svg {...props}>
        <path d="M6 9a6 6 0 0 1 12 0v4.5l2 2V17H4v-1.5l2-2z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
    )
  }

  if (name === 'filter') {
    return (
      <svg {...props}>
        <path d="M4 7h16" />
        <path d="M7 12h10" />
        <path d="M10 17h4" />
      </svg>
    )
  }

  if (name === 'grid') {
    return (
      <svg {...props}>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    )
  }

  if (name === 'task') {
    return (
      <svg {...props}>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    )
  }

  return null
}

export default Icon
