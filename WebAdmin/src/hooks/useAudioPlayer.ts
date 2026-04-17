import { useState, useRef, useEffect, useCallback } from "react";

export interface PlayingSong {
  id: string;
  title: string;
  coverUrl?: string;
  filePath: string;
}

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<PlayingSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);   // 0-1
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8); // 0-1

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const play = useCallback((song: PlayingSong) => {
    // toggle pause if same song
    if (current?.id === song.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    // stop previous — null handlers first so src="" doesn't fire onerror/onended
    if (audioRef.current) {
      audioRef.current.onerror = null;
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(song.filePath);
    audio.volume = volume;
    audio.ontimeupdate = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.onended = () => { setIsPlaying(false); setProgress(0); };
    audio.onerror = () => { setIsPlaying(false); setCurrent(null); };

    audio.play().catch(() => {});
    audioRef.current = audio;
    setCurrent(song);
    setIsPlaying(true);
    setProgress(0);
    setDuration(0);
  }, [current, isPlaying, volume]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onerror = null;
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrent(null);
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const seek = useCallback((ratio: number) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    audioRef.current.currentTime = ratio * audioRef.current.duration;
  }, []);

  return { current, isPlaying, progress, duration, volume, play, stop, seek, setVolume };
};
