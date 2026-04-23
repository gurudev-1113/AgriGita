import { useState, useEffect } from 'react'
import { valveAPI } from '../api/services'
import { useSocket } from '../context/SocketContext'

export default function Valves() {
  const [valves, setValves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingValve, setEditingValve] = useState(null)
  const [form, setForm] = useState({ name: '', latitude: '20.5937', longitude: '78.9629' })
  const [toastMsg, setToastMsg] = useState('')
  const { socket } = useSocket()

  const fetchValves = async () => {
    try {
      const res = await valveAPI.getAll()
      setValves(res.data.valves)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchValves() }, [])

  useEffect(() => {
    if (!socket) return
    const handleToggle = (data) => {
      setValves(prev => prev.map(v => v.id === data.valve.id ? data.valve : v))
      showToast(data.status_text)
    }
    const handleUpdate = (data) => {
      if (data.action === 'created') setValves(prev => [...prev, data.valve])
      else if (data.action === 'updated') setValves(prev => prev.map(v => v.id === data.valve.id ? data.valve : v))
      else if (data.action === 'deleted') setValves(prev => prev.filter(v => v.id !== data.valve_id))
    }
    const handleData = (data) => {
      setValves(prev => prev.map(v => v.id === data.valve_id ? { ...v, flow_rate: data.flow_rate } : v))
    }
    socket.on('valve_toggle', handleToggle)
    socket.on('valve_update', handleUpdate)
    socket.on('valve_data', handleData)
    return () => { socket.off('valve_toggle', handleToggle); socket.off('valve_update', handleUpdate); socket.off('valve_data', handleData) }
  }, [socket])

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000) }

  const handleToggle = async (id) => {
    try {
      const res = await valveAPI.toggle(id)
      setValves(prev => prev.map(v => v.id === id ? res.data.valve : v))
      showToast(res.data.status_text)
    } catch (err) { console.error(err) }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingValve) {
        const res = await valveAPI.update(editingValve.id, { ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) })
        setValves(prev => prev.map(v => v.id === editingValve.id ? res.data.valve : v))
      } else {
        const res = await valveAPI.create({ ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) })
        setValves(prev => [...prev, res.data.valve])
      }
      closeModal()
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this valve?')) return
    try {
      await valveAPI.delete(id)
      setValves(prev => prev.filter(v => v.id !== id))
    } catch (err) { console.error(err) }
  }

  const openEdit = (valve) => {
    setEditingValve(valve)
    setForm({ name: valve.name, latitude: String(valve.latitude), longitude: String(valve.longitude) })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditingValve(null); setForm({ name: '', latitude: '20.5937', longitude: '78.9629' }) }

  if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Valve Management</h1>
          <p className="page-subtitle">Control and monitor your irrigation valves</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-valve-btn">+ Add Valve</button>
      </div>

      {valves.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔧</div>
          <h3>No Valves Yet</h3>
          <p>Add your first irrigation valve to start managing your water system.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '16px' }}>+ Add First Valve</button>
        </div>
      ) : (
        <div className="valve-grid">
          {valves.map(valve => (
            <div key={valve.id} className={`valve-card ${valve.status ? 'active' : ''} ${valve.health === 'damaged' ? 'damaged' : ''}`}>
              <div className="valve-card-header">
                <span className="valve-card-name">{valve.name}</span>
                <span className={`valve-card-health health-${valve.health}`}>{valve.health}</span>
              </div>

              <div className="valve-status-row">
                <div className="valve-status">
                  <span className={`dot ${valve.status ? 'on' : 'off'}`} />
                  <span>{valve.status ? 'Valve Opened' : 'Valve Closed'}</span>
                </div>
                <div className={`toggle-switch ${valve.status ? 'on' : ''}`}
                  onClick={() => handleToggle(valve.id)} id={`toggle-valve-${valve.id}`}>
                  <div className="toggle-knob" />
                </div>
              </div>

              {valve.status && (
                <div className="water-flow-container">
                  <div className="water-flow-bar" />
                </div>
              )}

              <div className="valve-info">
                <div className="valve-info-item">
                  <div className="valve-info-label">Flow Rate</div>
                  <div className="valve-info-value" style={{ color: valve.status ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                    {valve.flow_rate} L/min
                  </div>
                </div>
                <div className="valve-info-item">
                  <div className="valve-info-label">Location</div>
                  <div className="valve-info-value" style={{ fontSize: '0.78rem' }}>
                    {valve.latitude.toFixed(4)}°, {valve.longitude.toFixed(4)}°
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(valve)}>✏️ Edit</button>
                <button className="btn btn-outline btn-sm" onClick={() => handleDelete(valve.id)}
                  style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'var(--accent-red)' }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', background: 'var(--accent-green)',
          color: 'white', padding: '12px 24px', borderRadius: 'var(--radius-md)',
          fontWeight: 600, fontSize: '0.88rem', boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.3s ease', zIndex: 9999
        }}>
          {toastMsg}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{editingValve ? 'Edit Valve' : 'Add New Valve'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Valve Name</label>
                <input type="text" className="form-input" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                  placeholder="e.g. Field A - Gate Valve" id="valve-name-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input type="number" step="any" className="form-input" value={form.latitude}
                    onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} required id="valve-lat-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input type="number" step="any" className="form-input" value={form.longitude}
                    onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} required id="valve-lon-input" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="valve-save-btn">
                  {editingValve ? 'Update Valve' : 'Add Valve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
