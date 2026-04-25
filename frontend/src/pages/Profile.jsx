import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api/services'
import { useLanguage } from '../context/LanguageContext'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { changeLanguage, t } = useLanguage()
  
  const [form, setForm] = useState({ 
    full_name: '', 
    email: '', 
    phone: '', 
    language: 'en', 
    profile_image: '', 
    land_details: '' 
  })
  
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        language: user.language || 'en',
        profile_image: user.profile_image || '',
        land_details: user.land_details || ''
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.updateProfile(form)
      updateUser(res.data.user)
      setMsg('Profile details saved successfully!')
      setIsEditing(false)
      
      // Auto-hide success message
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user) {
      setForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        language: user.language || 'en',
        profile_image: user.profile_image || '',
        land_details: user.land_details || ''
      })
    }
    setError('')
    setMsg('')
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large. Please select an image under 5MB.')
      e.target.value = ''
      return
    }

    setImageLoading(true)
    setError('')
    
    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onloadend = () => {
        const img = new Image()
        img.src = reader.result
        img.onload = async () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 256
          const MAX_HEIGHT = 256
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
          
          // Instant Upload Feature
          try {
            const res = await authAPI.updateProfile({ ...form, profile_image: resizedDataUrl })
            updateUser(res.data.user)
            setForm(p => ({ ...p, profile_image: resizedDataUrl }))
            setMsg('Profile picture updated!')
            setTimeout(() => setMsg(''), 3000)
          } catch (uploadErr) {
            setError('Failed to save profile picture.')
          } finally {
            setImageLoading(false)
          }
        }
      }
    } catch (err) {
      setImageLoading(false)
      setError('Error processing image.')
    }
    
    e.target.value = ''
  }

  // Formatting date nicely
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
    month: 'long', year: 'numeric'
  }) : 'Just Joined';

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '10px' }}>
        <div>
          <h1 className="page-title">{t('profile') || 'User Profile'}</h1>
          <p className="page-subtitle">Manage your account and farm settings</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {msg && <div style={{ background: 'var(--accent-green-glow)', color: 'var(--accent-green)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', fontWeight: '500', animation: 'fadeIn 0.3s' }}>✅ {msg}</div>}
        {error && <div className="auth-error" style={{ marginBottom: '16px' }}>❌ {error}</div>}

        {/* Profile Card Header */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', position: 'relative' }}>
          
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--bg-card-hover)', border: '3px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
              {imageLoading ? (
                <div className="loading-spinner" style={{ width: '30px', height: '30px' }} />
              ) : form.profile_image ? (
                <img src={form.profile_image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}>👤</span>
              )}
            </div>
            
            {/* Camera Upload Button Overlay */}
            <label style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--accent-blue)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', transition: 'all 0.2s', zIndex: 1 }} className="hover-scale">
              <span style={{ fontSize: '1rem' }}>📷</span>
              <input type="file" accept="image/*" onChange={handleImageChange} hidden disabled={imageLoading} />
            </label>
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px', textTransform: 'capitalize' }}>{form.full_name || user?.username || 'Farmer'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{form.email}</p>
            <div style={{ display: 'inline-block', background: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>
              ⭐ Member since {memberSince}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form-grid" style={{ display: 'grid', gap: '24px' }}>
          
          {/* Card 1: Personal Details */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span style={{ marginRight: '8px' }}>📋</span> Personal Details
            </h3>
            
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" className="form-input" style={{ background: 'var(--bg-primary)' }} value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="E.g. John Doe" required disabled={!isEditing} />
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Address</label>
              <input type="email" className="form-input" style={{ background: 'var(--bg-primary)' }} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required disabled={!isEditing} />
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Phone Number</label>
              <input type="tel" className="form-input" style={{ background: 'var(--bg-primary)' }} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" disabled={!isEditing} />
            </div>
          </div>

          {/* Card 2: Farm Details */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span style={{ marginRight: '8px' }}>🚜</span> Farm & App Settings
            </h3>
            
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Interface Language</label>
              <select className="form-input" style={{ background: 'var(--bg-primary)', cursor: isEditing ? 'pointer' : 'default' }} value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} disabled={!isEditing}>
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Farm / Land Details <span style={{ color: 'var(--accent-blue)', fontSize: '0.7rem', fontWeight: '500', marginLeft: '6px' }}>(Enhances AI Insights)</span>
              </label>
              <textarea 
                className="form-input" 
                rows="4" 
                style={{ background: 'var(--bg-primary)', flex: 1, resize: 'none' }} 
                value={form.land_details} 
                onChange={e => setForm(p => ({ ...p, land_details: e.target.value }))} 
                placeholder="E.g. 5 Acres, Loamy Soil, North Zone. Growing primarily wheat and soybeans." 
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '8px', gap: '12px' }}>
            {!isEditing ? (
              <button type="button" className="btn btn-outline" style={{ padding: '12px 32px', fontSize: '1rem', fontWeight: '600' }} onClick={(e) => { e.preventDefault(); setIsEditing(true); }}>
                ✏️ Edit Profile
              </button>
            ) : (
              <>
                <button type="button" className="btn btn-outline" style={{ padding: '12px 32px', fontSize: '1rem', fontWeight: '600' }} onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1rem', fontWeight: '600' }} disabled={loading}>
                  {loading ? 'Saving details...' : '💾 Save All Changes'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

