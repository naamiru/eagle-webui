import { create } from "zustand";

type CollectionPageKey = {
  key: number;
  reset: () => void;
};

export const useCollectionPageKey = create<CollectionPageKey>((set) => ({
  key: 0,
  reset: () => set((state) => ({ key: state.key + 1 })),
}));
