import { create } from "zustand";

type SliderState = {
  isPresented: boolean;
  setIsPresented: (isPresented: boolean) => void;
};

export const useSliderState = create<SliderState>((set) => ({
  isPresented: false,
  setIsPresented: (isPresented: boolean) => set({ isPresented }),
}));
