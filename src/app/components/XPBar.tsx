"use client";
import styles from "./XPBar.module.css";
import React from "react";
import { useXP } from "../XPProvider";
import XPCoinAnimation from "./XPCoinAnimation";

declare global {
  interface Window {
    triggerXPAnimation?: (amount: number) => void;
  }
}

const XPBar = () => {
  const { xp, level, addXP } = useXP();
  const XP_PER_LEVEL = 100;
  const percent = Math.min((xp / XP_PER_LEVEL) * 100, 100);
  const [mounted, setMounted] = React.useState(false);
  const [pendingXP, setPendingXP] = React.useState(0);
  const [animating, setAnimating] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (pendingXP > 0 && !animating) {
      setAnimating(true);
    }
  }, [pendingXP, animating]);

  React.useEffect(() => {
    window.triggerXPAnimation = (amount) => {
      setPendingXP(amount);
    };
  }, []);

  if (!mounted) {
    return (
      <div className={styles.xpBarContainer}>
        <div className={styles.level}>Level ...</div>
        <div className={styles.xpBarBg}>
          <div className={styles.xpBarFill} style={{ width: `0%` }}>
            <span className={styles.xpText}>Loading XP...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.xpBarContainer}>
      <div className={styles.level}>Level {level}</div>
      <div className={styles.xpBarBg}>
        <div
          className={styles.xpBarFill}
          style={{ width: `${percent}%` }}
        >
          <span className={styles.xpText}>{xp} / {XP_PER_LEVEL} XP</span>
        </div>
      </div>
      {/* Coin animation overlay */}
      {animating && (
        <React.Suspense fallback={null}>
          {/* @ts-ignore */}
          <XPCoinAnimation
            amount={pendingXP}
            onComplete={() => {
              addXP(pendingXP);
              setPendingXP(0);
              setAnimating(false);
            }}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default XPBar;
