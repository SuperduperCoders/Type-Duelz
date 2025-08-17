"use client";
import React, { createContext, useContext, useState } from "react";

interface XPContextType {
  xp: number;
  level: number;
  addXP: (amount: number) => void;
  resetXP: () => void;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export const XPProvider = ({ children }: { children: React.ReactNode }) => {
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const XP_PER_LEVEL = 100;

  const addXP = (amount: number) => {
    setXP(prevXP => {
      const newXP = prevXP + amount;
      if (newXP >= XP_PER_LEVEL) {
        setLevel(lvl => lvl + 1);
        setTimeout(() => setXP(newXP - XP_PER_LEVEL), 500); // Animation delay
        return XP_PER_LEVEL;
      }
      return newXP;
    });
  };

  const resetXP = () => setXP(0);

  return (
    <XPContext.Provider value={{ xp, level, addXP, resetXP }}>
      {children}
    </XPContext.Provider>
  );
};

export const useXP = () => {
  const context = useContext(XPContext);
  if (!context) throw new Error("useXP must be used within XPProvider");
  return context;
};
