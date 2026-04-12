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
import {
  showAfterMultipleAd,
  resetAdCounter,
} from "../../store/adsSlice";

export default function AudioControllerImpl() {
  const dispatch = useAppDispatch();
  const { currentSong, isPlaying, seekRequest, volume } = useAppSelector((s) => s.player);
  const autoPlay = useAppSelector((s) => s.preferences.autoPlay);
  const isPremium = useAppSelector((s) => s.auth.user?.isPremium ?? false);
  const isPremiumRef = useRef(isPremium);
  useEffect(() => { isPremiumRef.current = isPremium; }, [isPremium]);

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
        console.log("[AudioController] didJustFinish — isPremium:", isPremiumRef.current, "autoPlay:", autoPlayRef.current);
        if (!autoPlayRef.current) {
          dispatch(togglePlay());
        } else if (isPremiumRef.current) {
          dispatch(nextSong());
        } else {
          // Free user → แสดงโฆษณาหลังทุกเพลง
          console.log("[AudioController] dispatching showAfterMultipleAd");
          dispatch(resetAdCounter());
          dispatch(showAfterMultipleAd()).then((result: any) => {
            console.log("[AudioController] showAfterMultipleAd resolved, payload:", result.payload?.id ?? "null");
            if (!result.payload) {
              dispatch(nextSong());
            }
          });
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
