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
                <img src={url} alt={`Gambar ${idx + 1}`} />
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