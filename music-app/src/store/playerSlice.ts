// Redux slice จัดการการเล่นเพลง — state: currentSong, queue, progress, duration, shuffle, repeat, volume | actions: playSong, nextSong, prevSong, seekTo, togglePlay, toggleShuffle, cycleRepeat, addToQueue, removeFromQueue, moveQueueItem, stopSong, bumpReload
//
// หลักการทำงาน:
// 1. playSong: ตั้ง currentSong, queue, index, reset progress → isPlaying=true
// 2. nextSong: ตรวจ shuffle→สุ่ม, repeat:one→index เดิม, repeat:all→วนกลับ 0, else→index+1 หรือหยุด
// 3. prevSong: ถ้า progress>3 วิ → seekTo(0) restart, ถ้าไม่ → index-1 (wrap ไปท้ายคิว)
// 4. seekTo: ตั้ง seekRequest (AudioController อ่าน) + อัปเดต progressSeconds ทันที (responsive UI)
// 5. bumpReload: เพิ่ม reloadCount → AudioController ทำลาย+สร้าง player ใหม่ (ใช้หลังโฆษณาจบ)
// 6. logout: extraReducer reset ทั้ง slice กลับเป็น initialState

// นำเข้า createSlice สำหรับสร้าง Redux slice และ PayloadAction สำหรับ type ของ action payload
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// นำเข้า type Song จาก homeApi เพื่อใช้เป็น type ของเพลงใน queue และ currentSong
import { Song } from "../api/homeApi";
// นำเข้า logoutThunk เพื่อ reset state ของ player เมื่อ logout
import { logoutThunk } from "./authSlice";

// กำหนด interface สำหรับ state ของ player ทั้งหมด
interface PlayerState {
  currentSong: Song | null;       // เพลงที่กำลังเล่นอยู่ตอนนี้ (null = ยังไม่มีเพลง)
  queue: Song[];                  // รายการคิวเพลงทั้งหมดที่รอเล่น
  currentIndex: number;           // ตำแหน่ง index ของเพลงปัจจุบันใน queue
  isPlaying: boolean;             // true = กำลังเล่น, false = หยุดชั่วคราว
  progressSeconds: number;        // ตำแหน่งปัจจุบันของเพลง (วินาที) — อัปเดตจาก AudioController
  durationSeconds: number;        // ความยาวเพลงจริงจาก audio element (AudioController อัปเดต)
  seekRequest: number | null;     // เมื่อผู้ใช้ seek → AudioController จะ seek แล้ว clear
  isShuffle: boolean;             // true = เล่นแบบสุ่มลำดับ
  repeatMode: "none" | "all" | "one"; // โหมดการวนซ้ำ: none=ไม่วน, all=วนทั้งคิว, one=วนเพลงเดิม
  volume: number;                 // ระดับเสียง ช่วง 0.0 – 1.0
  reloadCount: number;            // เพิ่มขึ้นทุกครั้งที่ต้องการ force reload player (เช่น หลังโฆษณา)
}

// กำหนดค่าเริ่มต้นของ state ก่อนที่ผู้ใช้จะเริ่มเล่นเพลง
const initialState: PlayerState = {
  currentSong: null,      // ยังไม่มีเพลง
  queue: [],              // คิวว่าง
  currentIndex: 0,        // เริ่มที่ตำแหน่งแรก
  isPlaying: false,       // ยังไม่ได้เล่น
  progressSeconds: 0,     // อยู่ที่จุดเริ่มต้น
  durationSeconds: 0,     // ยังไม่รู้ความยาว
  seekRequest: null,      // ไม่มีคำขอ seek
  isShuffle: false,       // ปิด shuffle
  repeatMode: "none",     // ไม่วนซ้ำ
  volume: 1.0,            // เสียงสูงสุด
  reloadCount: 0,         // ยังไม่เคย reload
};

// สร้าง slice ชื่อ "player" ซึ่งจะกลายเป็น state.player ใน Redux store
const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    // action: เล่นเพลงที่ระบุ พร้อมกำหนด queue และ index ปัจจุบัน
    playSong(state, action: PayloadAction<{ song: Song; queue?: Song[]; index?: number }>) {
      const { song, queue, index } = action.payload;
      state.currentSong = song;                        // ตั้งเพลงปัจจุบัน
      state.queue = queue ?? [song];                   // ถ้าไม่มี queue ให้ใช้เพลงเดี่ยวเป็น queue
      state.currentIndex = index ?? 0;                 // ถ้าไม่ระบุ index ให้เริ่มที่ 0
      state.isPlaying = true;                          // เริ่มเล่นทันที
      state.progressSeconds = 0;                       // reset ตำแหน่งไปที่ต้น
      state.durationSeconds = song.duration ?? 0;      // ใช้ duration จาก metadata ถ้ามี
      state.seekRequest = null;                        // ล้าง seek request เก่า
    },

    // action: toggle play/pause — ถ้ากำลังเล่นอยู่ให้หยุด ถ้าหยุดอยู่ให้เล่น
    togglePlay(state) {
      state.isPlaying = !state.isPlaying;
    },

    // action: ข้ามไปเพลงถัดไปตามโหมด shuffle/repeat
    nextSong(state) {
      // ถ้าคิวว่างเปล่าไม่ต้องทำอะไร
      if (state.queue.length === 0) return;
      let next: number;
      if (state.isShuffle) {
        // โหมดสุ่ม: สุ่มตำแหน่งใหม่แบบ random
        next = Math.floor(Math.random() * state.queue.length);
      } else if (state.repeatMode === "one") {
        // วนซ้ำเพลงเดิม: index ไม่เปลี่ยน
        next = state.currentIndex;
      } else {
        // เล่นตามลำดับ: บวก 1
        next = state.currentIndex + 1;
        if (next >= state.queue.length) {
          if (state.repeatMode === "all") {
            // วนกลับไปเพลงแรกเมื่อเล่นครบคิว
            next = 0;
          } else {
            // ไม่วนซ้ำ: หยุดเล่นเมื่อเล่นครบ
            state.isPlaying = false;
            return;
          }
        }
      }
      // อัปเดต state ไปที่เพลงถัดไป
      state.currentIndex = next;
      state.currentSong = state.queue[next];
      state.progressSeconds = 0;                          // reset ตำแหน่งไปต้นเพลง
      state.durationSeconds = state.queue[next].duration ?? 0; // อัปเดต duration
      state.seekRequest = null;                           // ล้าง seek request
      state.isPlaying = true;                             // เล่นต่อ
    },

    // action: ย้อนกลับไปเพลงก่อนหน้า หรือ restart เพลงปัจจุบันถ้าเล่นไปแล้วเกิน 3 วินาที
    prevSong(state) {
      // ถ้าคิวว่างเปล่าไม่ต้องทำอะไร
      if (state.queue.length === 0) return;
      if (state.progressSeconds > 3) {
        // เล่นไปแล้วเกิน 3 วินาที → restart เพลงเดิมแทนการย้อนไปเพลงก่อน
        state.seekRequest = 0;       // ส่ง seek ไปที่ 0
        state.progressSeconds = 0;   // reset progress
        return;
      }
      // คำนวณ index ก่อนหน้า ถ้า index = 0 ให้วนไปเพลงสุดท้ายของคิว
      let prev = state.currentIndex - 1;
      if (prev < 0) prev = state.queue.length - 1;
      // อัปเดต state ไปที่เพลงก่อนหน้า
      state.currentIndex = prev;
      state.currentSong = state.queue[prev];
      state.progressSeconds = 0;
      state.durationSeconds = state.queue[prev].duration ?? 0;
      state.seekRequest = null;
      state.isPlaying = true;
    },

    // AudioController เรียกเพื่ออัปเดต progress จาก audio จริง
    setProgress(state, action: PayloadAction<number>) {
      // ป้องกันค่าติดลบ — ต้องไม่น้อยกว่า 0
      state.progressSeconds = Math.max(0, action.payload);
    },

    // AudioController เรียกเพื่ออัปเดต duration จาก audio จริง
    setDuration(state, action: PayloadAction<number>) {
      state.durationSeconds = action.payload;
    },

    // ผู้ใช้ seek → AudioController จะอ่าน seekRequest แล้ว seek ไฟล์จริง
    seekTo(state, action: PayloadAction<number>) {
      state.seekRequest = action.payload;      // บอก AudioController ว่าต้อง seek ไปตำแหน่งนี้
      state.progressSeconds = action.payload;  // อัปเดต UI ทันทีโดยไม่รอ AudioController
    },

    // AudioController เรียกหลัง seek เสร็จเพื่อล้าง request — ป้องกัน seek ซ้ำ
    clearSeekRequest(state) {
      state.seekRequest = null;
    },

    // action: สลับเปิด/ปิด shuffle mode
    toggleShuffle(state) {
      state.isShuffle = !state.isShuffle;
    },

    // action: ตั้งระดับเสียง — clamp ให้อยู่ในช่วง 0.0–1.0 เสมอ
    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },

    // action: วนเปลี่ยนโหมดวนซ้ำ none → all → one → none → ...
    cycleRepeat(state) {
      const modes: Array<"none" | "all" | "one"> = ["none", "all", "one"];
      const idx = modes.indexOf(state.repeatMode); // หาตำแหน่งปัจจุบัน
      state.repeatMode = modes[(idx + 1) % modes.length]; // เลื่อนไปโหมดถัดไปแบบวนรอบ
    },

    // action: ตั้งโหมดวนซ้ำโดยตรงโดยไม่ต้องวน cycle
    setRepeatMode(state, action: PayloadAction<"none" | "all" | "one">) {
      state.repeatMode = action.payload;
    },

    // action: เพิ่มเพลงต่อท้ายคิว
    addToQueue(state, action: PayloadAction<Song>) {
      state.queue.push(action.payload);
    },

    // action: ลบเพลงออกจากคิวตาม index — ถ้าลบเพลงก่อน currentIndex ให้ปรับ index ด้วย
    removeFromQueue(state, action: PayloadAction<number>) {
      const idx = action.payload;
      state.queue.splice(idx, 1); // ลบเพลงออก
      if (idx < state.currentIndex) {
        // เพลงที่ลบอยู่ก่อนเพลงที่กำลังเล่น → index เลื่อนไป 1 ให้ปรับคืน
        state.currentIndex = Math.max(0, state.currentIndex - 1);
      }
    },

    // action: ย้ายเพลงในคิวจากตำแหน่ง from ไปตำแหน่ง to (drag & drop)
    moveQueueItem(state, action: PayloadAction<{ from: number; to: number }>) {
      const { from, to } = action.payload;
      // ตรวจสอบว่า index อยู่ในขอบเขตที่ถูกต้อง
      if (from < 0 || to < 0 || from >= state.queue.length || to >= state.queue.length) return;
      const [item] = state.queue.splice(from, 1); // ดึงเพลงออกจากตำแหน่งเดิม
      state.queue.splice(to, 0, item);            // แทรกเข้าตำแหน่งใหม่
    },

    // action: เซ็ตคิวเพลงทั้งหมดใหม่ (ใช้เมื่อ shuffle หรือ load playlist ใหม่)
    setQueue(state, action: PayloadAction<Song[]>) {
      state.queue = action.payload;
    },

    // action: หยุดเล่นและล้าง state ทั้งหมด (เช่น เมื่อปิด player)
    stopSong(state) {
      state.currentSong = null;      // ล้างเพลงปัจจุบัน
      state.isPlaying = false;       // หยุดเล่น
      state.progressSeconds = 0;     // reset ตำแหน่ง
      state.queue = [];              // ล้างคิว
      state.currentIndex = 0;        // reset index
    },

    // action: เพิ่ม reloadCount เพื่อบังคับให้ AudioController โหลด player ใหม่
    // ใช้หลังโฆษณาจบเพื่อให้เพลงกลับมาเล่นต่อได้อย่างถูกต้อง
    bumpReload(state) {
      state.reloadCount += 1;    // เพิ่ม counter เพื่อ trigger useEffect ใน AudioController
      state.isPlaying = true;    // บอกว่าต้องเล่นต่อหลัง reload
    },
  },
  extraReducers: (builder) => {
    // เมื่อ logout สำเร็จ → reset state ทั้งหมดกลับเป็น initialState เพื่อล้างข้อมูลเพลงของผู้ใช้
    builder.addCase(logoutThunk.fulfilled, () => initialState);
  },
});

// export action creators ทั้งหมดเพื่อให้ component และ thunk อื่นเรียกใช้ได้
export const {
  playSong,
  togglePlay,
  stopSong,
  nextSong,
  prevSong,
  setProgress,
  setDuration,
  seekTo,
  clearSeekRequest,
  setVolume,
  toggleShuffle,
  cycleRepeat,
  setRepeatMode,
  addToQueue,
  removeFromQueue,
  moveQueueItem,
  setQueue,
  bumpReload,
} = playerSlice.actions;

// export reducer เพื่อนำไปลงทะเบียนใน store
export default playerSlice.reducer;
