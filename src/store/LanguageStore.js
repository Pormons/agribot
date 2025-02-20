import { create } from "zustand";

const useLanguageStore = create((set) => ({
  language: "English",
  gen: false,
  setGen: (toggle) => set({ gen: toggle }),
  setLanguage: (newLanguage) => set({ language: newLanguage }),
}));

export default useLanguageStore;
