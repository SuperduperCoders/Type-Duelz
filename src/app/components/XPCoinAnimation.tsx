"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./XPBar.module.css";

interface XPCoinAnimationProps {
  amount: number;
  onComplete: () => void;
}

const COIN_COUNT = 8;

const gradients = [
  "linear-gradient(90deg, #FFD700, #FF69B4)",
  "linear-gradient(90deg, #4e9cff, #00e0ff)",
  "linear-gradient(90deg, #ff8c00, #ffd700)",
  "linear-gradient(90deg, #00e0ff, #ff69b4)",
];

export default function XPCoinAnimation({ amount, onComplete }: XPCoinAnimationProps) {
  const [coins, setCoins] = useState<number[]>([]);
  const [animating, setAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (amount > 0) {
      setCoins(Array.from({ length: COIN_COUNT }, (_, i) => i));
      setAnimating(true);
      timeoutRef.current = setTimeout(() => {
        setAnimating(false);
        setCoins([]);
        onComplete();
      }, 700); // fast animation
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [amount, onComplete]);

  if (!animating) return null;

  return (
    <div className={styles.coinAnimContainer}>
      {coins.map((c, i) => (
        <div
          key={i}
          className={styles.coin}
          style={{
            left: `${20 + Math.random() * 40}px`,
            top: `${120 + Math.random() * 40}px`,
            animationDelay: `${i * 0.07}s`,
            background: gradients[i % gradients.length],
            boxShadow: `0 0 16px 4px ${i % 2 === 0 ? '#FFD700' : '#00e0ff'}`,
          }}
        >
          <span className={styles.coinParticle} />
        </div>
      ))}
    </div>
  );
}
