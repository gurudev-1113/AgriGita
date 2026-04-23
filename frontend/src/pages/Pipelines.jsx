import { useState, useEffect } from 'react'
import { pipelineAPI, wellAPI, valveAPI } from '../api/services'

export default function Pipelines() {
  const [pipelines, setPipelines] = useState([])
  const [wells, setWells] = useState([])
  const [valves, setValves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPipeline, setEditingPipeline] = useState(null)
  const [form, setForm] = useState({ name: '', well_id: '', valve_id: '', status: 'active' })

  useEffect(() => {
    Promise.all([pipelineAPI.getAll(), wellAPI.getAll(), valveAPI.getAll()])
      .then(([p, w, v]) => { setPipelines(p.data.pipelines); setWells(w.data.wells); setValves(v.data.valves) })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const data = { ...form, well_id: form.well_id ? parseInt(form.well_id) : null, valve_id: form.valve_id ? parseInt(form.valve_id) : null }
    try {
      if (editingPipeline) {
        const res = await pipelineAPI.update(editingPipeline.id, data)
        setPipelines(prev => prev.map(p => p.id === editingPipeline.id ? res.data.pipeline : p))
      } else {
        const res = await pipelineAPI.create(data)
        setPipelines(prev => [...prev, res.data.pipeline])
      }
      closeModal()
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this pipeline?')) return
    try { await pipelineAPI.delete(id); setPipelines(prev => prev.filter(p => p.id !== id)) }
    catch (err) { console.error(err) }
  }

  const openEdit = (p) => {
    setEditingPipeline(p)
    setForm({ name: p.name, well_id: p.well_id ? String(p.well_id) : '', valve_id: p.valve_id ? String(p.valve_id) : '', status: p.status })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditingPipeline(null); setForm({ name: '', well_id: '', valve_id: '', status: 'active' }) }

  const getWellName = (id) => wells.find(w => w.id === id)?.name || '—'
  const getValveName = (id) => valves.find(v => v.id === id)?.name || '—'

  if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pipeline Management</h1>
          <p className="page-subtitle">Visualize and manage your pipeline network</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-pipeline-btn">+ Add Pipeline</button>
      </div>

      {pipelines.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔗</div>
          <h3>No Pipelines Yet</h3>
          <p>Add pipelines to connect your wells to valves, or draw them on the Live Map.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '16px' }}>+ Add Pipeline</button>
        </div>
      ) : (
        <div className="pipeline-grid">
          {pipelines.map(pipeline => (
            <div key={pipeline.id} className="pipeline-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{pipeline.name}</h3>
                <span className={`pipeline-status ${pipeline.status}`}>
                  {pipeline.status === 'active' ? '🟢' : pipeline.status === 'damaged' ? '🔴' : '⚫'} {pipeline.status}
                </span>
              </div>

              <div className="valve-info" style={{ marginTop: 0 }}>
                <div className="valve-info-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="valve-info-label">Well → Valve</div>
                  <div className="valve-info-value" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--accent-cyan)' }}>💧 {getWellName(pipeline.well_id)}</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span style={{ color: 'var(--accent-green)' }}>🔧 {getValveName(pipeline.valve_id)}</span>
                  </div>
                </div>
                <div className="valve-info-item">
                  <div className="valve-info-label">Waypoints</div>
                  <div className="valve-info-value">{pipeline.path_data?.length || 0}</div>
                </div>
                <div className="valve-info-item">
                  <div className="valve-info-label">Length</div>
                  <div className="valve-info-value">{pipeline.length > 0 ? `${pipeline.length.toFixed(0)}m` : '—'}</div>
                </div>
              </div>

              {/* Visual pipeline diagram */}
              <div style={{ margin: '14px 0', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', background: 'rgba(6,182,212,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>💧</div>
                <div style={{ flex: 1, height: '4px', background: pipeline.status === 'damaged' ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
                  {pipeline.status === 'active' && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.6), transparent)', animation: 'waterFlow 2s linear infinite' }} />}
                  {pipeline.status === 'damaged' && <div style={{ position: 'absolute', left: '40%', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />}
                </div>
                <div style={{ width: '36px', height: '36px', background: 'rgba(16,185,129,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🔧</div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(pipeline)}>✏️ Edit</button>
                <button className="btn btn-outline btn-sm" onClick={() => handleDelete(pipeline.id)}
                  style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'var(--accent-red)' }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{editingPipeline ? 'Edit Pipeline' : 'Add New Pipeline'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Pipeline Name</label>
                <input type="text" className="form-input" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                  placeholder="e.g. Main Pipeline A" id="pipeline-name-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Connect From Well (optional)</label>
                <select className="form-input" value={form.well_id} onChange={e => setForm(p => ({ ...p, well_id: e.target.value }))}>
                  <option value="">— Select Well —</option>
                  {wells.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Connect To Valve (optional)</label>
                <select className="form-input" value={form.valve_id} onChange={e => setForm(p => ({ ...p, valve_id: e.target.value }))}>
                  <option value="">— Select Valve —</option>
                  {valves.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="pipeline-save-btn">{editingPipeline ? 'Update' : 'Add Pipeline'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
