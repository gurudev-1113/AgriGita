import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/success')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <img src="/logo.png" alt="AgriGita Logo" style={{ width: '80px', marginBottom: '16px' }} />
          <h2>Welcome Back</h2>
          <p>Sign in to AgriGita Smart Agriculture</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" className="form-input" id="login-username"
              placeholder="Enter your username" value={username}
              onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" id="login-password"
              placeholder="Enter your password" value={password}
              onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" id="login-submit"
            style={{ width: '100%', marginTop: '4px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Create one</Link>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(59,130,246,0.08)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          <strong>Demo Account:</strong> farmer / farmer123
        </div>
      </div>
    </div>
  )
}
