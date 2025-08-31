"use client";
import React, { createContext, useContext, useState } from "react";

interface XPContextType {
  xp: number;
  level: number;
  addXP: (amount: number) => void;
  resetXP: () => void;
  setLevel: (lvl: number) => void;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export const XPProvider = ({ children }: { children: React.ReactNode }) => {
  const [xp, setXP] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('xp') || '0', 10);
    }
    return 0;
  });
  const [level, setLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('level') || '1', 10);
    }
    return 1;
  });
  const XP_PER_LEVEL = 100;

  // Save XP and level to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('xp', xp.toString());
      localStorage.setItem('level', level.toString());
    }
  }, [xp, level]);

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

  const resetXP = () => {
    setXP(0);
    setLevel(lvl => lvl + 1);
    if (typeof window !== 'undefined') {
      localStorage.setItem('level', (level + 1).toString());
    }
  };

  const setLevelDirect = (lvl: number) => {
    setLevel(lvl);
    if (typeof window !== 'undefined') {
      localStorage.setItem('level', lvl.toString());
    }
  };

  return (
    <XPContext.Provider value={{ xp, level, addXP, resetXP, setLevel: setLevelDirect }}>
      {children}
    </XPContext.Provider>
  );
};

export const useXP = () => {
  const context = useContext(XPContext);
  if (!context) throw new Error("useXP must be used within XPProvider");
  return context;
};
