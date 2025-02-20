import { create } from "zustand";

const useAuthStore = create((set) => ({
  signed_in: false,
  setSignedIn: (signedIn) => set({signed_in: signedIn}),
}));

export default useAuthStore;
