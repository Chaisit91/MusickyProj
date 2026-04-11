import { useEffect, useRef } from "react";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import type { AudioPlayer } from "expo-audio";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setProgress,
  setDuration,
  nextSong,
  clearSeekRequest,
  togglePlay,
} from "../../store/playerSlice";

export default function AudioControllerImpl() {
  const dispatch = useAppDispatch();
  const { currentSong, isPlaying, seekRequest, volume } = useAppSelector((s) => s.player);
  const autoPlay = useAppSelector((s) => s.preferences.autoPlay);

  const playerRef = useRef<AudioPlayer | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const volumeRef = useRef(volume);
  const autoPlayRef = useRef(autoPlay);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);

  // ── Set audio mode once ───────────────────────────────────────────────────────
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch(() => {});

    return () => {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.remove();
        playerRef.current = null;
      }
    };
  }, []);

  // ── โหลดเพลงใหม่เมื่อ currentSong เปลี่ยน ───────────────────────────────────
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.remove();
      playerRef.current = null;
    }

    if (!currentSong) return;

    console.log("AudioController: loading", currentSong.filePath);

    const player = createAudioPlayer({ uri: currentSong.filePath });
    player.volume = volumeRef.current;
    playerRef.current = player;

    if (isPlayingRef.current) {
      player.play();
    }

    const subscription = player.addListener("playbackStatusUpdate", (status) => {
      dispatch(setProgress(Math.floor(status.currentTime ?? 0)));
      if (status.duration && status.duration > 0) {
        dispatch(setDuration(Math.floor(status.duration)));
      }
      if (status.didJustFinish) {
        if (autoPlayRef.current) {
          dispatch(nextSong());
        } else {
          dispatch(togglePlay()); // หยุดเพลง ไม่เล่นต่อ
        }
      }
    });

    return () => {
      subscription.remove();
      player.pause();
      player.remove();
      playerRef.current = null;
    };
  }, [currentSong?.id]);

  // ── Play / Pause ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying]);

  // ── Volume ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = volume;
    }
  }, [volume]);

  // ── Seek (expo-audio ใช้ seconds) ─────────────────────────────────────────────
  useEffect(() => {
    if (seekRequest === null) return;
    playerRef.current?.seekTo(seekRequest).catch(() => {});
    dispatch(clearSeekRequest());
  }, [seekRequest]);

  return null;
}
