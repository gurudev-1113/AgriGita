import { useState, useEffect } from 'react'
import { aiAPI } from '../api/services'

export default function AISuggestions() {
  const [suggestions, setSuggestions] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('suggestions')

  useEffect(() => {
    Promise.all([aiAPI.getSuggestions(), aiAPI.getProductRecommendations()])
      .then(([s, r]) => { setSuggestions(s.data.suggestions); setRecommendations(r.data.recommendations) })
      .finally(() => setLoading(false))
  }, [])

  const typeConfig = {
    placement: { icon: '📍', color: 'var(--accent-blue)', bg: 'var(--accent-blue-glow)' },
    coverage_gap: { icon: '⚠️', color: 'var(--accent-amber)', bg: 'var(--accent-amber-glow)' },
    optimization: { icon: '⚡', color: 'var(--accent-purple)', bg: 'var(--accent-purple-glow)' },
    maintenance: { icon: '🔧', color: 'var(--accent-red)', bg: 'var(--accent-red-glow)' },
    efficiency: { icon: '💡', color: 'var(--accent-cyan)', bg: 'var(--accent-cyan-glow)' },
    info: { icon: '✅', color: 'var(--accent-green)', bg: 'var(--accent-green-glow)' },
  }

  const getScoreClass = (score) => score >= 80 ? 'high' : score >= 65 ? 'medium' : 'low'

  if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Suggestions</h1>
          <p className="page-subtitle">Smart recommendations to optimize your irrigation system</p>
        </div>
        <button className="btn btn-outline" onClick={() => {
          setLoading(true)
          Promise.all([aiAPI.getSuggestions(), aiAPI.getProductRecommendations()])
            .then(([s, r]) => { setSuggestions(s.data.suggestions); setRecommendations(r.data.recommendations) })
            .finally(() => setLoading(false))
        }} id="refresh-ai-btn">🔄 Refresh Analysis</button>
      </div>

      {/* Smart Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.05))', borderColor: 'rgba(16,185,129,0.2)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '2.5rem' }}>🌱</div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Smart Crop & Water Insights</h3>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Analyzes your wells, valves, and field layout using agricultural best practices to suggest optimal placement,
              detect coverage gaps, and recommend maintenance actions.
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{suggestions.length}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Insights Found</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button className={`btn btn-sm ${activeTab === 'suggestions' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('suggestions')} id="suggestions-tab">
          🌾 Suggestions ({suggestions.length})
        </button>
        <button className={`btn btn-sm ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('products')} id="products-tab">
          🛒 Product Recommendations ({recommendations.length})
        </button>
      </div>

      {activeTab === 'suggestions' && (
        <div>
          {suggestions.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🌱</div>
              <h3>No Data to Analyze</h3>
              <p>Add some valves and wells first, then the system will analyze your farm layout.</p>
            </div>
          ) : (
            suggestions.map((s, i) => {
              const cfg = typeConfig[s.type] || typeConfig.info
              return (
                <div key={i} className="suggestion-card">
                  <div className="suggestion-header">
                    <div style={{ width: '38px', height: '38px', background: cfg.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      {cfg.icon}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.title}</h4>
                      <span style={{ fontSize: '0.7rem', color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                        {s.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {s.score && (
                      <div className={`suggestion-score ${getScoreClass(s.score)}`} style={{ marginLeft: 'auto' }}>
                        Priority: {s.score}%
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', marginLeft: '50px', lineHeight: 1.5 }}>
                    {s.message}
                  </p>
                  {s.location && (
                    <div style={{ marginLeft: '50px', marginTop: '10px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      📍 Recommended location: {s.location.latitude.toFixed(6)}°, {s.location.longitude.toFixed(6)}°
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          {recommendations.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🛒</div>
              <h3>No Damaged Valves</h3>
              <p>All your valves are healthy! Product recommendations appear when valves are damaged.</p>
            </div>
          ) : (
            recommendations.map((rec, i) => (
              <div key={i} className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Replacement Options for: {rec.valve.name}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--accent-red)' }}>Valve is damaged — immediate replacement recommended</p>
                  </div>
                </div>

                {rec.products.map((product, j) => (
                  <div key={j} className="product-card">
                    <div className="product-icon">{product.image}</div>
                    <div className="product-info" style={{ flex: 1 }}>
                      <h4>{product.name}</h4>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '4px 0' }}>
                        <span className="product-price">{product.price}</span>
                        <span className="product-rating">{'⭐'.repeat(Math.floor(product.rating))} {product.rating}</span>
                      </div>
                      <p className="product-desc">{product.description}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'center' }}>
                      <button className="btn btn-sm" style={{ background: '#f59e0b', color: 'white', border: 'none' }} onClick={() => window.open(`https://www.amazon.in/s?k=${encodeURIComponent(product.name + ' Smart Valve Agriculture')}`, '_blank')}>
                        🛒 Amazon
                      </button>
                      <button className="btn btn-sm" style={{ background: '#2563eb', color: 'white', border: 'none' }} onClick={() => window.open(`https://www.flipkart.com/search?q=${encodeURIComponent(product.name + ' Smart Valve')}`, '_blank')}>
                        🛒 Flipkart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
