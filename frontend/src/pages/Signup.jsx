import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 4) { setError('Password must be at least 4 characters'); return }
    setLoading(true)
    try {
      await signup(form)
      navigate('/success')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <img src="/logo.png" alt="AgriGita Logo" style={{ width: '80px', marginBottom: '16px' }} />
          <h2>Create Account</h2>
          <p>Join AgriGita Smart Agriculture Solutions</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" name="full_name" id="signup-fullname"
              placeholder="Your full name" value={form.full_name}
              onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" className="form-input" name="username" id="signup-username"
              placeholder="Choose a username" value={form.username}
              onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" name="email" id="signup-email"
              placeholder="your@email.com" value={form.email}
              onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="tel" className="form-input" name="phone" id="signup-phone"
              placeholder="+91-XXXXXXXXXX" value={form.phone}
              onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" name="password" id="signup-password"
              placeholder="Create a password" value={form.password}
              onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary" id="signup-submit"
            style={{ width: '100%', marginTop: '4px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
