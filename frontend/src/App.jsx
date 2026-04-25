import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Valves from './pages/Valves'
import Wells from './pages/Wells'
import MapView from './pages/MapView'
import Pipelines from './pages/Pipelines'
import Alerts from './pages/Alerts'
import AISuggestions from './pages/AISuggestions'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import LoginSuccess from './pages/LoginSuccess'
import AdminDashboard from './pages/Admin'
import Detection from './pages/Detection'
import Orders from './pages/Orders'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>
  return user ? children : <Navigate to="/login" />
}

import { WebThemeProvider } from './context/ThemeContext'

export default function App() {
  return (
    <WebThemeProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/success" element={<LoginSuccess />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="valves" element={<Valves />} />
          <Route path="wells" element={<Wells />} />
          <Route path="map" element={<MapView />} />
          <Route path="pipelines" element={<Pipelines />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="ai" element={<AISuggestions />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="detection" element={<Detection />} />
          <Route path="orders" element={<Orders />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </WebThemeProvider>
  )
}
