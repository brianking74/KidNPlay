import { create } from "zustand";
import { persist } from "zustand/middleware";

interface KidModeState {
  isKidMode: boolean;
  toggle: () => void;
  set: (value: boolean) => void;
}

export const useKidMode = create<KidModeState>()(
  persist(
    (set) => ({
      isKidMode: false,
      toggle: () => set((state) => ({ isKidMode: !state.isKidMode })),
      set: (value) => set({ isKidMode: value }),
    }),
    { name: "kidventour-kidmode" }
  )
);

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  childName: string;
  childAge: number;
  interests: string[];
  setCompleted: (completed: boolean) => void;
  setChildName: (name: string) => void;
  setChildAge: (age: number) => void;
  setInterests: (interests: string[]) => void;
  reset: () => void;
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      childName: "",
      childAge: 5,
      interests: [],
      setCompleted: (completed) => set({ hasCompletedOnboarding: completed }),
      setChildName: (name) => set({ childName: name }),
      setChildAge: (age) => set({ childAge: age }),
      setInterests: (interests) => set({ interests }),
      reset: () =>
        set({
          hasCompletedOnboarding: false,
          childName: "",
          childAge: 5,
          interests: [],
        }),
    }),
    { name: "kidventour-onboarding" }
  )
);
