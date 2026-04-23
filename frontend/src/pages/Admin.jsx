import { useState, useEffect } from 'react'
import api from '../api/services'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)
  const [progress, setProgress] = useState(0)
  const [trainResults, setTrainResults] = useState(null)

  const trainModel = async () => {
    setTraining(true)
    setProgress(0)
    
    // Simulate training progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + 5
      })
    }, 200)

    try {
      const res = await api.post('/admin/train')
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => {
        setTraining(false)
        setTrainResults(res.data.results)
      }, 500)
    } catch (err) {
      clearInterval(interval)
      setTraining(false)
      alert('Training failed: ' + (err.response?.data?.error || err.message))
    }
  }

  useEffect(() => {
    api.get('/admin/stats').then(res => {
      setStats(res.data)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard 🛡️</h1>
          <p className="page-subtitle">Platform Usage Metrics and Analytics</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-card-header">
            <div className="stat-card-icon">👥</div>
            <span className="stat-card-label">Total Users</span>
          </div>
          <div className="stat-card-value">{stats?.total_users || 0}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-card-header">
            <div className="stat-card-icon">💬</div>
            <span className="stat-card-label">AI Chat Messages</span>
          </div>
          <div className="stat-card-value">{stats?.total_chat_messages || 0}</div>
        </div>
      </div>
 
      <div className="card" style={{ marginTop: '24px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🧠 AI Model Control Center</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Train and optimize the irrigation recommendation engine</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={trainModel} 
            disabled={training}
            style={{ minWidth: '140px' }}
          >
            {training ? 'Training...' : '🚀 Train Model'}
          </button>
        </div>

        {training && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--accent-blue)', width: `${progress}%`, transition: 'width 0.3s ease' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>Iterating over water logs...</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}

        {trainResults && (
          <div className="fade-in" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Last Trained</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{new Date(trainResults.trained_at).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Model Status</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-green)' }}>{trainResults.status.toUpperCase()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Daily Avg Usage</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{trainResults.daily_avg_usage} L</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Trained On</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{trainResults.total_trained_on} Valves</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3>Registered Users</h3>
        <div className="table-responsive" style={{ marginTop: '16px' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Username</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats?.users?.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>{u.id}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{u.username}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>{new Date(u.created).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
