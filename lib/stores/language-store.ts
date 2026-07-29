import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'id' | 'en';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'id',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'teatch-language',
    }
  )
);
