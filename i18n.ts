import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import { NativeModules } from "react-native";
const { LocaleModule } = NativeModules;

const resources = {
  en: {
    translation: en
  },
  es: {
    translation: es
  }
};

type DetectorModule = {
  type: 'languageDetector';
  async: boolean;
  detect: (callback: (lng: string) => void) => void;
  init: () => void;
  cacheUserLanguage: () => void;
};

const languageDetector: DetectorModule = {
  type: 'languageDetector',
  async: true, // flags below detection to be async
  detect: (callback: (lng: string) => void) => {
    return /*'en'; */ LocaleModule.getLocale().then((locale: string) => {
      callback(locale);
    });
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
