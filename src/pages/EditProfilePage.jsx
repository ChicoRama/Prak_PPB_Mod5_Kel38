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