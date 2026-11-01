const fs = require('fs');
const path = require('path');

console.log('🚀 Memulai pembaharuan kode untuk Challenge Day 2 Part 2...\n');

// 1. Buat folder komponen baru jika belum ada
const newDirs = [
  'src/components/cart',
  'src/utils',
];
newDirs.forEach((dir) => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

const files = {
  // ---------------------------------------------------------------------------
  // 1. Utility Cache (Query Caching)
  // ---------------------------------------------------------------------------
  'src/utils/cache.js': `
const cacheStore = new Map()

export const getCache = (key) => {
  const item = cacheStore.get(key)
  if (!item) return null
  if (Date.now() > item.expiry) {
    cacheStore.delete(key)
    return null
  }
  return item.data
}

export const setCache = (key, data, ttlMs = 5 * 60 * 1000) => {
  cacheStore.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  })
}

export const clearCache = (key) => {
  if (key) cacheStore.delete(key)
  else cacheStore.clear()
}
`,

  // ---------------------------------------------------------------------------
  // 2. Hook Keranjang Belanja (Cart Management)
  // ---------------------------------------------------------------------------
  'src/hooks/useCart.js': `
import { useState, useEffect } from 'react'

const CART_KEY = 'bore_barrel_cart'

export function useCart() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems))
    } catch (err) {
      console.error('Failed to save cart:', err)
    }
  }, [cartItems])

  const addToCart = (gun, quantity = 1) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => String(item.id) === String(gun.id))
      if (existingIdx > -1) {
        const updated = [...prev]
        updated[existingIdx].quantity += quantity
        return updated
      }
      return [...prev, { ...gun, quantity }]
    })
  }

  const removeFromCart = (gunId) => {
    setCartItems((prev) => prev.filter((item) => String(item.id) !== String(gunId)))
  }

  const updateQuantity = (gunId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (String(item.id) === String(gunId)) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const clearCart = () => setCartItems([])

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const totalPrice = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0)

  return { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }
}
`,

  // ---------------------------------------------------------------------------
  // 3. Lazy Image Component (Lazy Loading)
  // ---------------------------------------------------------------------------
  'src/components/common/LazyImage.jsx': `
import { useState } from 'react'

export default function LazyImage({ src, alt, className, width, height }) {
  const [loaded, setLoaded] = useState(false)
  const fallback = '/guns/pistol.svg'

  return (
    <div className={\`lazy-img-wrap \${!loaded ? 'lazy-skeleton' : ''}\`}>
      <img
        src={src || fallback}
        alt={alt || 'Gun image'}
        className={\`\${className || ''} \${loaded ? 'lazy-loaded' : 'lazy-loading'}\`}
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
`,

  // ---------------------------------------------------------------------------
  // 4. Component Cart Drawer (Checkout WA)
  // ---------------------------------------------------------------------------
  'src/components/cart/CartDrawer.jsx': `
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { formatPrice } from '../../utils/helpers'

export default function CartDrawer({ open, onClose, cart }) {
  if (!open) return null

  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = cart

  const handleCheckoutWA = () => {
    if (cartItems.length === 0) return

    // Nomor WA Admin / Pribadi (Dapat disesuaikan)
    const phoneNumber = '6281234567890'
    
    let message = 'Hi aku mau pesan hardware berikut:\\n\\n'
    cartItems.forEach((item, idx) => {
      message += \`\${idx + 1}. \${item.name} (\${item.type || 'Gun'}) x\${item.quantity} - \${formatPrice((Number(item.price) || 0) * item.quantity)}\\n\`
    })
    message += \`\\n*Total Pembelian:* \${formatPrice(totalPrice)}\\n\`
    message += 'Mohon diproses orderan ini, terima kasih!'

    const waUrl = \`https://wa.me/\${phoneNumber}?text=\${encodeURIComponent(message)}\`
    window.open(waUrl, '_blank')
  }

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingBag size={20} stroke="var(--brass)" />
            <h2 className="display">Armory Cart</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={48} stroke="var(--steel)" />
              <p>Keranjang belanja kamu masih kosong.</p>
            </div>
          ) : (
            <ul className="cart-list">
              {cartItems.map((item) => (
                <li key={item.id} className="cart-item">
                  <img
                    src={(Array.isArray(item.images) && item.images[0]) || item.image_url || '/guns/pistol.svg'}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <span className="cart-item-name display">{item.name}</span>
                    <span className="cart-item-price">{formatPrice(item.price)}</span>
                    <div className="cart-item-qty">
                      <button type="button" className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus size={12} />
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button type="button" className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button type="button" className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Total:</span>
              <span className="cart-total-val">{formatPrice(totalPrice)}</span>
            </div>
            <button type="button" className="btn btn--primary cart-checkout-btn" onClick={handleCheckoutWA}>
              Checkout via WhatsApp <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
`,

  // ---------------------------------------------------------------------------
  // 5. Updated Review Service (CRUD + Thumbs Up/Down)
  // ---------------------------------------------------------------------------
  'src/services/reviewService.js': `
import { apiClient, IS_SUPABASE } from '../config/api'

const LOCAL_VOTES_KEY = 'bore_barrel_review_votes'

const getLocalVotes = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_VOTES_KEY)) || {}
  } catch {
    return {}
  }
}

class ReviewService {
  async getReviews(gunId) {
    if (IS_SUPABASE) {
      const data = await apiClient.get(
        \`/rest/v1/reviews?product_id=eq.\${gunId}&select=*&order=created_at.desc\`
      )
      const votes = getLocalVotes()
      const list = Array.isArray(data)
        ? data.map((r) => ({
            id: r.id,
            product_id: r.product_id,
            user_identifier: r.user_id ? \`Operator \${String(r.user_id).substring(0, 8)}\` : 'Anonymous',
            user_id: r.user_id,
            rating: r.rating,
            comment: r.comment || '',
            created_at: r.created_at,
            upvotes: (r.upvotes || 0) + (votes[r.id]?.up || 0),
            downvotes: (r.downvotes || 0) + (votes[r.id]?.down || 0),
            userVote: votes[r.id]?.myVote || null,
          }))
        : []
      return { success: true, data: list }
    }
    return apiClient.get(\`/api/v1/recipes/\${gunId}/reviews\`)
  }

  async createReview(gunId, reviewData) {
    if (IS_SUPABASE) {
      const payload = {
        product_id: Number(gunId),
        user_id: reviewData.user_id || reviewData.user_identifier,
        rating: Number(reviewData.rating),
        comment: reviewData.comment || '',
      }
      const res = await apiClient.post('/rest/v1/reviews', payload, {
        headers: { Prefer: 'return=representation' },
      })
      const created = Array.isArray(res) ? res[0] : res
      return { success: true, data: created }
    }
    return apiClient.post(\`/api/v1/recipes/\${gunId}/reviews\`, reviewData)
  }

  async updateReview(reviewId, reviewData) {
    if (IS_SUPABASE) {
      const res = await apiClient.patch(
        \`/rest/v1/reviews?id=eq.\${reviewId}\`,
        {
          rating: Number(reviewData.rating),
          comment: reviewData.comment,
        },
        { headers: { Prefer: 'return=representation' } }
      )
      return { success: true, data: Array.isArray(res) ? res[0] : res }
    }
    return apiClient.put(\`/api/v1/reviews/\${reviewId}\`, reviewData)
  }

  async deleteReview(reviewId) {
    if (IS_SUPABASE) {
      await apiClient.delete(\`/rest/v1/reviews?id=eq.\${reviewId}\`)
      return { success: true }
    }
    return apiClient.delete(\`/api/v1/reviews/\${reviewId}\`)
  }

  async voteReview(reviewId, type) {
    const votes = getLocalVotes()
    const current = votes[reviewId] || { up: 0, down: 0, myVote: null }

    if (current.myVote === type) {
      // Toggle off
      if (type === 'up') current.up = Math.max(0, current.up - 1)
      if (type === 'down') current.down = Math.max(0, current.down - 1)
      current.myVote = null
    } else {
      if (current.myVote === 'up') current.up = Math.max(0, current.up - 1)
      if (current.myVote === 'down') current.down = Math.max(0, current.down - 1)

      if (type === 'up') current.up += 1
      if (type === 'down') current.down += 1
      current.myVote = type
    }

    votes[reviewId] = current
    localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(votes))
    return { success: true, data: current }
  }
}

export default new ReviewService()
`,

  // ---------------------------------------------------------------------------
  // 6. Gun Service Updates (Caching, Soft Delete, Multi-Image)
  // ---------------------------------------------------------------------------
  'src/services/gunService.js': `
import { apiClient, IS_SUPABASE } from '../config/api'
import { getCache, setCache, clearCache } from '../utils/cache'

const SOFT_DELETED_KEY = 'bore_barrel_soft_deleted_ids'

export const getSoftDeletedIds = () => {
  try {
    return JSON.parse(localStorage.getItem(SOFT_DELETED_KEY)) || []
  } catch {
    return []
  }
}

export const setSoftDeletedIds = (ids) => {
  try {
    localStorage.setItem(SOFT_DELETED_KEY, JSON.stringify(ids))
  } catch {}
}

export const normalizeProduct = (item) => {
  if (!item) return null
  let specsList = []
  if (Array.isArray(item.specs)) {
    specsList = item.specs.map((s, idx) => {
      if (typeof s === 'string') {
        const colonIndex = s.indexOf(':')
        if (colonIndex > -1) {
          return {
            id: \`spec-\${idx}\`,
            name: s.substring(0, colonIndex).trim(),
            quantity: s.substring(colonIndex + 1).trim(),
          }
        }
        return { id: \`spec-\${idx}\`, name: 'Specification', quantity: s.trim() }
      }
      return s
    })
  } else if (Array.isArray(item.ingredients)) {
    specsList = item.ingredients
  }

  const stepsList =
    Array.isArray(item.steps) && item.steps.length > 0
      ? item.steps
      : ['Verify firearm is completely unloaded.', 'Inspect receiver and mechanism.']

  // Multi-image parsing
  let images = []
  if (Array.isArray(item.images) && item.images.length > 0) {
    images = item.images
  } else if (typeof item.images === 'string' && item.images.trim()) {
    try {
      images = JSON.parse(item.images)
    } catch {
      images = item.images.split(',').map((s) => s.trim())
    }
  } else {
    images = [item.image_url || item.image || '/guns/pistol.svg']
  }

  const softDeleted = getSoftDeletedIds()
  const isArchived = Boolean(item.is_archived || softDeleted.includes(String(item.id)))

  return {
    ...item,
    id: item.id,
    name: item.name || 'Hardware Piece',
    type: item.type || item.category || 'Hardware',
    category: item.type || item.category || 'Hardware',
    caliber: item.caliber || 'Standard',
    price: Number(item.price ?? item.cook_time ?? 0),
    description: item.description || '',
    image_url: images[0] || '/guns/pistol.svg',
    images: images,
    ingredients: specsList,
    steps: stepsList,
    is_archived: isArchived,
  }
}

class GunService {
  async getGuns(params = {}, bypassCache = false) {
    const cacheKey = \`guns_\${JSON.stringify(params)}\`
    if (!bypassCache) {
      const cached = getCache(cacheKey)
      if (cached) return cached
    }

    if (IS_SUPABASE) {
      const queryParts = ['select=*']
      if (params.search) {
        queryParts.push(\`name=ilike.*\${encodeURIComponent(params.search)}*\`)
      }
      if (params.category && params.category !== 'All') {
        queryParts.push(\`type=eq.\${encodeURIComponent(params.category)}\`)
      }
      if (params.sort_by) {
        const order = params.order === 'desc' ? 'desc' : 'asc'
        queryParts.push(\`order=\${encodeURIComponent(params.sort_by)}.\${order}\`)
      } else {
        queryParts.push('order=created_at.desc')
      }
      if (params.limit) {
        queryParts.push(\`limit=\${params.limit}\`)
      }
      const queryString = queryParts.join('&')
      const data = await apiClient.get(\`/rest/v1/products?\${queryString}\`)
      const list = Array.isArray(data) ? data.map(normalizeProduct) : []
      const res = {
        success: true,
        data: list,
        pagination: {
          total: list.length,
          page: params.page || 1,
          limit: params.limit || 50,
        },
      }
      setCache(cacheKey, res)
      return res
    }
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    )
    const res = await apiClient.get('/api/v1/recipes', { params: clean })
    setCache(cacheKey, res)
    return res
  }

  async getGunById(id) {
    if (IS_SUPABASE) {
      const data = await apiClient.get(\`/rest/v1/products?id=eq.\${id}&select=*\`)
      if (Array.isArray(data) && data.length > 0) {
        return { success: true, data: normalizeProduct(data[0]) }
      }
      throw new Error('Hardware item not found.')
    }
    return apiClient.get(\`/api/v1/recipes/\${id}\`)
  }

  async createGun(data) {
    clearCache()
    if (IS_SUPABASE) {
      const specsArray = Array.isArray(data.ingredients)
        ? data.ingredients.map((i) => \`\${i.name}: \${i.quantity}\`)
        : Array.isArray(data.specs)
        ? data.specs
        : []
      const payload = {
        name: data.name,
        type: data.type || 'Pistol',
        caliber: data.caliber || '9mm',
        price: Number(data.price ?? 0),
        description: data.description || '',
        specs: specsArray,
        image_url: Array.isArray(data.images) ? data.images[0] : data.image_url,
        images: Array.isArray(data.images) ? data.images : [data.image_url],
      }
      const res = await apiClient.post('/rest/v1/products', payload, {
        headers: { Prefer: 'return=representation' },
      })
      const created = Array.isArray(res) ? res[0] : res
      return { success: true, data: normalizeProduct(created) }
    }
    return apiClient.post('/api/v1/recipes', data)
  }

  async updateGun(id, data) {
    clearCache()
    if (IS_SUPABASE) {
      const payload = { updated_at: new Date().toISOString() }
      if (data.name !== undefined) payload.name = data.name
      if (data.type !== undefined) payload.type = data.type
      if (data.caliber !== undefined) payload.caliber = data.caliber
      if (data.price !== undefined) payload.price = Number(data.price)
      if (data.description !== undefined) payload.description = data.description
      if (data.images !== undefined) {
        payload.images = data.images
        payload.image_url = data.images[0]
      }
      const res = await apiClient.patch(\`/rest/v1/products?id=eq.\${id}\`, payload, {
        headers: { Prefer: 'return=representation' },
      })
      const updated = Array.isArray(res) ? res[0] : res
      return { success: true, data: normalizeProduct(updated) }
    }
    return apiClient.put(\`/api/v1/recipes/\${id}\`, data)
  }

  // Soft Delete (Archive)
  async softDeleteGun(id) {
    clearCache()
    const current = getSoftDeletedIds()
    if (!current.includes(String(id))) {
      current.push(String(id))
      setSoftDeletedIds(current)
    }
    return { success: true }
  }

  // Restore Soft Delete
  async restoreGun(id) {
    clearCache()
    const current = getSoftDeletedIds().filter((item) => item !== String(id))
    setSoftDeletedIds(current)
    return { success: true }
  }

  // Permanent Delete
  async deleteGunPermanently(id) {
    clearCache()
    this.restoreGun(id)
    if (IS_SUPABASE) {
      await apiClient.delete(\`/rest/v1/products?id=eq.\${id}\`)
      return { success: true }
    }
    return apiClient.delete(\`/api/v1/recipes/\${id}\`)
  }
}

export default new GunService()
`,

  // ---------------------------------------------------------------------------
  // 7. Gun Card Component (Share, Add to Cart, Soft Delete UI)
  // ---------------------------------------------------------------------------
  'src/components/gun/GunCard.jsx': `
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
    const shareUrl = \`\${window.location.origin}?gun=\${gun.id}\`

    if (navigator.share) {
      navigator.share({ title: gun.name, text: \`Lihat \${gun.name} di Bore & Barrel!\`, url: shareUrl }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <li className={\`card \${gun.is_archived ? 'card--archived' : ''}\`}>
      <button type="button" className="card-btn" onClick={() => onSelect(gun)}>
        <LazyImage src={imgSrc} alt={gun.name} className="card-img" width="240" height="180" />
        <span className="name display">{gun.name}</span>
        <span className="type">
          {category}
          {caliber ? \` · \${caliber}\` : ''}
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
`,

  // ---------------------------------------------------------------------------
  // 8. Gun Detail Component (Multi-Image Carousel, Review CRUD & Voting, Share)
  // ---------------------------------------------------------------------------
  'src/components/gun/GunDetail.jsx': `
import { useState } from 'react'
import {
  ArrowLeft,
  Star,
  Send,
  Loader,
  Share2,
  ShoppingBag,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  Trash2,
  X,
} from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import LazyImage from '../common/LazyImage'
import reviewService from '../../services/reviewService'
import { useReviews, useCreateReview } from '../../hooks/useReviews'
import { getUserIdentifier } from '../../services/userService'
import { formatPrice, averageRating } from '../../utils/helpers'

export default function GunDetail({ gun, onBack, onEdit, onDelete, onAddToCart }) {
  const images = Array.isArray(gun.images) && gun.images.length > 0 ? gun.images : [gun.image_url || '/guns/pistol.svg']
  const [activeImgIndex, setActiveImgIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || ''
  const price = gun.price ?? 0

  // Reviews CRUD
  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useReviews(gun.id)
  const { createReview, loading: submitting } = useCreateReview()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  const avgRating = gun.average_rating || averageRating(reviews)
  const reviewCount = gun.review_count ?? reviews.length
  const currentUserId = getUserIdentifier()

  const handleShare = () => {
    const shareUrl = \`\${window.location.origin}?gun=\${gun.id}\`
    if (navigator.share) {
      navigator.share({ title: gun.name, text: \`Lihat \${gun.name} di Bore & Barrel!\`, url: shareUrl }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess('')

    if (editingReviewId) {
      const res = await reviewService.updateReview(editingReviewId, { rating, comment: comment.trim() })
      if (res.success) {
        setReviewSuccess('Review berhasil diperbarui!')
        setEditingReviewId(null)
        setComment('')
        setRating(5)
        refetchReviews()
      } else {
        setReviewError('Gagal mengedit review.')
      }
      return
    }

    const result = await createReview(gun.id, {
      user_identifier: currentUserId,
      rating,
      comment: comment.trim(),
    })

    if (result) {
      setReviewSuccess('Review berhasil ditambahkan!')
      setComment('')
      setRating(5)
      refetchReviews()
    } else {
      setReviewError('Gagal mengirimkan review.')
    }
  }

  const handleEditClick = (rev) => {
    setEditingReviewId(rev.id)
    setRating(rev.rating)
    setComment(rev.comment)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  const handleDeleteReview = async (revId) => {
    if (window.confirm('Hapus review ini?')) {
      await reviewService.deleteReview(revId)
      refetchReviews()
    }
  }

  const handleVote = async (revId, type) => {
    await reviewService.voteReview(revId, type)
    refetchReviews()
  }

  return (
    <div className="detail">
      <div className="detail-top-bar">
        <button type="button" className="detail-back" onClick={onBack}>
          <ArrowLeft size={18} /> Kembali ke Katalog
        </button>
        <button type="button" className="btn btn--outline btn--sm" onClick={handleShare}>
          <Share2 size={14} /> {copied ? 'Tautan Disalin!' : 'Bagikan Tautan'}
        </button>
      </div>

      <div className="detail-hero">
        <div className="detail-gallery">
          <LazyImage src={images[activeImgIndex]} alt={gun.name} className="detail-img" />
          {images.length > 1 && (
            <div className="detail-thumbs">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={\`thumb-btn \${activeImgIndex === idx ? 'thumb-btn--active' : ''}\`}
                  onClick={() => setActiveImgIndex(idx)}
                >
                  <img src={img} alt={\`Thumb \${idx}\`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <h1 className="display">{gun.name}</h1>
          <p className="type">
            {category}
            {caliber ? \` · \${caliber}\` : ''}
          </p>
          <p className="price detail-price">{formatPrice(price)}</p>

          {avgRating > 0 && (
            <p className="detail-rating">
              <Star size={16} fill="var(--brass)" stroke="var(--brass)" />
              {avgRating.toFixed(1)} ({reviewCount} ulasan)
            </p>
          )}

          <div className="detail-actions">
            <FavoriteButton gunId={gun.id || gun.name} />
            {onAddToCart && (
              <button type="button" className="btn btn--primary" onClick={() => onAddToCart(gun)}>
                <ShoppingBag size={16} /> Tambah ke Keranjang
              </button>
            )}
            {onEdit && (
              <button type="button" className="btn btn--outline" onClick={() => onEdit(gun)}>
                Edit
              </button>
            )}
            {onDelete && (
              <button type="button" className="btn btn--danger" onClick={() => onDelete(gun)}>
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="detail-section">
        <h2>Deskripsi</h2>
        <p>{gun.description || 'Tidak ada deskripsi.'}</p>
      </section>

      {gun.ingredients && gun.ingredients.length > 0 && (
        <section className="detail-section">
          <h2>Spesifikasi</h2>
          <ul className="detail-specs">
            {gun.ingredients.map((ing, i) => (
              <li key={i}>
                <strong>{ing.name}</strong> — {ing.quantity}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Review CRUD & Thumbs Up/Down */}
      <section className="detail-section">
        <h2>Ulasan & Rating</h2>

        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="review-form-head">
            <span>{editingReviewId ? 'Edit Ulasan Kamu' : 'Tulis Ulasan Baru'}</span>
            {editingReviewId && (
              <button
                type="button"
                className="icon-btn"
                onClick={() => { setEditingReviewId(null); setComment(''); setRating(5); }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" className="star-btn" onClick={() => setRating(n)}>
                <Star
                  size={22}
                  fill={n <= rating ? 'var(--brass)' : 'none'}
                  stroke={n <= rating ? 'var(--brass)' : 'var(--steel)'}
                />
              </button>
            ))}
          </div>

          <textarea
            className="review-input"
            rows="3"
            placeholder="Bagikan ulasan tentang hardware ini..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />

          <button type="submit" className="btn btn--primary" disabled={submitting || !gun.id}>
            {submitting ? <Loader size={16} className="spin" /> : <Send size={16} />}
            {editingReviewId ? ' Simpan Perubahan' : ' Kirim Ulasan'}
          </button>

          {reviewError && <p className="form-error">{reviewError}</p>}
          {reviewSuccess && <p className="form-success">{reviewSuccess}</p>}
        </form>

        {reviewsLoading ? (
          <p className="detail-loading">Memuat ulasan…</p>
        ) : reviews.length > 0 ? (
          <ul className="review-list">
            {reviews.map((rev) => {
              const isOwner = String(rev.user_id) === String(currentUserId)
              return (
                <li key={rev.id} className="review-item">
                  <div className="review-head">
                    <span className="review-user">{rev.user_identifier}</span>
                    <span className="review-stars-display">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < rev.rating ? 'var(--brass)' : 'none'}
                          stroke={i < rev.rating ? 'var(--brass)' : 'var(--line)'}
                        />
                      ))}
                    </span>
                  </div>
                  {rev.comment && <p className="review-comment">{rev.comment}</p>}

                  <div className="review-footer-bar">
                    <div className="review-votes">
                      <button
                        type="button"
                        className={\`vote-btn \${rev.userVote === 'up' ? 'vote-btn--active' : ''}\`}
                        onClick={() => handleVote(rev.id, 'up')}
                      >
                        <ThumbsUp size={14} /> <span>{rev.upvotes || 0}</span>
                      </button>
                      <button
                        type="button"
                        className={\`vote-btn \${rev.userVote === 'down' ? 'vote-btn--active' : ''}\`}
                        onClick={() => handleVote(rev.id, 'down')}
                      >
                        <ThumbsDown size={14} /> <span>{rev.downvotes || 0}</span>
                      </button>
                    </div>

                    {isOwner && (
                      <div className="review-owner-actions">
                        <button type="button" className="icon-btn" onClick={() => handleEditClick(rev)}>
                          <Edit2 size={13} />
                        </button>
                        <button type="button" className="icon-btn icon-btn--danger" onClick={() => handleDeleteReview(rev.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="detail-empty">Belum ada ulasan.</p>
        )}
      </section>
    </div>
  )
}
`,

  // ---------------------------------------------------------------------------
  // 9. Create Gun Page (Multi-Image Support)
  // ---------------------------------------------------------------------------
  'src/pages/CreateGunPage.jsx': `
import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Upload, X, Plus, Loader, Save, CheckCircle, AlertCircle } from 'lucide-react'
import gunService from '../services/gunService'
import uploadService from '../services/uploadService'
import { saveDraft, loadDraft, deleteDraft, hasDraft, getDraftTimestamp, formatDraftTime } from '../utils/draftStorage'
import ConfirmModal from '../components/modals/ConfirmModal'

export default function CreateGunPage({ onBack, onSuccess }) {
  const [currentStep, setCurrentStep] = useState('upload')
  const [formData, setFormData] = useState({
    name: '',
    type: 'Pistol',
    caliber: '9mm',
    price: 599,
    description: '',
  })

  // Multi-image list
  const [imageUrls, setImageUrls] = useState([])
  const [inputUrl, setInputUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const [specs, setSpecs] = useState([
    { name: 'Frame', quantity: 'Polymer' },
    { name: 'Action', quantity: 'Striker-Fired' },
  ])
  const [steps, setSteps] = useState(['Verify firearm is completely unloaded.'])

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [showDraftModal, setShowDraftModal] = useState(() => hasDraft('create'))

  const addImageUrl = (url) => {
    if (url && !imageUrls.includes(url)) {
      setImageUrls((prev) => [...prev, url])
    }
  }

  const removeImageUrl = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      setUploading(true)
      const res = await uploadService.uploadImage(file)
      if (res.success && res.data?.url) {
        addImageUrl(res.data.url)
      }
    } catch {
      addImageUrl(URL.createObjectURL(file))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return setError('Nama wajib diisi.')
    if (imageUrls.length === 0) return setError('Paling sedikit 1 gambar harus ditambahkan.')

    const payload = {
      ...formData,
      images: imageUrls,
      ingredients: specs.filter((s) => s.name.trim()),
      steps: steps.filter((s) => s.trim()),
    }

    try {
      setCreating(true)
      const res = await gunService.createGun(payload)
      if (res.success || res.data) {
        deleteDraft('create')
        if (onSuccess) onSuccess(res.data)
        else onBack()
      }
    } catch (err) {
      setError(err.message || 'Gagal menyimpan.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="form-page">
      <div className="form-head">
        <button type="button" className="detail-back" onClick={onBack}><ArrowLeft size={18} /> Kembali</button>
      </div>

      <h1 className="display">Register New Hardware</h1>

      {error && <div className="toast toast--error"><AlertCircle size={18} /> {error}</div>}

      <form onSubmit={handleSubmit} className="entry-form">
        {/* Multi Image Uploader */}
        <div className="card-box">
          <h2 className="card-box-title">Multi-Gambar Katalog</h2>
          <div className="multi-img-upload-grid">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="multi-img-preview">
                <img src={url} alt={\`Gambar \${idx + 1}\`} />
                <button type="button" className="multi-img-del" onClick={() => removeImageUrl(idx)}><X size={14} /></button>
              </div>
            ))}
          </div>

          <div className="multi-img-input-row">
            <input
              type="text"
              placeholder="Masukkan URL Gambar..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="form-input"
            />
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => { addImageUrl(inputUrl); setInputUrl(''); }}
            >
              <Plus size={14} /> URL
            </button>
            <label className="btn btn--primary">
              <Upload size={14} /> Upload File
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden-file-input" />
            </label>
          </div>
          <div className="preset-pills" style={{ marginTop: '12px' }}>
            <span className="preset-title">Preset Vector:</span>
            <button type="button" className="pill" onClick={() => addImageUrl('/guns/pistol.svg')}>Pistol</button>
            <button type="button" className="pill" onClick={() => addImageUrl('/guns/rifle.svg')}>Rifle</button>
            <button type="button" className="pill" onClick={() => addImageUrl('/guns/shotgun.svg')}>Shotgun</button>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Model Designation *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select value={formData.type} onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))} className="form-select">
              <option value="Pistol">Pistol</option>
              <option value="Rifle">Rifle</option>
              <option value="Shotgun">Shotgun</option>
            </select>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Caliber *</label>
            <input type="text" value={formData.caliber} onChange={(e) => setFormData(p => ({ ...p, caliber: e.target.value }))} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Price (USD) *</label>
            <input type="number" value={formData.price} onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))} className="form-input" required />
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="button" className="btn btn--outline" onClick={onBack}>Batal</button>
          <button type="submit" className="btn btn--primary" disabled={creating}>
            {creating ? <Loader size={16} className="spin" /> : 'Daftarkan Hardware'}
          </button>
        </div>
      </form>
    </div>
  )
}
`,

  // ---------------------------------------------------------------------------
  // 10. Edit Profile Page (Separate Page Requirement)
  // ---------------------------------------------------------------------------
  'src/pages/EditProfilePage.jsx': `
import { useState } from 'react'
import { ArrowLeft, Save, Camera, Check } from 'lucide-react'
import userService from '../services/userService'

export default function EditProfilePage({ onBack, onSaveSuccess }) {
  const [profile, setProfile] = useState(() => userService.getUserProfile())
  const [username, setUsername] = useState(profile.username || 'Shooter')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatar, setAvatar] = useState(profile.avatar || null)
  const [feedback, setFeedback] = useState('')

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setAvatar(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = (e) => {
    e.preventDefault()
    const updated = { ...profile, username: username.trim(), bio: bio.trim(), avatar }
    const result = userService.saveUserProfile(updated)
    if (result.success) {
      setFeedback('Profil berhasil diperbarui!')
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess()
        else onBack()
      }, 1000)
    }
  }

  return (
    <div className="page">
      <button type="button" className="detail-back" onClick={onBack} style={{ marginBottom: '20px' }}>
        <ArrowLeft size={18} /> Kembali ke Profile
      </button>

      <h1 className="display">Edit Profile Operator</h1>

      {feedback && <div className="toast toast--success"><Check size={18} /> {feedback}</div>}

      <form onSubmit={handleSave} className="profile-form">
        <div className="avatar-wrap" style={{ margin: '0 auto 16px' }}>
          {avatar ? (
            <img src={avatar} alt="Avatar" className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">👤</div>
          )}
          <label htmlFor="edit-avatar-input" className="avatar-upload-btn">
            <Camera size={14} />
            <input id="edit-avatar-input" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden-file-input" />
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Callsign / Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="form-input" required />
        </div>

        <div className="form-group">
          <label className="form-label">Bio / Operational Notes</label>
          <textarea rows="3" value={bio} onChange={(e) => setBio(e.target.value)} className="form-textarea" />
        </div>

        <div className="form-actions-bar">
          <button type="button" className="btn btn--outline" onClick={onBack}>Batal</button>
          <button type="submit" className="btn btn--primary"><Save size={16} /> Simpan Perubahan</button>
        </div>
      </form>
    </div>
  )
}
`,

  // ---------------------------------------------------------------------------
  // 11. Profile Page (Integrated About, Contact, Drafts, Edit Profile Button)
  // ---------------------------------------------------------------------------
  'src/pages/ProfilePage.jsx': `
import { useState } from 'react'
import { Shield, Copy, Check, Heart, FileText, UserEdit, Trash2, ArrowRight } from 'lucide-react'
import userService from '../services/userService'
import { useFavorites } from '../hooks/useFavorites'
import { getAllDraftIds, loadDraft, deleteDraft } from '../utils/draftStorage'
import About from './About'
import Contact from './Contact'

export default function ProfilePage({ onNavigateEditProfile, onResumeDraft }) {
  const [profile] = useState(() => userService.getUserProfile())
  const [copied, setCopied] = useState(false)
  const { favorites } = useFavorites()

  // Drafts list
  const [draftIds, setDraftIds] = useState(() => getAllDraftIds())

  const handleCopyId = () => {
    if (profile.userId) {
      navigator.clipboard.writeText(profile.userId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDeleteDraft = (id) => {
    deleteDraft(id)
    setDraftIds(getAllDraftIds())
  }

  return (
    <div className="profile-page">
      <section className="masthead" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="display">Operator Profile</h1>
          <p className="lede">Kredensial operator, arsip draft, tentang kami, dan kontak.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={onNavigateEditProfile}>
          <UserEdit size={16} /> Edit Profile
        </button>
      </section>

      {/* Operator Card */}
      <div className="profile-card">
        <div className="profile-card-top">
          <div className="avatar-wrap">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <Shield size={36} stroke="var(--brass)" />
              </div>
            )}
          </div>
          <div className="profile-identity">
            <h2 className="display">{profile.username || 'Shooter'}</h2>
            <div className="profile-id-row">
              <span className="mono-badge">{profile.userId}</span>
              <button type="button" className="icon-btn" onClick={handleCopyId}>
                {copied ? <Check size={14} color="var(--brass)" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <Heart size={20} stroke="var(--brass)" />
            <div className="stat-val">{favorites.length}</div>
            <div className="stat-label">Favorites</div>
          </div>
          <div className="stat-item">
            <FileText size={20} stroke="var(--steel)" />
            <div className="stat-val">{draftIds.length}</div>
            <div className="stat-label">Saved Drafts</div>
          </div>
        </div>
      </div>

      {/* Section Drafts */}
      <section className="profile-section">
        <h2 className="section-title">Daftar Katalog Draft</h2>
        {draftIds.length === 0 ? (
          <p className="form-hint" style={{ marginTop: '8px' }}>Tidak ada draf katalog yang tersimpan.</p>
        ) : (
          <ul className="draft-list">
            {draftIds.map((id) => {
              const draft = loadDraft(id)
              const name = draft?.formData?.name || \`Draft (\${id})\`
              return (
                <li key={id} className="draft-item">
                  <span>{name}</span>
                  <div className="draft-actions">
                    {onResumeDraft && (
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => onResumeDraft(id)}>
                        Lanjutkan <ArrowRight size={12} />
                      </button>
                    )}
                    <button type="button" className="icon-btn icon-btn--danger" onClick={() => handleDeleteDraft(id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Section About & Contact (Dipindahkan ke dalam Profile) */}
      <section className="profile-section">
        <h2>About Us</h2>
        <About />
      </section>

      <section className="profile-section">
        <h2>Contact Shop</h2>
        <Contact />
      </section>
    </div>
  )
}
`,

  // ---------------------------------------------------------------------------
  // 12. Catalog Page (Pagination, Cache, Soft Delete / Archive Toggle)
  // ---------------------------------------------------------------------------
  'src/pages/Catalog.jsx': `
import { useState, useMemo, useEffect } from 'react'
import { RefreshCw, Plus, Loader, AlertCircle, PackageOpen, Archive, Check } from 'lucide-react'
import { useGuns } from '../hooks/useGuns'
import GUNS_LOCAL from '../data/guns'
import GunCard from '../components/gun/GunCard'
import GunDetail from '../components/gun/GunDetail'
import AdvancedFilter from '../components/common/AdvancedFilter'
import ConfirmModal from '../components/modals/ConfirmModal'
import gunService from '../services/gunService'
import { matchesSearch, matchesCategory, sortItems, extractCategories } from '../utils/helpers'

const PAGE_SIZE = 6

export default function Catalog({ onNavigate, onAddToCart }) {
  const { guns: apiGuns, loading, error, refetch } = useGuns({ limit: 100 })
  const [useLocal, setUseLocal] = useState(false)
  const [viewArchived, setViewArchived] = useState(false)

  const rawGuns = useMemo(() => {
    if (useLocal || (error && apiGuns.length === 0)) {
      return GUNS_LOCAL.map((g, i) => ({ ...g, id: g.id || \`local-\${i}\` }))
    }
    return apiGuns
  }, [apiGuns, error, useLocal])

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page, setPage] = useState(1)

  const categories = useMemo(() => extractCategories(rawGuns), [rawGuns])

  // Filter Active vs Archived (Soft Deleted)
  const filteredGuns = useMemo(() => {
    let result = rawGuns.filter((g) => {
      const matchSearch = matchesSearch(g, search)
      const matchCat = matchesCategory(g, activeCategory)
      const isArchived = Boolean(g.is_archived)
      return matchSearch && matchCat && (viewArchived ? isArchived : !isArchived)
    })
    return sortItems(result, sortKey, sortOrder)
  }, [rawGuns, search, activeCategory, sortKey, sortOrder, viewArchived])

  // Pagination calculation
  const totalPages = Math.ceil(filteredGuns.length / PAGE_SIZE) || 1
  const paginatedGuns = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredGuns.slice(start, start + PAGE_SIZE)
  }, [filteredGuns, page])

  useEffect(() => {
    setPage(1)
  }, [search, activeCategory, sortKey, sortOrder, viewArchived])

  // Modal target
  const [selectedGun, setSelectedGun] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isPermanentDelete, setIsPermanentDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      if (isPermanentDelete) {
        await gunService.deleteGunPermanently(deleteTarget.id)
      } else {
        await gunService.softDeleteGun(deleteTarget.id)
      }
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      alert(err.message || 'Gagal menghapus.')
    } finally {
      setDeleting(false)
    }
  }

  const handleRestore = async (gun) => {
    await gunService.restoreGun(gun.id)
    refetch()
  }

  if (selectedGun) {
    return (
      <GunDetail
        gun={selectedGun}
        onBack={() => setSelectedGun(null)}
        onEdit={(g) => onNavigate && onNavigate('Edit', g)}
        onDelete={(g) => { setSelectedGun(null); setDeleteTarget(g); setIsPermanentDelete(false); }}
        onAddToCart={onAddToCart}
      />
    )
  }

  return (
    <>
      <section className="masthead">
        <h1 className="display">Hardware, by the spec sheet.</h1>
        <p className="lede">A small armory of pistols, rifles, and shotguns.</p>
      </section>

      <section>
        <div className="list-head">
          <div className="view-toggle-tabs">
            <button
              type="button"
              className={\`tab-btn \${!viewArchived ? 'tab-btn--active' : ''}\`}
              onClick={() => setViewArchived(false)}
            >
              Aktif ({rawGuns.filter(g => !g.is_archived).length})
            </button>
            <button
              type="button"
              className={\`tab-btn \${viewArchived ? 'tab-btn--active' : ''}\`}
              onClick={() => setViewArchived(true)}
            >
              <Archive size={14} /> Arsip / Soft Deleted ({rawGuns.filter(g => g.is_archived).length})
            </button>
          </div>

          <div className="list-head-right">
            {onNavigate && (
              <button type="button" className="btn btn--primary btn--sm" onClick={() => onNavigate('Create')}>
                <Plus size={16} /> Add
              </button>
            )}
          </div>
        </div>

        <AdvancedFilter
          search={search}
          onSearch={setSearch}
          categories={categories}
          activeCategory={activeCategory}
          onCategory={setActiveCategory}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={({ key, order }) => { setSortKey(key); setSortOrder(order) }}
        />

        {loading && (
          <div className="state-box">
            <Loader size={28} className="spin" />
            <p>Loading products…</p>
          </div>
        )}

        {!loading && paginatedGuns.length === 0 && (
          <div className="state-box">
            <PackageOpen size={28} />
            <p>{viewArchived ? 'Tidak ada hardware di arsip.' : 'Tidak ada produk yang cocok.'}</p>
          </div>
        )}

        {paginatedGuns.length > 0 && (
          <>
            <ul className="stock">
              {paginatedGuns.map((gun) => (
                <GunCard
                  key={gun.id || gun.name}
                  gun={gun}
                  onSelect={setSelectedGun}
                  onEdit={onNavigate ? (g) => onNavigate('Edit', g) : undefined}
                  onDelete={(g, isPerm) => { setDeleteTarget(g); setIsPermanentDelete(isPerm); }}
                  onRestore={handleRestore}
                  onAddToCart={onAddToCart}
                />
              ))}
            </ul>

            {/* Paginasi Katalog */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span className="page-num-info">Halaman {page} dari {totalPages}</span>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <ConfirmModal
        open={!!deleteTarget}
        title={isPermanentDelete ? 'Hapus Permanen' : 'Arsipkan Hardware (Soft Delete)'}
        message={
          isPermanentDelete
            ? \`Apakah kamu yakin ingin menghapus "\${deleteTarget?.name}" secara permanen?\`
            : \`Pindahkan "\${deleteTarget?.name}" ke arsip? Produk ini bisa dipulihkan kembali.\`
        }
        confirmLabel={isPermanentDelete ? 'Hapus Permanen' : 'Arsipkan'}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
`,

  // ---------------------------------------------------------------------------
  // 13. Header Navigation (With Cart Icon & Badge)
  // ---------------------------------------------------------------------------
  'src/components/Header.jsx': `
import { Plus, ShoppingBag } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

const NAV_ITEMS = [
  { id: 'Catalog', label: 'Catalog' },
  { id: 'Favorites', label: 'Favorites', hasBadge: true },
  { id: 'Profile', label: 'Profile' },
]

function Header({ tab, onTab, onNavigateCreate, cartCount, onOpenCart }) {
  const { favorites } = useFavorites()
  const favCount = favorites ? favorites.length : 0

  return (
    <header className="header">
      <div className="header-brand-wrap" onClick={() => onTab('Catalog')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="header-logo-badge">
          <img src="/logo.png" alt="Bore & Barrel" />
        </div>
        <span className="brand display">Bore &amp; Barrel</span>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'nav-link active' : 'nav-link'}
            onClick={() => onTab(item.id)}
          >
            {item.label}
            {item.hasBadge && favCount > 0 && <span className="nav-badge">{favCount}</span>}
          </button>
        ))}
      </nav>

      <div className="header-right-actions">
        <button type="button" className="cart-trigger-btn" onClick={onOpenCart} title="Keranjang Belanja">
          <ShoppingBag size={18} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>

        {onNavigateCreate && (
          <button type="button" className="btn btn--primary btn--sm header-cta" onClick={onNavigateCreate}>
            <Plus size={15} /> Add Hardware
          </button>
        )}
      </div>
    </header>
  )
}
export default Header
`,

  // ---------------------------------------------------------------------------
  // 14. App Root Component (Integration of Cart, Routes, URL Params Share Link)
  // ---------------------------------------------------------------------------
  'src/App.jsx': `
import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Catalog from './pages/Catalog.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import EditProfilePage from './pages/EditProfilePage.jsx'
import CreateGunPage from './pages/CreateGunPage.jsx'
import EditGunPage from './pages/EditGunPage.jsx'
import GunDetail from './components/gun/GunDetail.jsx'
import PWABadge from './components/PWABadge.jsx'
import SplashScreen from './components/common/SplashScreen.jsx'
import CartDrawer from './components/cart/CartDrawer.jsx'
import { useCart } from './hooks/useCart.js'
import gunService from './services/gunService.js'
import './App.css'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [tab, setTab] = useState('Catalog')
  const [mode, setMode] = useState('list') // 'list' | 'create' | 'edit' | 'detail' | 'edit-profile'
  const [selectedGun, setSelectedGun] = useState(null)
  const [editingGun, setEditingGun] = useState(null)
  
  // Cart state
  const cart = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  // Auto detect Share Link (?gun=ID)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const gunId = params.get('gun')
    if (gunId) {
      gunService.getGunById(gunId).then((res) => {
        if (res.data) {
          setSelectedGun(res.data)
          setMode('detail')
        }
      }).catch(() => {})
    }
  }, [])

  const handleNavigate = (target, payload) => {
    if (target === 'Create') setMode('create')
    else if (target === 'Edit') { setEditingGun(payload); setMode('edit'); }
    else if (target === 'Detail') { setSelectedGun(payload); setMode('detail'); }
    else if (target === 'EditProfile') setMode('edit-profile')
    else {
      setTab(target)
      setMode('list')
      setSelectedGun(null)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="shell">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <Header
        tab={mode === 'list' ? tab : ''}
        onTab={(t) => handleNavigate(t)}
        onNavigateCreate={() => handleNavigate('Create')}
        cartCount={cart.totalItems}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="main">
        {mode === 'create' && (
          <CreateGunPage onBack={() => setMode('list')} onSuccess={() => { setMode('list'); setTab('Catalog'); }} />
        )}

        {mode === 'edit' && (
          <EditGunPage gun={editingGun} gunId={editingGun?.id} onBack={() => setMode('list')} onSuccess={() => { setMode('list'); setTab('Catalog'); }} />
        )}

        {mode === 'detail' && selectedGun && (
          <GunDetail
            gun={selectedGun}
            onBack={() => setMode('list')}
            onEdit={(g) => handleNavigate('Edit', g)}
            onAddToCart={cart.addToCart}
          />
        )}

        {mode === 'edit-profile' && (
          <EditProfilePage onBack={() => setMode('list')} onSaveSuccess={() => { setMode('list'); setTab('Profile'); }} />
        )}

        {mode === 'list' && (
          <>
            {tab === 'Catalog' && <Catalog onNavigate={handleNavigate} onAddToCart={cart.addToCart} />}
            {tab === 'Favorites' && <FavoritesPage onSelectGun={(g) => handleNavigate('Detail', g)} onNavigateCatalog={() => setTab('Catalog')} />}
            {tab === 'Profile' && (
              <ProfilePage
                onNavigateEditProfile={() => handleNavigate('EditProfile')}
                onResumeDraft={() => handleNavigate('Create')}
              />
            )}
          </>
        )}
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} />
      <PWABadge />
      <Footer />
    </div>
  )
}

export default App
`,

  // ---------------------------------------------------------------------------
  // 15. CSS Extensions (Pagination, Cart, Lazy Load, Multi Image, Voting)
  // ---------------------------------------------------------------------------
  'src/App.css': `
/* App Extensions for Challenge Part 2 */
:root {
  --paper: #f5f7f8;
  --ink: #18222c;
  --steel: #5d6b78;
  --line: #dde3e8;
  --brass: #ff7b12;
  --panel: #18222c;
  --panel-text: #e6ebef;
}

*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; background: var(--paper); color: var(--ink); }
.display { font-family: 'Arial Narrow', sans-serif; font-stretch: condensed; }

/* Lazy Load Image */
.lazy-img-wrap { width: 100%; height: 100%; position: relative; overflow: hidden; }
.lazy-loading { opacity: 0; transition: opacity 0.3s ease; }
.lazy-loaded { opacity: 1; }
.lazy-skeleton { background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%); background-size: 200% 100%; animation: skeleton 1.5s infinite; }
@keyframes skeleton { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Header Right Actions & Cart Trigger */
.header-right-actions { display: flex; align-items: center; gap: 12px; }
.cart-trigger-btn { position: relative; background: none; border: 1px solid var(--line); padding: 7px; border-radius: 6px; cursor: pointer; color: var(--ink); display: flex; align-items: center; justify-content: center; }
.cart-badge { position: absolute; top: -6px; right: -6px; background: var(--brass); color: #fff; font-size: 11px; font-weight: bold; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

/* Cart Drawer */
.cart-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; display: flex; justify-content: flex-end; }
.cart-drawer { width: 100%; max-width: 380px; background: #fff; height: 100%; display: flex; flex-direction: column; animation: slideIn 0.25s ease-out; }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.cart-header { padding: 16px; border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; }
.cart-title { display: flex; align-items: center; gap: 8px; }
.cart-body { flex: 1; overflow-y: auto; padding: 16px; }
.cart-empty { text-align: center; color: var(--steel); padding: 40px 0; }
.cart-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.cart-item { display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--line); padding-bottom: 12px; }
.cart-item-img { width: 54px; height: 54px; object-fit: cover; border-radius: 4px; border: 1px solid var(--line); }
.cart-item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.cart-item-name { font-weight: bold; font-size: 0.95rem; }
.cart-item-price { color: var(--brass); font-weight: bold; font-size: 0.85rem; }
.cart-item-qty { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.qty-btn { background: var(--paper); border: 1px solid var(--line); width: 20px; height: 20px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.qty-val { font-size: 0.85rem; font-weight: bold; }
.cart-remove-btn { background: none; border: none; color: #c0392b; cursor: pointer; }
.cart-footer { padding: 16px; border-top: 1px solid var(--line); background: var(--paper); }
.cart-total-row { display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: bold; margin-bottom: 12px; }
.cart-total-val { color: var(--brass); }
.cart-checkout-btn { width: 100%; }

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 24px; padding: 16px 0; }
.page-num-info { font-size: 0.9rem; color: var(--steel); font-weight: bold; }

/* Multi-Image Gallery */
.detail-gallery { display: flex; flex-direction: column; gap: 10px; }
.detail-thumbs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.thumb-btn { border: 2px solid transparent; border-radius: 4px; overflow: hidden; cursor: pointer; width: 50px; height: 50px; padding: 0; background: none; }
.thumb-btn img { width: 100%; height: 100%; object-fit: cover; }
.thumb-btn--active { border-color: var(--brass); }
.multi-img-upload-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-bottom: 12px; }
.multi-img-preview { position: relative; width: 80px; height: 80px; border-radius: 4px; border: 1px solid var(--line); overflow: hidden; }
.multi-img-preview img { width: 100%; height: 100%; object-fit: cover; }
.multi-img-del { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.7); color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.multi-img-input-row { display: flex; gap: 8px; }

/* Review Vote Buttons */
.review-footer-bar { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
.review-votes { display: flex; gap: 8px; }
.vote-btn { background: none; border: 1px solid var(--line); padding: 3px 8px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: var(--steel); }
.vote-btn--active { border-color: var(--brass); color: var(--brass); background: rgba(255,123,18,0.08); }
.review-owner-actions { display: flex; gap: 6px; }

/* Archived Soft Delete UI */
.card--archived { opacity: 0.75; border-style: dashed; }
.view-toggle-tabs { display: flex; gap: 8px; }
.tab-btn { background: none; border: none; font-weight: bold; color: var(--steel); cursor: pointer; padding: 6px 12px; border-radius: 4px; display: flex; align-items: center; gap: 6px; }
.tab-btn--active { background: var(--ink); color: #fff; }
.draft-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
.draft-item { display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid var(--line); padding: 10px 14px; border-radius: 4px; }
.draft-actions { display: flex; gap: 8px; }
.profile-section { background: #fff; border: 1px solid var(--line); border-radius: 4px; padding: 20px; margin-top: 16px; }
`
};

// Tulis seluruh file
Object.entries(files).forEach(([filepath, content]) => {
  fs.writeFileSync(path.join(__dirname, filepath), content.trim(), 'utf8');
  console.log(`[Terupdate] ${filepath}`);
});

console.log('\n✅ Pembaharuan Challenge Part 2 Selesai 100%!');