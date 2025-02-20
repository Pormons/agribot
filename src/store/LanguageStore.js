import { create } from "zustand";

const useLanguageStore = create((set) => ({
  language: "English",
  setLanguage: (newLanguage) => set({ language: newLanguage }),
}));

export default useLanguageStore;
