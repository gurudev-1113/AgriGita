import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'

export default function LiveChat() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!socket) return
    const handleMessage = (data) => {
      setMessages(prev => [...prev, data])
      if (!isOpen) setUnread(u => u + 1)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
    socket.on('receive_message', handleMessage)
    return () => {
      socket.off('receive_message', handleMessage)
    }
  }, [socket, isOpen])

  useEffect(() => {
    if (isOpen) {
      setUnread(0)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [isOpen])

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const msgData = {
      text: inputText,
      sender: user?.full_name || user?.username || 'Anonymous Farmer',
      timestamp: new Date().toISOString()
    }
    socket.emit('send_message', msgData)
    setInputText('')
  }

  const formatTime = (isoString) => {
    const d = new Date(isoString)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '55px',
          height: '55px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          zIndex: 9998,
          transition: 'all 0.3s ease'
        }}
      >
        🧑‍🌾
        {unread > 0 && !isOpen && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unread}
          </div>
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '170px',
          right: '24px',
          width: '320px',
          height: '400px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9998,
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease'
        }}>
          {/* Header */}
          <div style={{ background: '#3b82f6', color: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Farm Network Chat</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px', fontSize: '0.9rem' }}>
                No messages yet. Send an update to your team!
              </div>
            ) : (
              messages.map((m, i) => {
                const isMe = m.sender === (user?.full_name || user?.username || 'Anonymous Farmer')
                return (
                  <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    {!isMe && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px', marginLeft: '4px' }}>{m.sender}</div>}
                    <div style={{
                      backgroundColor: isMe ? '#3b82f6' : 'var(--bg-card-hover)',
                      color: isMe ? 'white' : 'var(--text-primary)',
                      padding: '8px 12px',
                      borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      fontSize: '0.9rem',
                      lineHeight: '1.4'
                    }}>
                      {m.text}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', textAlign: isMe ? 'right' : 'left', marginRight: '4px' }}>
                      {formatTime(m.timestamp)}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <form style={{ display: 'flex', padding: '12px', borderTop: '1px solid var(--border-color)', gap: '8px' }} onSubmit={handleSend}>
            <input 
              type="text" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Send message..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-body)', color: 'var(--text-primary)' }}
            />
            <button type="submit" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  )
}
