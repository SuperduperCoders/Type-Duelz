"use client";
import styles from "./XPBar.module.css";
import React from "react";
import { useXP } from "../XPProvider";

const XPBar = () => {
  const { xp, level } = useXP();
  const XP_PER_LEVEL = 100;
  const percent = Math.min((xp / XP_PER_LEVEL) * 100, 100);

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
    </div>
  );
};

export default XPBar;
