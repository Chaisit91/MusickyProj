import { useEffect, useRef } from "react";
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from "expo-audio";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setProgress,
  setDuration,
  nextSong,
  clearSeekRequest,
} from "../store/playerSlice";


export default function AudioControllerImpl() {
  const dispatch = useAppDispatch();
  const { currentSong, isPlaying, seekRequest, volume } = useAppSelector((s) => s.player);

  const isPlayingRef = useRef(isPlaying);
  const initializedRef = useRef(false);

  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // ── Set audio mode once ───────────────────────────────────────────────────────
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch(() => {});
  }, []);

  // ── โหลดเพลงใหม่เมื่อ currentSong เปลี่ยน ───────────────────────────────────
  useEffect(() => {
    if (!currentSong) {
      player.pause();
      initializedRef.current = false;
      return;
    }

    console.log("AudioController: loading", currentSong.filePath);
    initializedRef.current = false;

    player.replace({ uri: currentSong.filePath });

    // play() หลัง replace จะรอ buffer อัตโนมัติ
    if (isPlayingRef.current) {
      player.play();
    }

    initializedRef.current = true;
  }, [currentSong?.id]);

  // ── Update duration ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (status.duration && status.duration > 0) {
      dispatch(setDuration(Math.floor(status.duration)));
    }
  }, [status.duration]);

  // ── Update progress + auto-next ───────────────────────────────────────────────
  useEffect(() => {
    dispatch(setProgress(Math.floor(status.currentTime ?? 0)));
    if (status.didJustFinish) {
      dispatch(nextSong());
    }
  }, [status.currentTime, status.didJustFinish]);

  // ── Play / Pause ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initializedRef.current) return;
    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying]);

  // ── Volume ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    player.volume = volume;
  }, [volume]);

  // ── Seek ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (seekRequest === null) return;
    player.seekTo(seekRequest); // expo-audio ใช้ seconds (ไม่ใช่ ms)
    dispatch(clearSeekRequest());
  }, [seekRequest]);

  return null;
}
