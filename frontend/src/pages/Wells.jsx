import { useState, useEffect } from 'react'
import { wellAPI } from '../api/services'

export default function Wells() {
  const [wells, setWells] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingWell, setEditingWell] = useState(null)
  const [form, setForm] = useState({ name: '', latitude: '20.5937', longitude: '78.9629', depth: '50', water_level: '30' })

  const fetchWells = async () => {
    try {
      const res = await wellAPI.getAll()
      setWells(res.data.wells)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const isMetric = localStorage.getItem('units') !== 'imperial'
  const formatDist = (val) => {
    const displayVal = isMetric ? val : (val * 3.28084).toFixed(1)
    return `${displayVal} ${isMetric ? 'm' : 'ft'}`
  }

  useEffect(() => { fetchWells() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const data = { ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude), depth: parseFloat(form.depth), water_level: parseFloat(form.water_level) }
    try {
      if (editingWell) {
        const res = await wellAPI.update(editingWell.id, data)
        setWells(prev => prev.map(w => w.id === editingWell.id ? res.data.well : w))
      } else {
        const res = await wellAPI.create(data)
        setWells(prev => [...prev, res.data.well])
      }
      closeModal()
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this well?')) return
    try {
      await wellAPI.delete(id)
      setWells(prev => prev.filter(w => w.id !== id))
    } catch (err) { console.error(err) }
  }

  const openEdit = (well) => {
    setEditingWell(well)
    setForm({ name: well.name, latitude: String(well.latitude), longitude: String(well.longitude), depth: String(well.depth), water_level: String(well.water_level) })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditingWell(null); setForm({ name: '', latitude: '20.5937', longitude: '78.9629', depth: '50', water_level: '30' }) }

  if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Well Management</h1>
          <p className="page-subtitle">Monitor and manage your water wells</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-well-btn">+ Add Well</button>
      </div>

      {wells.length === 0 ? (
        <div className="empty-state">
          <div className="icon">💧</div>
          <h3>No Wells Yet</h3>
          <p>Add your first well to start tracking water sources.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '16px' }}>+ Add First Well</button>
        </div>
      ) : (
        <div className="well-grid">
          {wells.map(well => {
            const levelPct = well.depth > 0 ? Math.round((well.water_level / well.depth) * 100) : 0
            return (
              <div key={well.id} className="well-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{well.name}</h3>
                  <span style={{ fontSize: '1.4rem' }}>💧</span>
                </div>

                <div className="valve-info" style={{ marginTop: 0 }}>
                  <div className="valve-info-item">
                    <div className="valve-info-label">Depth</div>
                    <div className="valve-info-value">{formatDist(well.depth)}</div>
                  </div>
                  <div className="valve-info-item">
                    <div className="valve-info-label">Water Level</div>
                    <div className="valve-info-value" style={{ color: 'var(--accent-cyan)' }}>{formatDist(well.water_level)}</div>
                  </div>
                  <div className="valve-info-item">
                    <div className="valve-info-label">Location</div>
                    <div className="valve-info-value" style={{ fontSize: '0.78rem' }}>{well.latitude.toFixed(4)}°, {well.longitude.toFixed(4)}°</div>
                  </div>
                  <div className="valve-info-item">
                    <div className="valve-info-label">Fill Level</div>
                    <div className="valve-info-value" style={{ color: levelPct > 50 ? 'var(--accent-green)' : levelPct > 25 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>
                      {levelPct}%
                    </div>
                  </div>
                </div>

                <div className="well-level-bar">
                  <div className="well-level-fill" style={{ width: `${levelPct}%` }} />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(well)}>✏️ Edit</button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleDelete(well.id)}
                    style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'var(--accent-red)' }}>🗑️ Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{editingWell ? 'Edit Well' : 'Add New Well'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Well Name</label>
                <input type="text" className="form-input" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                  placeholder="e.g. Main Well" id="well-name-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input type="number" step="any" className="form-input" value={form.latitude}
                    onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input type="number" step="any" className="form-input" value={form.longitude}
                    onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Depth (m)</label>
                  <input type="number" step="any" className="form-input" value={form.depth}
                    onChange={e => setForm(p => ({ ...p, depth: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Water Level (m)</label>
                  <input type="number" step="any" className="form-input" value={form.water_level}
                    onChange={e => setForm(p => ({ ...p, water_level: e.target.value }))} required />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="well-save-btn">{editingWell ? 'Update Well' : 'Add Well'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
