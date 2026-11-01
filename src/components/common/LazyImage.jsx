import { useState } from 'react'

export default function LazyImage({ src, alt, className, width, height }) {
  const [loaded, setLoaded] = useState(false)
  const fallback = '/guns/pistol.svg'

  return (
    <div className={`lazy-img-wrap ${!loaded ? 'lazy-skeleton' : ''}`}>
      <img
        src={src || fallback}
        alt={alt || 'Gun image'}
        className={`${className || ''} ${loaded ? 'lazy-loaded' : 'lazy-loading'}`}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          e.target.src = fallback
          setLoaded(true)
        }}
      />
    </div>
  )
}