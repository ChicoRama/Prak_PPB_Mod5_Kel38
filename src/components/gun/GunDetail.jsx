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
    const shareUrl = `${window.location.origin}?gun=${gun.id}`
    if (navigator.share) {
      navigator.share({ title: gun.name, text: `Lihat ${gun.name} di Bore & Barrel!`, url: shareUrl }).catch(() => {})
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
                  className={`thumb-btn ${activeImgIndex === idx ? 'thumb-btn--active' : ''}`}
                  onClick={() => setActiveImgIndex(idx)}
                >
                  <img src={img} alt={`Thumb ${idx}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <h1 className="display">{gun.name}</h1>
          <p className="type">
            {category}
            {caliber ? ` · ${caliber}` : ''}
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
                        className={`vote-btn ${rev.userVote === 'up' ? 'vote-btn--active' : ''}`}
                        onClick={() => handleVote(rev.id, 'up')}
                      >
                        <ThumbsUp size={14} /> <span>{rev.upvotes || 0}</span>
                      </button>
                      <button
                        type="button"
                        className={`vote-btn ${rev.userVote === 'down' ? 'vote-btn--active' : ''}`}
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