"use client";

import type React from "react";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type Ctx = {
  header: React.ReactNode;
  setHeader: (node: React.ReactNode) => void;
};

const HeaderSlotContext = createContext<Ctx | null>(null);

export function HeaderSlotProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [header, setHeader] = useState<React.ReactNode>(null);
  return (
    <HeaderSlotContext.Provider value={{ header, setHeader }}>
      {children}
    </HeaderSlotContext.Provider>
  );
}

export function useHeaderSlot() {
  const ctx = useContext(HeaderSlotContext);
  if (!ctx)
    throw new Error("useHeaderSlot must be used within HeaderSlotProvider");
  return ctx;
}

export default function AppHeader({ children }: PropsWithChildren) {
  const { setHeader } = useHeaderSlot();
  useEffect(() => {
    setHeader(children);
    return () => setHeader(null);
  }, [children, setHeader]);
  return null;
}
