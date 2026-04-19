// Audio engine หลัก — ใช้ expo-audio สร้าง AudioPlayer, sync play/pause/seek/volume จาก Redux, จัดการ auto-next song, trigger โฆษณาหลัง 1-3 เพลง (free user), บันทึก play history, lock screen controls
//
// หลักการทำงาน:
// 1. mount: setAudioModeAsync (เล่นใน silent mode + background), restore skip count
// 2. เมื่อ currentSong เปลี่ยน หรือ reloadCount เพิ่ม: ทำลาย player เก่า → สร้าง player ใหม่จาก URI (local file หรือ remote URL)
// 3. subscribe playbackStatusUpdate: อัปเดต progress/duration ลง Redux ทุกครั้งที่ audio report
// 4. เมื่อ didJustFinish: ตรวจ repeatMode → repeat:one/all loop เพลงเดิม, autoPlay off หยุด, premium → nextSong ทันที
// 5. free user + เพลงจบ: นับ songsPlayed เทียบ adTarget (สุ่ม 1-3) → ถึงเป้า dispatch showAfterSongAd
// 6. play/pause, volume, seek: แต่ละอย่าง sync จาก Redux ผ่าน useEffect แยก dependency
// 7. cleanup: ทุก useEffect return cleanup function ที่ remove listener และ destroy player

// AudioControllerImpl — Component ไม่มี UI, ทำหน้าที่ควบคุม audio engine ทั้งหมด
// เชื่อมต่อระหว่าง Redux store (playerSlice) กับ expo-audio เพื่อเล่น/หยุด/เลื่อนเพลง

import { useEffect, useRef } from "react";
// createAudioPlayer = สร้าง audio player instance, setAudioModeAsync = ตั้งค่าโหมดเสียง
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import type { AudioPlayer } from "expo-audio"; // import type เฉพาะ TypeScript ไม่มี runtime cost
import { useAppDispatch, useAppSelector } from "../../store/hooks"; // custom typed Redux hooks
import { getLocalAudioFile } from "../../store/librarySlice"; // ดึง path ไฟล์ที่ดาวน์โหลดไว้ในเครื่อง
import {
  setProgress,       // อัปเดต progress ปัจจุบัน (วินาที) ลง Redux
  setDuration,       // อัปเดตความยาวเพลงทั้งหมด (วินาที) ลง Redux
  nextSong,          // dispatch เพื่อข้ามไปเพลงถัดไปใน queue
  clearSeekRequest,  // ล้าง seekRequest หลังจาก seek เสร็จแล้ว
  togglePlay,        // สลับ play/pause ใน Redux state
} from "../../store/playerSlice";
import { showAfterSongAd } from "../../store/adsSlice"; // dispatch เพื่อแสดงโฆษณาหลังจากเพลงจบ
import { recordPlay } from "../../api/homeApi"; // บันทึกประวัติการเล่นเพลงไปที่ server

export default function AudioControllerImpl() {
  const dispatch = useAppDispatch(); // ใช้ dispatch ส่ง action ไปยัง Redux store

  // ดึงข้อมูลจาก Redux player state ที่ต้องใช้ทั้งหมดในคราวเดียว
  const { currentSong, isPlaying, seekRequest, volume, reloadCount, repeatMode, queue } = useAppSelector((s) => s.player);

  // ดึงค่า autoPlay จาก preferences — ถ้า false จะหยุดเมื่อเพลงจบโดยไม่ข้ามเพลงถัดไป
  const autoPlay = useAppSelector((s) => s.preferences.autoPlay);

  // ดึงสถานะ premium ของผู้ใช้ — ใช้ตัดสินว่าจะแสดงโฆษณาหรือไม่
  const isPremium = useAppSelector((s) => s.auth.user?.isPremium ?? false);

  // isPremiumRef ใช้ใน closure ของ event listener เพื่อให้ได้ค่าล่าสุดโดยไม่ต้อง re-subscribe
  const isPremiumRef = useRef(isPremium);
  // sync ref ทุกครั้งที่ isPremium เปลี่ยน เพื่อให้ closure ใน event listener อ่านค่าถูกต้อง
  useEffect(() => { isPremiumRef.current = isPremium; }, [isPremium]);

  // ดึงสถานะ login — ใช้ตัดสินว่าจะ recordPlay หรือไม่
  const isLoggedIn = useAppSelector((s) => s.auth.isLoggedIn);
  // isLoggedInRef ใช้ใน useEffect ของ recordPlay เพื่อหลีกเลี่ยง re-subscribe ซ้ำซ้อน
  const isLoggedInRef = useRef(isLoggedIn);
  // sync ref ทุกครั้งที่ isLoggedIn เปลี่ยน
  useEffect(() => { isLoggedInRef.current = isLoggedIn; }, [isLoggedIn]);

  // playerRef เก็บ audio player instance ปัจจุบัน เพื่อให้ทุก useEffect เข้าถึงได้
  const playerRef = useRef<AudioPlayer | null>(null);
  // isPlayingRef ใช้ใน closure ของ createAudioPlayer เพื่ออ่านค่าล่าสุด
  const isPlayingRef = useRef(isPlaying);
  // volumeRef ใช้ตั้งค่า volume ทันทีเมื่อสร้าง player ใหม่
  const volumeRef = useRef(volume);
  // autoPlayRef ใช้ใน playbackStatusUpdate listener เพื่อตัดสินใจหลังเพลงจบ
  const autoPlayRef = useRef(autoPlay);
  // repeatModeRef ใช้ใน listener เพื่อรู้โหมด repeat โดยไม่ต้อง re-subscribe
  const repeatModeRef = useRef(repeatMode);
  // queueLengthRef ใช้ตรวจสอบจำนวนเพลงใน queue โดยไม่ trigger re-render
  const queueLengthRef = useRef(queue.length);

  // sync repeatMode ref ทุกครั้งที่ผู้ใช้เปลี่ยนโหมด repeat
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  // sync queueLength ref ทุกครั้งที่ queue เพิ่ม/ลดเพลง
  useEffect(() => { queueLengthRef.current = queue.length; }, [queue.length]);

  // random ad counter: เล่นกี่เพลงแล้วหลัง ad ล่าสุด / ต้องเล่นกี่เพลงถึงจะโชว์ ad
  const songsPlayedRef = useRef(0); // นับจำนวนเพลงที่เล่นไปนับแต่โฆษณาครั้งล่าสุด
  const adTargetRef = useRef(Math.floor(Math.random() * 3) + 1); // สุ่มเป้าหมาย 1-3 เพลง

  // sync isPlaying ref ทุกครั้งที่ state เปลี่ยน เพื่อให้ closure อ่านค่าถูกต้อง
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  // sync volume ref ทุกครั้งที่ผู้ใช้ปรับ volume
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  // sync autoPlay ref ทุกครั้งที่ผู้ใช้เปลี่ยนการตั้งค่า
  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);

  // ── บันทึก play history ทุกครั้งที่เพลงเปลี่ยน (ครอบ queue auto-next, shuffle, after-ad, ฯลฯ) ──
  useEffect(() => {
    // ถ้าไม่มี song id หรือยังไม่ได้ login ก็ไม่ต้องบันทึก
    if (!currentSong?.id || !isLoggedInRef.current) return;
    // เรียก API บันทึก play history — ไม่สนใจ error เพราะ non-critical
    recordPlay(currentSong.id).catch(() => {});
  }, [currentSong?.id]); // รันเฉพาะเมื่อ song id เปลี่ยน ไม่รันซ้ำจาก dependency อื่น

  // ── Set audio mode once ───────────────────────────────────────────────────────
  useEffect(() => {
    // ตั้งค่าโหมดเสียง: เล่นได้แม้กด silent mode และเล่นต่อเนื่องเมื่อ app อยู่ background
    setAudioModeAsync({
      playsInSilentMode: true,       // เล่นแม้ iPhone อยู่โหมดเงียบ
      shouldPlayInBackground: true,  // เล่นต่อเมื่อ app ถูก minimize
    }).catch(() => {}); // ignore error ถ้า device ไม่รองรับ

    // cleanup: หยุดและทำลาย player เมื่อ component unmount (เช่น logout)
    return () => {
      if (playerRef.current) {
        playerRef.current.pause();   // หยุดเสียงก่อน
        playerRef.current.remove();  // release native resource
        playerRef.current = null;    // reset ref
      }
    };
  }, []); // dependency ว่าง = รันครั้งเดียวตอน mount

  // ── โหลดเพลงใหม่เมื่อ currentSong เปลี่ยน ───────────────────────────────────
  useEffect(() => {
    // ทำลาย player เก่าก่อนสร้างใหม่ เพื่อป้องกันเสียงซ้อน
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.remove();
      playerRef.current = null;
    }

    // ถ้าไม่มีเพลง ไม่ต้องทำอะไร
    if (!currentSong) return;

    // ใช้ local file ถ้ามี (offline playback) ไม่งั้นใช้ remote URL
    const localFile = getLocalAudioFile(currentSong.id); // ตรวจสอบไฟล์ที่ดาวน์โหลดไว้
    // เลือก URI: ถ้ามีไฟล์ offline ใช้ local URI, ถ้าไม่มีใช้ URL จาก server
    const audioUri = localFile.exists ? localFile.uri : currentSong.filePath;
    // สร้าง player instance ใหม่จาก URI ที่ได้
    const player = createAudioPlayer({ uri: audioUri });
    // ตั้ง volume ทันทีจาก ref เพื่อให้เสียงถูกต้องตั้งแต่เริ่มเล่น
    player.volume = volumeRef.current;
    // เก็บ instance ไว้ใน ref เพื่อให้ useEffect อื่นเข้าถึงได้
    playerRef.current = player;

    // Lock screen / Now Playing controls (expo-audio >= 2.x)
    // ตรวจสอบว่า API นี้มีใน version ที่ใช้หรือไม่ก่อนเรียก
    if (typeof player.setActiveForLockScreen === "function") {
      player.setActiveForLockScreen(
        true,
        {
          // ข้อมูลที่แสดงบน lock screen / notification
          title: currentSong.title,
          artist: (currentSong.artist as any)?.name ?? undefined,
          albumTitle: (currentSong.album as any)?.title ?? undefined,
          artworkUrl: currentSong.coverUrl ?? undefined,
        },
        // แสดงปุ่ม seek บน lock screen
        { showSeekForward: true, showSeekBackward: true }
      );
    }

    // เริ่มเล่นทันทีถ้า state บอกว่ากำลังเล่นอยู่ (เช่น ข้ามเพลงขณะเล่น)
    if (isPlayingRef.current) {
      player.play();
    }

    // subscribe รับ event อัปเดต playback status ทุก ๆ ช่วงเวลา
    const subscription = player.addListener("playbackStatusUpdate", (status) => {
      // อัปเดต progress ลง Redux (แปลงเป็น int เพื่อไม่ให้ render บ่อยเกินไป)
      dispatch(setProgress(Math.floor(status.currentTime ?? 0)));
      // อัปเดต duration เมื่อรู้ความยาวเพลงแล้ว (จะรู้หลังโหลดข้อมูล metadata)
      if (status.duration && status.duration > 0) {
        dispatch(setDuration(Math.floor(status.duration)));
      }

      // จัดการเมื่อเพลงเล่นจบ
      if (status.didJustFinish) {
        const rm = repeatModeRef.current; // อ่านโหมด repeat จาก ref เพื่อได้ค่าล่าสุด

        // repeat:one หรือ repeat:all แต่มีเพลงเดียวใน queue → restart เพลงเดิมโดยตรง
        // ไม่ผ่าน nextSong() เพราะ currentSong.id ไม่เปลี่ยน → useEffect ไม่รัน
        if (rm === "one" || (rm === "all" && queueLengthRef.current <= 1)) {
          playerRef.current?.seekTo(0).catch(() => {}); // กลับไปจุดเริ่ม
          playerRef.current?.play();                     // เริ่มเล่นใหม่
          dispatch(setProgress(0));                      // reset progress bar
          return; // หยุดไม่ให้ทำงาน logic อื่น
        }

        // ถ้า autoPlay ปิด → แค่หยุดเล่น ไม่ข้ามเพลง
        if (!autoPlayRef.current) {
          dispatch(togglePlay()); // สลับเป็น pause state
        } else if (isPremiumRef.current) {
          // ผู้ใช้ Premium → ข้ามไปเพลงถัดไปได้เลยโดยไม่มีโฆษณา
          dispatch(nextSong());
        } else {
          // Free user → สุ่มแสดงโฆษณาหลัง 1, 2 หรือ 3 เพลง
          songsPlayedRef.current += 1; // นับเพลงที่เล่นผ่านไปแล้ว
          if (songsPlayedRef.current >= adTargetRef.current) {
            // ถึงเป้าหมาย → reset counter และสุ่มเป้าใหม่
            songsPlayedRef.current = 0;
            adTargetRef.current = Math.floor(Math.random() * 3) + 1; // สุ่มใหม่ 1-3
            // dispatch thunk ที่จะพยายามโหลดและแสดงโฆษณา
            dispatch(showAfterSongAd()).then((result: any) => {
              // ถ้าไม่มีโฆษณาให้แสดง (payload = false) ก็ข้ามเพลงต่อได้เลย
              if (!result.payload) dispatch(nextSong());
            });
          } else {
            // ยังไม่ถึงเป้าหมาย → ข้ามเพลงถัดไปได้เลย
            dispatch(nextSong());
          }
        }
      }
    });

    // cleanup: ยกเลิก subscription และทำลาย player เมื่อ currentSong เปลี่ยนหรือ unmount
    return () => {
      subscription.remove(); // ยกเลิก event listener ก่อน
      // ล้าง lock screen controls ถ้า API นี้มี
      if (typeof player.clearLockScreenControls === "function") {
        player.clearLockScreenControls();
      }
      player.pause();          // หยุดเสียง
      player.remove();         // release native resource
      playerRef.current = null; // reset ref
    };
  }, [currentSong?.id, reloadCount]); // รันเมื่อเพลงเปลี่ยน หรือเมื่อ reload ถูก bump (เช่น หลัง ad)

  // ── Play / Pause ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // ถ้ายังไม่มี player ไม่ต้องทำอะไร (เช่น ก่อนโหลดเพลงแรก)
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.play();  // สั่งเล่นเมื่อ Redux state เป็น playing
    } else {
      playerRef.current.pause(); // สั่งหยุดเมื่อ Redux state เป็น paused
    }
  }, [isPlaying]); // รันเฉพาะเมื่อ isPlaying เปลี่ยน

  // ── Volume ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // ปรับ volume ของ player ทันทีเมื่อผู้ใช้เลื่อน slider
    if (playerRef.current) {
      playerRef.current.volume = volume; // volume เป็นค่า 0.0-1.0
    }
  }, [volume]); // รันเฉพาะเมื่อ volume เปลี่ยน

  // ── Seek (expo-audio ใช้ seconds) ─────────────────────────────────────────────
  useEffect(() => {
    // ถ้าไม่มี seek request ให้ข้ามไป
    if (seekRequest === null) return;
    // seek ไปยังตำแหน่งที่ร้องขอ (หน่วยเป็นวินาที)
    playerRef.current?.seekTo(seekRequest).catch(() => {});
    // ล้าง seek request ออกจาก Redux เพื่อป้องกัน seek ซ้ำ
    dispatch(clearSeekRequest());
  }, [seekRequest]); // รันเมื่อมี seek request ใหม่

  // Component นี้ไม่ render UI — return null เสมอ
  return null;
}
