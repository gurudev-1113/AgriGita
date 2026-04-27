import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    dashboard: 'Dashboard',
    valves: 'Valves',
    ai_suggestions: 'AI Advice',
    plant_health: 'Plant Health',
    my_orders: 'History',
    run_diagnostic: 'Run Diagnostic',
    buy_treatment: 'Buy Treatment',
    no_disease: 'No disease detected',
    confirm_order: 'Order Confirmed! 🚚',
    gps_required: 'GPS Permission Required',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    valves: 'वाल्व',
    ai_suggestions: 'कृषि सलाह',
    plant_health: 'फसल स्वास्थ्य',
    my_orders: 'इतिहास',
    run_diagnostic: 'जांच करें',
    buy_treatment: 'इलाज खरीदें',
    no_disease: 'कोई बीमारी नहीं मिली',
    confirm_order: 'आदेश की पुष्टि! 🚚',
    gps_required: 'जीपीएस अनुमति आवश्यक है',
  },
  mr: {
    dashboard: 'डॅशबोर्ड',
    valves: 'झडपा',
    ai_suggestions: 'पीक सल्ला',
    plant_health: 'पीक आरोग्य',
    my_orders: 'इतिहास',
    run_diagnostic: 'तपासणी करा',
    buy_treatment: 'औषध खरेदी करा',
    no_disease: 'कोणताही आजार आढळला नाही',
    confirm_order: 'ऑर्डर पक्की झाली! 🚚',
    gps_required: 'GPS परवानगी आवश्यक आहे',
  },
  ta: {
    dashboard: 'முகப்பு',
    valves: 'வால்வுகள்',
    ai_suggestions: 'ஆலோசனை',
    plant_health: 'பயிர் ஆரோக்கியம்',
    my_orders: 'வரலாறு',
    run_diagnostic: 'பரிசோதனை',
    buy_treatment: 'மருந்து வாங்கு',
    no_disease: 'நோய் எதுவும் இல்லை',
    confirm_order: 'ஆர்டர் செய்யப்பட்டது! 🚚',
    gps_required: 'GPS அனுமதி தேவை',
  },
  te: {
    dashboard: 'డ్యాష్‌బోర్డ్',
    valves: 'వాల్వ్‌లు',
    ai_suggestions: 'సలహాలు',
    plant_health: 'పంట ఆరోగ్యం',
    my_orders: 'చరిత్ర',
    run_diagnostic: 'పరీక్షించండి',
    buy_treatment: 'మందు కొనుగోలు',
    no_disease: 'ఏ వ్యాధి లేదు',
    confirm_order: 'ఆర్డర్ ఖరారైంది! 🚚',
    gps_required: 'GPS అనుమతి అవసరం',
  },
  kn: {
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    valves: 'ಕವಾಟಗಳು',
    ai_suggestions: 'ಸಲಹೆಗಳು',
    plant_health: 'ಬೆಳೆ ಆರೋಗ್ಯ',
    my_orders: 'ಇತಿಹಾಸ',
    run_diagnostic: 'ಪರೀಕ್ಷಿಸಿ',
    buy_treatment: 'ಚಿಕಿತ್ಸೆ ಖರೀದಿ',
    no_disease: 'ಯಾವುದೇ ಕಾಯಿಲೆ ಇಲ್ಲ',
    confirm_order: 'ಆದೇಶ ಖಚಿತವಾಯಿತು! 🚚',
    gps_required: 'GPS ಅನುಮತಿ ಬೇಕು',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const t = (key) => {
    return translations[lang]?.[key] || translations['en'][key] || key;
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
