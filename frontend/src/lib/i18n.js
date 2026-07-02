import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enPatient from '@/locales/en/patient.json';
import urPatient from '@/locales/ur/patient.json';
import enCommon from '@/locales/en/common.json';
import urCommon from '@/locales/ur/common.json';

const saved = typeof window !== 'undefined' ? localStorage.getItem('app_lang') : null;

i18n.use(initReactI18next).init({
  resources: {
    en: { patient: enPatient, common: enCommon },
    ur: { patient: urPatient, common: urCommon },
  },
  lng: saved || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  defaultNS: 'common',
});

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') localStorage.setItem('app_lang', lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ur' ? 'rtl' : 'ltr';
});

export default i18n;
