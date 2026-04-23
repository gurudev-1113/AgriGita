import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const translations = {
  en: {
    dashboard: 'Dashboard',
    valves: 'Valves',
    wells: 'Wells',
    live_map: 'Live Map',
    pipelines: 'Pipelines',
    tools: 'Tools',
    ai_suggestions: 'AI Suggestions',
    alerts: 'Alerts',
    profile: 'Profile',
    sign_out: 'Sign Out',
    main_menu: 'Main Menu',
    welcome: 'Welcome',
    total_valves: 'Total Valves',
    active_valves: 'Active Valves',
    inactive_valves: 'Inactive Valves',
    total_wells: 'Total Wells',
    water_used: 'Water Used (L)',
    unread_alerts: 'Unread Alerts',
    water_usage_chart: '💧 Water Usage - Last 7 Days',
    recent_alerts: '🔔 Recent Alerts',
    all_clear: 'All Clear',
    damaged_valves: 'Damaged Valves',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    valves: 'वाल्व (Valves)',
    wells: 'कुएं (Wells)',
    live_map: 'लाइव मैप',
    pipelines: 'पाइपलाइन',
    tools: 'उपकरण',
    ai_suggestions: 'फसल सुझाव',
    alerts: 'सूचनाएं',
    profile: 'प्रोफ़ाइल',
    sign_out: 'लॉग आउट',
    main_menu: 'मुख्य मेनू',
    welcome: 'स्वागत है',
    total_valves: 'कुल वाल्व',
    active_valves: 'सक्रिय वाल्व',
    inactive_valves: 'निष्क्रिय वाल्व',
    total_wells: 'कुल कुएं',
    water_used: 'पानी इस्तेमाल हुआ (L)',
    unread_alerts: 'अपठित सूचनाएं',
    water_usage_chart: '💦 पानी का उपयोग - पिछले 7 दिन',
    recent_alerts: '📢 हाल की सूचनाएं',
    all_clear: 'सब ठीक है',
    damaged_valves: 'क्षतिग्रस्त वाल्व',
  },
  mr: {
    dashboard: 'डॅशबोर्ड',
    valves: 'झडपा (Valves)',
    wells: 'विहिरी (Wells)',
    live_map: 'थेट नकाशा',
    pipelines: 'पाइपलाइन',
    tools: 'साधने',
    ai_suggestions: 'पीक सल्ला',
    alerts: 'सूचना',
    profile: 'प्रोफाइल',
    sign_out: 'लॉग आउट',
    main_menu: 'मुख्य मेनू',
    welcome: 'स्वागत आहे',
    total_valves: 'एकूण झडपा',
    active_valves: 'सक्रिय झडपा',
    inactive_valves: 'निष्क्रिय झडपा',
    total_wells: 'एकूण विहिरी',
    water_used: 'वापरलेले पाणी (L)',
    unread_alerts: 'न वाचलेल्या सूचना',
    water_usage_chart: '💦 पाण्याचा वापर - मागील ७ दिवस',
    recent_alerts: '📢 अलीकडील सूचना',
    all_clear: 'सर्व ठीक आहे',
    damaged_valves: 'खराब झालेल्या झडपा',
  },
  ta: {
    dashboard: 'முகப்பு',
    valves: 'வால்வுகள்',
    wells: 'கிணறுகள்',
    live_map: 'நேரலை வரைபடம்',
    pipelines: 'குழாய்கள்',
    tools: 'கருவிகள்',
    ai_suggestions: 'பயிர் ஆலோசனை',
    alerts: 'விழிப்பூட்டல்கள்',
    profile: 'சுயவிவரம்',
    sign_out: 'வெளியேறு',
    main_menu: 'முக்கிய மெனு',
    welcome: 'நல்வரவு',
    total_valves: 'மொத்த வால்வுகள்',
    active_valves: 'செயலில் உள்ளவை',
    inactive_valves: 'செயலற்றவை',
    total_wells: 'மொத்த கிணறுகள்',
    water_used: 'பயன்படுத்திய நீர் (L)',
    unread_alerts: 'படிக்காதவை',
    water_usage_chart: '💦 நீர் பயன்பாடு - கடந்த 7 நாட்கள்',
    recent_alerts: '📢 சமீபத்திய விழிப்பூட்டல்கள்',
    all_clear: 'எல்லாம் சரி',
    damaged_valves: 'சேதமடைந்த வால்வுகள்',
  },
  te: {
    dashboard: 'డ్యాష్‌బోర్డ్',
    valves: 'వాల్వ్‌లు',
    wells: 'బావులు',
    live_map: 'లైవ్ మ్యాప్',
    pipelines: 'పైప్‌లైన్‌లు',
    tools: 'సాధనాలు',
    ai_suggestions: 'పంట సూచనలు',
    alerts: 'హెచ్చరికలు',
    profile: 'ప్రొఫైల్',
    sign_out: 'లాగ్ అవుట్',
    main_menu: 'ప్రధాన మెను',
    welcome: 'స్వాగతం',
    total_valves: 'మొత్తం వాల్వ్‌లు',
    active_valves: 'క్రియాశీల వాల్వ్‌లు',
    inactive_valves: 'క్రియారహిత వాల్వ్‌లు',
    total_wells: 'మొత్తం బావులు',
    water_used: 'వాడిన నీరు (L)',
    unread_alerts: 'చదవని హెచ్చరికలు',
    water_usage_chart: '💦 నీటి వినియోగం - గత 7 రోజులు',
    recent_alerts: '📢 తాజా హెచ్చరికలు',
    all_clear: 'అంతా బాగుంది',
    damaged_valves: 'పాడైన వాల్వ్‌లు',
  },
  kn: {
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    valves: 'ಕವಾಟಗಳು (Valves)',
    wells: 'ಬಾವಿಗಳು',
    live_map: 'ಲೈವ್ ಮ್ಯಾಪ್',
    pipelines: 'ಪೈಪ್‌ಲೈನ್‌ಗಳು',
    tools: 'ಪರಿಕರಗಳು',
    ai_suggestions: 'ಬೆಳೆ ಸಲಹೆಗಳು',
    alerts: 'ಎಚ್ಚರಿಕೆಗಳು',
    profile: 'ಪ್ರೊಫೈಲ್',
    sign_out: 'ಲಾಗ್ ಔಟ್',
    main_menu: 'ಮುಖ್ಯ ಮೆನು',
    welcome: 'ಸ್ವಾಗತ',
    total_valves: 'ಒಟ್ಟು ಕವಾಟಗಳು',
    active_valves: 'ಸಕ್ರಿಯ ಕವಾಟಗಳು',
    inactive_valves: 'ನಿಷ್ಕ್ರಿಯ ಕವಾಟಗಳು',
    total_wells: 'ಒಟ್ಟು ಬಾವಿಗಳು',
    water_used: 'ಬಳಸಿದ ನೀರು (L)',
    unread_alerts: 'ಓದದ ಎಚ್ಚರಿಕೆಗಳು',
    water_usage_chart: '💧 ನೀರಿನ ಬಳಕೆ - ಕಳೆದ 7 ದಿನಗಳು',
    recent_alerts: '🔔 ಇತ್ತೀಚಿನ ಎಚ್ಚರಿಕೆಗಳು',
    all_clear: 'ಎಲ್ಲವೂ ಸರಿಯಾಗಿದೆ',
    damaged_valves: 'ಹಾನಿಗೊಳಗಾದ ಕವಾಟಗಳು',
  }
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const { user, updateUser } = useAuth()
  const [lang, setLang] = useState('en')

  useEffect(() => {
    if (user?.language) {
      setLang(user.language)
    }
  }, [user?.language])

  const t = (key) => {
    return translations[lang]?.[key] || translations['en'][key] || key
  }

  const changeLanguage = (newLang) => {
    setLang(newLang)
    if (user) {
      updateUser({ ...user, language: newLang })
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
