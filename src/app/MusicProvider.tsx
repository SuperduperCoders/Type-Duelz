"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface MusicContextType {
  muted: boolean;
  toggleMute: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [muted, setMuted] = useState(false);
  const toggleMute = () => setMuted((m) => !m);

  return (
    <MusicContext.Provider value={{ muted, toggleMute }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used within a MusicProvider");
  return context;
};
