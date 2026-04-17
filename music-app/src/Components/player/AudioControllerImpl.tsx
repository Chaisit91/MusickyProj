import { useEffect, useRef } from "react";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import type { AudioPlayer } from "expo-audio";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getLocalAudioFile } from "../../store/librarySlice";
import {
  setProgress,
  setDuration,
  nextSong,
  clearSeekRequest,
  togglePlay,
} from "../../store/playerSlice";
import { showAfterSongAd } from "../../store/adsSlice";
import { recordPlay } from "../../api/homeApi";

export default function AudioControllerImpl() {
  const dispatch = useAppDispatch();
  const { currentSong, isPlaying, seekRequest, volume, reloadCount, repeatMode, queue } = useAppSelector((s) => s.player);
  const autoPlay = useAppSelector((s) => s.preferences.autoPlay);
  const isPremium = useAppSelector((s) => s.auth.user?.isPremium ?? false);
  const isPremiumRef = useRef(isPremium);
  useEffect(() => { isPremiumRef.current = isPremium; }, [isPremium]);

  const isLoggedIn = useAppSelector((s) => s.auth.isLoggedIn);
  const isLoggedInRef = useRef(isLoggedIn);
  useEffect(() => { isLoggedInRef.current = isLoggedIn; }, [isLoggedIn]);

  const playerRef = useRef<AudioPlayer | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const volumeRef = useRef(volume);
  const autoPlayRef = useRef(autoPlay);
  const repeatModeRef = useRef(repeatMode);
  const queueLengthRef = useRef(queue.length);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { queueLengthRef.current = queue.length; }, [queue.length]);

  // random ad counter: เล่นกี่เพลงแล้วหลัง ad ล่าสุด / ต้องเล่นกี่เพลงถึงจะโชว์ ad
  const songsPlayedRef = useRef(0);
  const adTargetRef = useRef(Math.floor(Math.random() * 3) + 1); // สุ่ม 1-3

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);

  // ── บันทึก play history ทุกครั้งที่เพลงเปลี่ยน (ครอบ queue auto-next, shuffle, after-ad, ฯลฯ) ──
  useEffect(() => {
    if (!currentSong?.id || !isLoggedInRef.current) return;
    recordPlay(currentSong.id).catch(() => {});
  }, [currentSong?.id]);

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

    // ใช้ local file ถ้ามี (offline playback) ไม่งั้นใช้ remote URL
    const localFile = getLocalAudioFile(currentSong.id);
    const audioUri = localFile.exists ? localFile.uri : currentSong.filePath;
    const player = createAudioPlayer({ uri: audioUri });
    player.volume = volumeRef.current;
    playerRef.current = player;

    // Lock screen / Now Playing controls (expo-audio >= 2.x)
    if (typeof player.setActiveForLockScreen === "function") {
      player.setActiveForLockScreen(
        true,
        {
          title: currentSong.title,
          artist: (currentSong.artist as any)?.name ?? undefined,
          albumTitle: (currentSong.album as any)?.title ?? undefined,
          artworkUrl: currentSong.coverUrl ?? undefined,
        },
        { showSeekForward: true, showSeekBackward: true }
      );
    }

    if (isPlayingRef.current) {
      player.play();
    }

    const subscription = player.addListener("playbackStatusUpdate", (status) => {
      dispatch(setProgress(Math.floor(status.currentTime ?? 0)));
      if (status.duration && status.duration > 0) {
        dispatch(setDuration(Math.floor(status.duration)));
      }
      if (status.didJustFinish) {
        const rm = repeatModeRef.current;
        // repeat:one หรือ repeat:all แต่มีเพลงเดียวใน queue → restart เพลงเดิมโดยตรง
        // ไม่ผ่าน nextSong() เพราะ currentSong.id ไม่เปลี่ยน → useEffect ไม่รัน
        if (rm === "one" || (rm === "all" && queueLengthRef.current <= 1)) {
          playerRef.current?.seekTo(0).catch(() => {});
          playerRef.current?.play();
          dispatch(setProgress(0));
          return;
        }

        if (!autoPlayRef.current) {
          dispatch(togglePlay());
        } else if (isPremiumRef.current) {
          dispatch(nextSong());
        } else {
          // Free user → สุ่มแสดงโฆษณาหลัง 1, 2 หรือ 3 เพลง
          songsPlayedRef.current += 1;
          if (songsPlayedRef.current >= adTargetRef.current) {
            songsPlayedRef.current = 0;
            adTargetRef.current = Math.floor(Math.random() * 3) + 1;
            dispatch(showAfterSongAd()).then((result: any) => {
              if (!result.payload) dispatch(nextSong());
            });
          } else {
            dispatch(nextSong());
          }
        }
      }
    });

    return () => {
      subscription.remove();
      if (typeof player.clearLockScreenControls === "function") {
        player.clearLockScreenControls();
      }
      player.pause();
      player.remove();
      playerRef.current = null;
    };
  }, [currentSong?.id, reloadCount]);

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
