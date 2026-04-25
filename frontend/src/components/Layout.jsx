import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useLanguage } from '../context/LanguageContext'
import { useWebTheme } from '../context/ThemeContext'
import VoiceAssistant from './VoiceAssistant'
import LiveChat from './LiveChat'
import { useState, useEffect, useCallback } from 'react'
import { alertAPI } from '../api/services'

export default function Layout() {
  const { isDarkMode, toggleTheme } = useWebTheme()
  const { user, logout } = useAuth()
  const { socket, connected } = useSocket()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [criticalAlert, setCriticalAlert] = useState(null)

  // Determine if this is a mobile/drawer viewport
  const isMobile = () => window.innerWidth <= 600
  const isTablet = () => window.innerWidth > 600 && window.innerWidth <= 1024

  // On mobile: sidebar starts closed (drawer). On desktop/tablet: starts open.
  const [sidebarOpen, setSidebarOpen] = useState(() => !isMobile())

  // Track mobile state for overlay
  const [mobileView, setMobileView] = useState(isMobile())

  useEffect(() => {
    const handleResize = () => {
      const mobile = isMobile()
      setMobileView(mobile)
      // On resize to desktop, re-open sidebar
      if (!mobile && !isTablet()) {
        setSidebarOpen(true)
      } else if (mobile) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    alertAPI.getUnreadCount().then(r => setUnreadCount(r.data.unread_count)).catch(() => {})
    const interval = setInterval(() => {
      alertAPI.getUnreadCount().then(r => setUnreadCount(r.data.unread_count)).catch(() => {})
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!socket) return
    const handleNewAlert = (alertData) => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
        osc.start()
        osc.stop(ctx.currentTime + 0.2)
      } catch(e) {}
      
      setUnreadCount(prev => prev + 1)
      if (alertData?.severity === 'critical' || alertData?.severity === 'warning') {
        setCriticalAlert(alertData.message)
        setTimeout(() => setCriticalAlert(null), 6000)
      }
    }
    socket.on('new_alert', handleNewAlert)
    return () => socket.off('new_alert', handleNewAlert)
  }, [socket])

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : user?.username?.[0]?.toUpperCase() || 'U'

  const handleNavClick = () => {
    // On mobile, close sidebar after navigating
    if (isMobile()) setSidebarOpen(false)
  }

  const navItems = [
    { to: '/', icon: '🛖', label: t('dashboard'), end: true },
    { to: '/valves', icon: '🚰', label: t('valves') },
    { to: '/wells', icon: '💦', label: t('wells') },
    { to: '/map', icon: '📍', label: t('live_map') },
    { to: '/pipelines', icon: '〰️', label: t('pipelines') },
  ]
  const toolItems = [
    { to: '/detection', icon: '🍃', label: t('plant_health') },
    { to: '/orders', icon: '📦', label: t('my_orders') },
    { to: '/ai', icon: '🌱', label: t('ai_suggestions') },
    { to: '/alerts', icon: '📢', label: t('alerts'), showDot: unreadCount > 0 },
    { to: '/profile', icon: '🧑‍🌾', label: t('profile') },
  ]

  const toggleSidebar = () => setSidebarOpen(prev => !prev)

  // On tablet, sidebar is also collapsible (drawer), so use overlay there too
  const showOverlay = (mobileView || isTablet()) && sidebarOpen

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      <VoiceAssistant />
      <LiveChat />
      
      {criticalAlert && (
        <div className="critical-alert-banner">
          <span className="blink">🔥</span> {criticalAlert}
        </div>
      )}

      {/* MOBILE / TABLET OVERLAY */}
      {showOverlay && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-brand">
           <div className="sidebar-brand-icon" style={{ background: 'transparent', boxShadow: 'none' }}>
             <img src="/logo.png" alt="AgriGita" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
           </div>
           <div className="sidebar-brand-text">
             <h1>AgriGita</h1>
           </div>
           <button className="close-mobile-sidebar" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <div className="nav-section-title">{t('main_menu')}</div>
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={handleNavClick}>
                <span className="icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="nav-group">
            <div className="nav-section-title">{t('tools')}</div>
            {toolItems.map(item => (
              <NavLink key={item.to} to={item.to} className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={handleNavClick}>
                <span className="icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.showDot && <span className="alert-dot"></span>}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-user" onClick={handleLogout} style={{width: '100%', background: 'transparent', border: 'none', textAlign: 'left'}}>
             <div className="sidebar-user-avatar">🚪</div>
             <div className="sidebar-user-info">
               <span className="name">{t('sign_out')}</span>
             </div>
          </button>
        </div>
      </aside>

      <main className={`main-layout ${sidebarOpen && !mobileView && !isTablet() ? '' : 'expanded'}`}>
        <header className="top-header">
          <div className="header-left">
            <button className="btn btn-primary" onClick={toggleSidebar} style={{width: '40px', height: '40px', padding: 0, flexShrink: 0}}>
              ☰
            </button>
            <div className="breadcrumb desktop-only">
              <span className="status-dot" style={{ background: connected ? '#22c55e' : '#ef4444' }}></span>
              {connected ? 'System Online' : 'Connecting...'}
            </div>
          </div>
          
          <div className="header-actions">
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <div className="user-profile">
              <div className="user-avatar">{initials}</div>
              <div className="user-info desktop-only">
                <span className="user-name">{user?.full_name || user?.username}</span>
                <span className="user-role">Farmer Specialist</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

