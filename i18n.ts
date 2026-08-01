import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import { NativeModules } from "react-native";
import { getSettings, updateLanguage, initDb } from './src/services/settingsDbService';
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
  detect: async (callback: (lng: string) => void) => {
    await initDb();
    let appSettings = await getSettings();

    if (appSettings?.language) {
      callback(appSettings.language);
      return;
    }

    LocaleModule.getLocale().then((locale: string) => {
      callback(locale);
      updateLanguage(locale);
    });
  },
  init: () => { },
  cacheUserLanguage: () => { },
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
