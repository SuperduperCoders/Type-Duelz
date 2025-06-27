import { useRef } from "react";

export function useErrorAudio() {
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  const playError = () => {
    if (errorAudioRef.current) {
      errorAudioRef.current.pause();
      errorAudioRef.current.currentTime = 0;
      errorAudioRef.current.play().catch((e) => {
        console.log("Error audio play failed:", e);
      });
    }
  };

  // Usage: <audio ref={errorAudioRef} src="/error.mp3" preload="auto" />
  return { errorAudioRef, playError };
}
