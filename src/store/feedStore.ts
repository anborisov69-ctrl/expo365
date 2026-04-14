"use client";

import { create } from "zustand";

interface FeedState {
  category: string;
  setCategory: (category: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  category: "",
  setCategory: (category) => set({ category })
}));
