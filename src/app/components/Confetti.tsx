"use client";
import React, { useEffect, useRef } from 'react';

export default function Confetti({ trigger }: { trigger: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width = 120;
    const H = canvas.height = 60;
    const confettiCount = 20;
    const confetti: { x: number; y: number; r: number; d: number; color: string; tilt: number; tiltAngle: number; }[] = [];
    const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];
    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 6 + 4,
        d: Math.random() * confettiCount,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 10,
        tiltAngle: 0,
      });
    }
    let frame = 0;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < confettiCount; i++) {
        const c = confetti[i];
        if (!ctx) continue;
        ctx.beginPath();
        ctx.lineWidth = c.r;
        ctx.strokeStyle = c.color;
        ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
        ctx.lineTo(c.x + c.tilt, c.y + c.r);
        ctx.stroke();
      }
      update();
      frame++;
      if (frame < 30) requestAnimationFrame(draw);
    }
    function update() {
      for (let i = 0; i < confettiCount; i++) {
        const c = confetti[i];
        c.y += Math.cos(c.d) + 1 + c.r / 5;
        c.x += Math.sin(c.d);
        c.tiltAngle += 0.05;
        c.tilt = Math.sin(c.tiltAngle) * 10;
      }
    }
    draw();
  }, [trigger]);

  return (
    <canvas ref={canvasRef} style={{ pointerEvents: 'none', position: 'absolute', left: 0, top: 0, width: '120px', height: '60px', zIndex: 10 }} />
  );
}
