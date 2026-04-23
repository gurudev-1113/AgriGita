import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function Settings() {
  const { t } = useLanguage()
  const [units, setUnits] = useState(localStorage.getItem('units') || 'metric')
  const [threshold, setThreshold] = useState(localStorage.getItem('low_water_threshold') || '20')
  const [notifications, setNotifications] = useState(localStorage.getItem('notifications') === 'true')

  const handleSave = () => {
    localStorage.setItem('units', units)
    localStorage.setItem('low_water_threshold', threshold)
    localStorage.setItem('notifications', notifications)
    alert('Settings saved successfully!')
    window.location.reload() // Reload to apply unit changes globally
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings ⚙️</h1>
          <p className="page-subtitle">Configure measurement units and system thresholds</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>💾 Save Changes</button>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Measurement Units</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className={`btn ${units === 'metric' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setUnits('metric')}
              style={{ flex: 1 }}
            >
              Metric (L, °C, m)
            </button>
            <button 
              className={`btn ${units === 'imperial' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setUnits('imperial')}
              style={{ flex: 1 }}
            >
              Imperial (Gal, °F, ft)
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>Low Water Threshold</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Generate a critical alert when well water level drops below this percentage.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input 
              type="range" 
              min="5" 
              max="50" 
              value={threshold} 
              onChange={e => setThreshold(e.target.value)}
              style={{ flex: 1, accentColor: 'var(--accent-blue)' }}
            />
            <span style={{ fontSize: '1.2rem', fontWeight: 700, width: '50px' }}>{threshold}%</span>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Notification Preferences</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Enable Visual Alerts</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Show pop-up notifications for critical events</div>
            </div>
            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input 
                type="checkbox" 
                checked={notifications} 
                onChange={e => setNotifications(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{ 
                position: 'absolute', cursor: 'pointer', inset: 0, 
                backgroundColor: notifications ? 'var(--accent-blue)' : '#ccc',
                transition: '.4s', borderRadius: '34px'
              }}>
                <span style={{ 
                  position: 'absolute', height: '18px', width: '18px', left: notifications ? '28px' : '4px', bottom: '3px',
                  backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                }}></span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
