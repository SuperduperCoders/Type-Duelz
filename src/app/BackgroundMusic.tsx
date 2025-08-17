"use client";

import { useRef, useState } from "react";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  const toggleMute = () => {
    setMuted((m) => {
      if (audioRef.current) audioRef.current.muted = !m;
      return !m;
    });
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/Infinite Typing Flow_20250817_1032.mp3"
        autoPlay
        loop
        preload="auto"
        muted={muted}
        style={{ position: 'fixed', left: 0, bottom: 0, width: 0, height: 0, pointerEvents: 'none' }}
      />
      <button
        onClick={toggleMute}
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: '16px',
          background: '#fff',
          color: '#333',
          borderRadius: 8,
          padding: '8px 16px',
          border: '1px solid #ccc',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 10000,
        }}
      >
        {muted ? "Unmute Music" : "Mute Music"}
      </button>
    </>
  );
}
