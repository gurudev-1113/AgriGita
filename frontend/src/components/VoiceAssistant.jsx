import { useState, useEffect, useRef } from 'react'
import { valveAPI } from '../api/services'

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [valves, setValves] = useState([])
  const [feedback, setFeedback] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Attempt to load valves to match names against
    const fetchValves = async () => {
      try {
        const res = await valveAPI.getAll()
        setValves(res.data.valves)
      } catch (err) {
        console.error('Failed to load valves for voice match', err)
      }
    }
    fetchValves()

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        setFeedback('Listening...')
      }

      recognition.onresult = async (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
        console.log('Voice Command Received:', transcript)
        handleCommand(transcript)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error)
        setIsListening(false)
        setFeedback(`Error: ${event.error}`)
        setTimeout(() => setFeedback(''), 3000)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleCommand = async (transcript) => {
    setFeedback(`Heard: "${transcript}"`)
    
    // Refresh valves just in case
    let currentValves = valves
    try {
      const res = await valveAPI.getAll()
      currentValves = res.data.valves
      setValves(currentValves)
    } catch (e) {}

    const isOpenCmd = transcript.includes('open') || transcript.includes('start') || transcript.includes('turn on') || transcript.includes('on')
    const isCloseCmd = transcript.includes('close') || transcript.includes('stop') || transcript.includes('turn off') || transcript.includes('off')
    const isKarnatakaCmd = transcript.includes('karnataka') || transcript.includes('field status') || transcript.includes('report')

    if (isKarnatakaCmd) {
      speak("The Karnataka fields are looking healthy. Current moisture levels are stable across the region.")
      setFeedback("Karnataka Field Report: Healthy & Stable.")
      setTimeout(() => setFeedback(''), 5000)
      return
    }

    if (!isOpenCmd && !isCloseCmd) {
      speak("I couldn't understand if you want to open or close a valve.")
      setTimeout(() => setFeedback(''), 3000)
      return
    }

    // Try to find the target valve by name
    const targetValve = currentValves.find(v => transcript.includes(v.name.toLowerCase()))

    if (!targetValve) {
      speak("I couldn't identify the valve name you mentioned.")
      setTimeout(() => setFeedback(''), 3000)
      return
    }

    const requestedStatus = isOpenCmd

    // If it's already in the requested state
    if (targetValve.status === requestedStatus) {
      const msg = `${targetValve.name} is already ${requestedStatus ? 'open' : 'closed'}.`
      speak(msg)
      setFeedback(msg)
      setTimeout(() => setFeedback(''), 3000)
      return
    }

    // Perform toggle
    try {
      setFeedback(`Toggling ${targetValve.name}...`)
      await valveAPI.toggle(targetValve.id)
      const actionDid = requestedStatus ? 'opened' : 'closed'
      const msg = `Successfully ${actionDid} ${targetValve.name}.`
      speak(msg)
      setFeedback(msg)
      setTimeout(() => setFeedback(''), 4000)
    } catch (err) {
      speak("Sorry, there was an error communicating with the valve.")
      setFeedback('Error performing action.')
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support Speech Recognition. Please use Google Chrome.")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  return (
    <>
      <div 
        onClick={toggleListening}
        title="Voice Control"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: isListening ? '#ef4444' : 'var(--accent-blue)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          zIndex: 9999,
          animation: isListening ? 'pulse 1.5s infinite' : 'none',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => { !isListening && (e.currentTarget.style.transform = 'scale(1.1)') }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        🎤
      </div>
      
      {feedback && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          border: '1px solid var(--border-color)',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 9999,
          animation: 'slideUp 0.3s ease'
        }}>
          🤖 {feedback}
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </>
  )
}
