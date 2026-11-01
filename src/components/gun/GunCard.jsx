import { useState } from 'react'
import { Share2, ShoppingBag, RotateCcw, Trash2 } from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import LazyImage from '../common/LazyImage'
import { formatPrice, truncate } from '../../utils/helpers'

export default function GunCard({ gun, onSelect, onEdit, onDelete, onRestore, onAddToCart }) {
  const [copied, setCopied] = useState(false)
  const imgSrc = (Array.isArray(gun.images) && gun.images[0]) || gun.image_url || '/guns/pistol.svg'
  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || ''
  const price = gun.price ?? 0

  const handleShare = (e) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}?gun=${gun.id}`

    if (navigator.share) {
      navigator.share({ title: gun.name, text: `Lihat ${gun.name} di Bore & Barrel!`, url: shareUrl }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <li className={`card ${gun.is_archived ? 'card--archived' : ''}`}>
      <button type="button" className="card-btn" onClick={() => onSelect(gun)}>
        <LazyImage src={imgSrc} alt={gun.name} className="card-img" width="240" height="180" />
        <span className="name display">{gun.name}</span>
        <span className="type">
          {category}
          {caliber ? ` · ${caliber}` : ''}
        </span>
        {gun.description && <span className="card-desc">{truncate(gun.description, 72)}</span>}
        <span className="price">{formatPrice(price)}</span>
      </button>

      <div className="card-actions">
        <FavoriteButton gunId={gun.id || gun.name} />
        
        <button
          type="button"
          className="card-act-btn"
          onClick={handleShare}
          title={copied ? 'Tautan disalin!' : 'Bagikan tautan'}
        >
          <Share2 size={14} color={copied ? 'var(--brass)' : 'var(--steel)'} />
        </button>

        {!gun.is_archived && onAddToCart && (
          <button
            type="button"
            className="card-act-btn"
            onClick={(e) => { e.stopPropagation(); onAddToCart(gun) }}
            title="Tambah ke Keranjang"
          >
            <ShoppingBag size={14} />
          </button>
        )}

        {gun.is_archived ? (
          <>
            {onRestore && (
              <button
                type="button"
                className="card-act-btn"
                onClick={(e) => { e.stopPropagation(); onRestore(gun) }}
                title="Pulihkan Hardware"
              >
                <RotateCcw size={14} color="#27ae60" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="card-act-btn card-act-btn--danger"
                onClick={(e) => { e.stopPropagation(); onDelete(gun, true) }}
                title="Hapus Permanen"
              >
                <Trash2 size={14} />
              </button>
            )}
          </>
        ) : (
          <>
            {onEdit && (
              <button
                type="button"
                className="card-act-btn"
                onClick={(e) => { e.stopPropagation(); onEdit(gun) }}
                title="Edit"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="card-act-btn card-act-btn--danger"
                onClick={(e) => { e.stopPropagation(); onDelete(gun, false) }}
                title="Arsipkan / Soft Delete"
              >
                🗑️
              </button>
            )}
          </>
        )}
      </div>
    </li>
  )
}