import { create } from "zustand";

type SliderState = {
  isPresented: boolean;
  setIsPresented: (isPresented: boolean) => void;

  inspectedItemId?: string;
  inspectItem: (id?: string) => void;
};

export const useSliderState = create<SliderState>((set) => ({
  isPresented: false,
  setIsPresented: (isPresented) =>
    set({ isPresented, inspectedItemId: undefined }),

  inspectedItemId: undefined,
  inspectItem: (id) => set({ inspectedItemId: id }),
}));
