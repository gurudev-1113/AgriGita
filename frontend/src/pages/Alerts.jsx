import { useState, useEffect } from 'react'
import { alertAPI } from '../api/services'
import { useSocket } from '../context/SocketContext'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { socket } = useSocket()

  const exportToCSV = () => {
    if (!alerts.length) return
    const headers = ['ID', 'Severity', 'Type', 'Message', 'Read', 'Date']
    const dataRows = alerts.map(a => [a.id, a.severity, a.type, `"${a.message.replace(/"/g, '""')}"`, a.is_read, a.created_at])
    const csvContent = [headers, ...dataRows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `agri_alerts_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const fetchAlerts = async () => {
    try {
      const res = await alertAPI.getAll()
      setAlerts(res.data.alerts)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAlerts() }, [])

  useEffect(() => {
    if (!socket) return
    const handle = (data) => setAlerts(prev => [data.alert, ...prev])
    socket.on('new_alert', handle)
    return () => socket.off('new_alert', handle)
  }, [socket])

  const handleMarkRead = async (id) => {
    try {
      await alertAPI.markRead(id)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a))
    } catch (err) { console.error(err) }
  }

  const handleMarkAllRead = async () => {
    try {
      await alertAPI.markAllRead()
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    try {
      await alertAPI.delete(id)
      setAlerts(prev => prev.filter(a => a.id !== id))
    } catch (err) { console.error(err) }
  }

  const filtered = alerts.filter(a => {
    if (filter === 'unread') return !a.is_read
    if (filter === 'critical') return a.severity === 'critical'
    if (filter === 'warning') return a.severity === 'warning'
    return true
  })

  const unreadCount = alerts.filter(a => !a.is_read).length

  const severityIcon = (s) => s === 'critical' ? '🔴' : s === 'warning' ? '🟡' : '🔵'
  const typeIcon = (t) => {
    const icons = { valve_failure: '⚠️', pipeline_damage: '🔧', low_pressure: '📉', system: '🖥️', low_water: '💧' }
    return icons[t] || '📢'
  }

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alerts & Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={exportToCSV}>📥 Export Logs (CSV)</button>
          {unreadCount > 0 && (
            <button className="btn btn-primary" onClick={handleMarkAllRead} id="mark-all-read-btn">✓ Mark All Read</button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { key: 'all', label: `All (${alerts.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'critical', label: '🔴 Critical' },
          { key: 'warning', label: '🟡 Warning' },
        ].map(tab => (
          <button key={tab.key}
            className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">✅</div>
          <h3>No Alerts</h3>
          <p>Your system is running smoothly. No alerts to display.</p>
        </div>
      ) : (
        <div className="alert-list">
          {filtered.map(alert => (
            <div key={alert.id}
              className={`alert-item ${alert.severity} ${!alert.is_read ? 'unread' : ''}`}
              onClick={() => !alert.is_read && handleMarkRead(alert.id)}>
              <div className={`alert-icon ${alert.severity}`}>
                {typeIcon(alert.type)}
              </div>
              <div className="alert-content" style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                    color: alert.severity === 'critical' ? 'var(--accent-red)' : alert.severity === 'warning' ? 'var(--accent-amber)' : 'var(--accent-blue)',
                    padding: '2px 8px', borderRadius: '10px',
                    background: alert.severity === 'critical' ? 'var(--accent-red-glow)' : alert.severity === 'warning' ? 'var(--accent-amber-glow)' : 'var(--accent-blue-glow)' }}>
                    {severityIcon(alert.severity)} {alert.severity}
                  </span>
                  {!alert.is_read && (
                    <span style={{ width: '8px', height: '8px', background: 'var(--accent-blue)', borderRadius: '50%', flexShrink: 0 }} />
                  )}
                </div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-time">{timeAgo(alert.created_at)} · {new Date(alert.created_at).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <a href={`https://wa.me/?text=${encodeURIComponent(`*Farm Alert: ${alert.severity.toUpperCase()}*\n_${alert.message}_\nTime: ${new Date(alert.created_at).toLocaleString()}`)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} title="Send via WhatsApp">
                  <button style={{ background: '#25D366', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.85rem', padding: '4px 8px', borderRadius: '4px', flexShrink: 0, transition: 'opacity 0.2s' }}>
                    🟢 WhatsApp
                  </button>
                </a>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(alert.id) }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '4px', flexShrink: 0, opacity: 0.5, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.5}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
