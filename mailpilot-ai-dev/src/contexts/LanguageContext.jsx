import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../locales/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ko');
  const [t, setT] = useState(translations.ko);

  // 설정에서 언어 가져오기
  useEffect(() => {
    fetchLanguageSettings();
  }, []);

  const fetchLanguageSettings = async () => {
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) return;
      
      const response = await fetch(`http://localhost:5001/api/settings?email=${encodeURIComponent(userEmail)}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success && data.settings?.GENERAL?.WRITE?.language) {
        changeLanguage(data.settings.GENERAL.WRITE.language);
      }
    } catch (error) {
      console.error('[언어] 설정 불러오기 실패:', error);
    }
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      setT(translations[lang]);
      document.documentElement.lang = lang;
    }
  };

  const value = {
    language,
    changeLanguage,
    t,
    // 편의 함수: 중첩된 키 접근 (예: 'sidebar.inbox')
    getText: (key) => {
      const keys = key.split('.');
      let result = t;
      for (const k of keys) {
        result = result?.[k];
      }
      return result || key;
    }
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;