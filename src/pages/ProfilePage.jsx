import { useState } from 'react'
import { Shield, Copy, Check, Heart, FileText, UserCog, Trash2, ArrowRight } from 'lucide-react'
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
          <UserCog size={16} /> Edit Profile
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
              const name = draft?.formData?.name || `Draft (${id})`
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

      {/* Section About & Contact */}
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