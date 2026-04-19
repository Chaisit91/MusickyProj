import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const ROOT = "c:/Users/msi/OneDrive/Documents/GitHub/MusickyProj";

// Map: file path → working principle comment block (ต่อจาก summary line แรก)
const PRINCIPLES = {

  // ─── music-app Components ─────────────────────────────────────────────────

  "music-app/src/Components/ads/BetweenSongAd.tsx": `//
// หลักการทำงาน:
// 1. ตรวจสอบ Redux state: adVisible=true + adContext="AFTER_SONG" + currentAd มีข้อมูล → แสดง Modal
// 2. เมื่อ visible: บันทึก impression, เริ่ม countdown timer (setInterval ลดทีละ 1 วิ), เริ่ม progress bar animation (Animated.timing)
// 3. ถ้า ad เป็นวิดีโอ (URL มี /video/upload/ หรือนามสกุล .mp4/.webm/.mov) → render AdVideo (useVideoPlayer)
// 4. เมื่อ timeLeft === 0: รอ 500ms แล้ว dispatch dismissAd + nextSong + bumpReload (โหลด player ใหม่)
// 5. ผู้ใช้กด chevron down: ปิด ad ทันทีโดย dismiss + router.back() (ไม่ข้ามเพลง)
// 6. กด ad image: Linking.openURL(linkUrl) เปิด URL โฆษณาใน browser ภายนอก
`,

  "music-app/src/Components/layout/Bottomnav.tsx": `//
// หลักการทำงาน:
// 1. render 3 tab buttons: Home, Search, Your Library แนวนอนด้านล่างหน้าจอ
// 2. แต่ละ TabButton ใช้ useSharedValue + useAnimatedStyle (Reanimated) สำหรับ animation
// 3. เมื่อ active เปลี่ยน: icon scale ขึ้น (withSpring), dot indicator ปรากฏ (withSpring + withTiming)
// 4. parent component ส่ง activeTab และ onTabPress มา — BottomNav ไม่จัดการ navigation เอง
`,

  "music-app/src/Components/layout/Topbar.tsx": `//
// หลักการทำงาน:
// 1. รับ props: username, avatarUrl, isPremium, unreadCount, callbacks ต่างๆ
// 2. แสดงโลโก้ "Musicky" + dot badge ด้านซ้าย
// 3. ปุ่ม Premium: สีต่างกันตาม isPremium (เขียว=มี, เข้ม=ยังไม่มี) → เรียก onPremiumPress
// 4. Bell icon: ถ้า unreadCount > 0 แสดง badge แดง (แสดง "9+" ถ้า >9) → เรียก onBellPress
// 5. Gear icon → onSettingsPress, Avatar circle → onAvatarPress
`,

  "music-app/src/Components/player/AudioController.tsx": `//
// หลักการทำงาน:
// 1. ใช้ try/catch require("expo-audio") เพื่อตรวจสอบว่า native module พร้อมหรือไม่
// 2. ถ้าพร้อม: โหลด AudioControllerImpl และเก็บไว้ใน Impl variable
// 3. ถ้าไม่พร้อม: แสดง console.warn และ Impl เป็น null
// 4. Component export: ถ้า Impl เป็น null → return null (ไม่ crash), ถ้าพร้อม → render Impl
// 5. pattern นี้ทำให้ app เปิดได้บน simulator ที่ยังไม่ได้ build native module
`,

  "music-app/src/Components/player/AudioControllerImpl.tsx": `//
// หลักการทำงาน:
// 1. mount: setAudioModeAsync (เล่นใน silent mode + background), restore skip count
// 2. เมื่อ currentSong เปลี่ยน หรือ reloadCount เพิ่ม: ทำลาย player เก่า → สร้าง player ใหม่จาก URI (local file หรือ remote URL)
// 3. subscribe playbackStatusUpdate: อัปเดต progress/duration ลง Redux ทุกครั้งที่ audio report
// 4. เมื่อ didJustFinish: ตรวจ repeatMode → repeat:one/all loop เพลงเดิม, autoPlay off หยุด, premium → nextSong ทันที
// 5. free user + เพลงจบ: นับ songsPlayed เทียบ adTarget (สุ่ม 1-3) → ถึงเป้า dispatch showAfterSongAd
// 6. play/pause, volume, seek: แต่ละอย่าง sync จาก Redux ผ่าน useEffect แยก dependency
// 7. cleanup: ทุก useEffect return cleanup function ที่ remove listener และ destroy player
`,

  "music-app/src/Components/player/MiniPlayer.tsx": `//
// หลักการทำงาน:
// 1. ถ้า currentSong เป็น null → return null (ซ่อน component ทั้งหมด)
// 2. mount: slideY จาก 80→0 (spring) + opacity 0→1 (timing) พร้อมกัน
// 3. isPlaying เปลี่ยน: rotation หมุน 360° ใน 7 วิ linear repeat infinite (เล่น) หรือ cancelAnimation (หยุด)
// 4. isPlaying toggle: btnScale spring ลง 0.85 แล้วเด้งกลับ 1.0 (bounce feedback)
// 5. คำนวณ progress ratio (progressSeconds/duration) → แสดง progress bar แนวนอนด้านล่าง
// 6. กด body → router.push("/player"), กด play button (stopPropagation) → dispatch togglePlay
// 7. กด close (stopPropagation) → dispatch stopSong ซ่อน MiniPlayer
`,

  "music-app/src/Components/player/SyncedLyrics.tsx": `//
// หลักการทำงาน:
// 1. parse lyrics ด้วย parseLRC (ตาม timestamp [mm:ss.xx]) → ถ้าไม่มี timestamp ใช้ parsePlainText (แบ่งเวลาเท่าๆกัน)
// 2. useMemo คำนวณ currentIndex ตาม progressSeconds: หา index สุดท้ายที่ line.time <= progress
// 3. สถานะแต่ละบรรทัด: current/past/future → กำหนด opacity, scale, font-size, color ต่างกัน
// 4. Animated.parallel: animate opacity + scale เมื่อ status เปลี่ยน (350ms)
// 5. useEffect auto-scroll: เมื่อ currentIndex เปลี่ยน → scrollRef.scrollTo ให้บรรทัดปัจจุบันอยู่ที่ 35% จากบน
// 6. กดบรรทัด: เรียก onSeek(line.time) ให้ AudioController seek ไปยังเวลานั้น
`,

  "music-app/src/Components/ui/AddToPlaylistSheet.tsx": `//
// หลักการทำงาน:
// 1. ถ้า song prop เป็น null → return null (sheet ไม่แสดง)
// 2. render Modal slide-up จากด้านล่าง, กด backdrop → onClose
// 3. แสดงรายการ playlist ที่มีอยู่ทั้งหมด, ถ้า song อยู่ใน playlist แล้ว → แสดง check icon
// 4. กด playlist row: ตรวจว่าเพลงอยู่ใน playlist หรือยัง → dispatch removeSongFromPlaylistThunk หรือ addSongToPlaylistThunk
// 5. กด "New playlist" → แสดง NewPlaylistForm (react-hook-form + zod)
// 6. NewPlaylistForm submit: dispatch createPlaylistThunk แล้ว dispatch addSongToPlaylistThunk เพิ่มเพลงทันที
`,

  "music-app/src/Components/ui/Categorycontent.tsx": `//
// หลักการทำงาน:
// 1. รับ category ปัจจุบัน (For you/Relax/Workout/Travel/Party) และข้อมูลต่างๆ จาก home screen
// 2. กรองเพลงตาม CATEGORY_KEYWORDS โดยจับคู่กับ genre.name (case-insensitive)
// 3. กรองศิลปินที่ follow และ artist จากเพลงที่กรองแล้ว เพื่อแสดงเฉพาะที่เกี่ยวข้อง
// 4. render section ต่างๆ: Featuring Today (BannerCard), Recently Played (RecentCard), Mixes (MixCard), Artists, New Releases, Playlists
// 5. แต่ละ card เป็น horizontal scroll — กด navigate ไปหน้าเพลง/ศิลปิน/แนวเพลง หรือเรียก onSongPress
`,

  "music-app/src/Components/ui/ErrorBoundary.tsx": `//
// หลักการทำงาน:
// 1. Class component ที่ implement getDerivedStateFromError: เมื่อ child โยน error → ตั้ง hasError=true
// 2. componentDidCatch: log error ไปยัง console (สามารถ extend ส่ง Sentry ได้)
// 3. render: ถ้า hasError → แสดง fallback UI (หรือ custom fallback จาก props)
// 4. ปุ่ม retry: reset state hasError=false ให้ React พยายาม render children ใหม่
`,

  "music-app/src/Components/ui/FadeInView.tsx": `//
// หลักการทำงาน:
// 1. ใช้ useSharedValue สำหรับ opacity (เริ่มที่ 0) และ translateY (เริ่มที่ fromY)
// 2. useEffect mount: ถ้ามี delay → setTimeout แล้วค่อย animate, ไม่มี delay → animate ทันที
// 3. animate opacity 0→1 และ translateY fromY→0 พร้อมกันด้วย withTiming (Easing.out.quad)
// 4. useAnimatedStyle ส่ง style ที่ประกอบ opacity + translateY ให้ Animated.View
`,

  "music-app/src/Components/ui/FormInput.tsx": `//
// หลักการทำงาน:
// 1. ใช้ Controller จาก react-hook-form เพื่อ bind TextInput เข้ากับ form control
// 2. prop error: ถ้ามี → เปลี่ยน borderColor เป็นแดง + แสดง error message ด้านล่าง
// 3. รองรับ generic type T extends FieldValues เพื่อ type-safe กับ form schema ใดก็ได้
`,

  "music-app/src/Components/ui/FormPasswordInput.tsx": `//
// หลักการทำงาน:
// 1. เหมือน FormInput แต่มี state show (boolean) ควบคุม secureTextEntry
// 2. ปุ่ม eye icon ขวาใน input: toggle show → เปลี่ยน icon ระหว่าง eye open/closed
// 3. เมื่อ show=false → secureTextEntry=true (ซ่อนตัวอักษร), show=true → แสดง
`,

  "music-app/src/Components/ui/OfflineBanner.tsx": `//
// หลักการทำงาน:
// 1. useEffect mount: subscribe NetInfo.addEventListener → dispatch setOnline(isConnected) ทุกครั้ง network เปลี่ยน
// 2. useEffect isOnline เปลี่ยน:
//    - offline (isOnline=false): setVisible=true, spring translateY 0→0 (slide in จาก -60)
//    - กลับมา online (isOnline=true, visible=true): spring slide in แสดง "กลับมาแล้ว" → setTimeout 1.5 วิ → timing slide out → setVisible=false
// 3. ถ้า visible=false → return null (ไม่ render)
// 4. สีพื้นหลัง: แดง=offline, เขียว=online
`,

  "music-app/src/Components/ui/icons/index.tsx": `//
// หลักการทำงาน:
// 1. รวม SVG icon components ทั้งหมดไว้ที่เดียว
// 2. แต่ละ icon รับ props: size, color (หรือ filled/active สำหรับ icon ที่มีสถานะ)
// 3. ใช้ react-native-svg Svg + Path/Circle เพื่อ render vector icon ที่คมชัดทุกขนาด
// 4. export เป็น named exports เพื่อให้ import ได้เฉพาะตัวที่ต้องการ (tree-shaking)
`,

  // ─── music-app API ──────────────────────────────────────────────────────────

  "music-app/src/api/adsApi.ts": `//
// หลักการทำงาน:
// 1. fetchAdByType(type): GET /ads/active?type=TYPE → คืน Ad หรือ null ถ้าไม่มี
// 2. fetchAnyActiveAd(): GET /ads/active (ไม่ filter type) → ใช้เป็น fallback เมื่อไม่มี ad ตาม type ที่ต้องการ
// 3. recordImpressionApi(id): POST /ads/:id/impression → บันทึกว่า user เห็น ad แล้ว สำหรับ analytics
`,

  "music-app/src/api/apiClient.ts": `//
// หลักการทำงาน:
// 1. สร้าง axios instance พร้อม baseURL, timeout 12s, Content-Type JSON
// 2. Request interceptor: ตรวจ cachedToken ใน memory → ถ้าไม่มี ดึงจาก AsyncStorage → แนบ Authorization header
// 3. Response interceptor - 401 handling:
//    - ถ้ากำลัง refresh: เพิ่ม request เข้าคิว (pendingQueue) รอ token ใหม่
//    - ถ้ายังไม่ refresh: ดึง refreshToken จาก AsyncStorage → POST /auth/refresh → อัปเดต token → retry request เดิม + flush queue
//    - ถ้า refresh ล้มเหลว: flush queue ด้วย error, ล้าง token, ลบ AsyncStorage keys
// 4. Timeout retry: ถ้า error code ECONNABORTED → รอ 800ms → retry ครั้งเดียว
`,

  "music-app/src/api/authApi.ts": `//
// หลักการทำงาน:
// 1. registerApi: POST /auth/register → backend คืน tokens ทันที (auto-login)
// 2. loginApi: POST /auth/login → คืน accessToken, refreshToken, user
// 3. googleLoginApi: POST /auth/google → ถ้า requiresName=true ต้องตั้งชื่อก่อน (Google login ครั้งแรก)
// 4. fetchMeApi: GET /auth/me → ตรวจสอบ session + ดึง user ล่าสุด (ใช้หลัง restore session)
// 5. updateProfileApi: PATCH /auth/profile ด้วย multipart/form-data (รองรับ upload รูป avatar)
// 6. logoutApi: POST /auth/logout → invalidate refresh token ฝั่ง server
`,

  "music-app/src/api/detailApi.ts": `//
// หลักการทำงาน:
// 1. getArtistSongs(artistId): GET /songs?artistId=&limit=50 → เพลงของศิลปินคนนั้น
// 2. getAlbumSongs(albumId): GET /songs?albumId=&limit=50 → เพลงในอัลบั้มนั้น
// 3. getGenreSongs(genreId): GET /songs?genreId=&limit=50 → เพลงในแนวเพลงนั้น
// 4. ทุก function ใช้ query param filter ที่ endpoint เดียวกัน (/songs) ต่างกันแค่ parameter
`,

  "music-app/src/api/homeApi.ts": `//
// หลักการทำงาน:
// 1. getFeaturingSongs: GET /songs/trending?limit=10 → เพลง trending 10 อันดับ
// 2. getRecentlyPlayed/getAllPlayHistory: GET /play-history → ประวัติการเล่น
// 3. recordPlay: POST /play-history → บันทึกเมื่อเล่นเพลง (เพิ่ม play count + history)
// 4. getCategorySongs: รับ array genreIds → Promise.allSettled fetch ทุก genre พร้อมกัน → deduplicate ด้วย Set
// 5. Liked Songs API: GET/POST/DELETE /liked-songs → toggle like เพลง
// 6. Follow Artist API: GET/POST/DELETE /artist-follows → toggle follow ศิลปิน
// 7. Downloads API: GET/POST/DELETE /downloads → จัดการรายการดาวน์โหลด (ฝั่ง server record)
// 8. getSongLyricsApi: GET /songs/:id/lyrics → คืน string lyrics หรือ null
`,

  "music-app/src/api/notificationsApi.ts": `//
// หลักการทำงาน:
// 1. getNotificationsApi: GET /notifications → รายการ notification ทั้งหมดของ user
// 2. markReadApi: PATCH /notifications/:id/read → mark notification เดียวว่าอ่านแล้ว
// 3. markAllReadApi: PATCH /notifications/read-all → mark ทั้งหมดว่าอ่านแล้วในครั้งเดียว
`,

  "music-app/src/api/paymentApi.ts": `//
// หลักการทำงาน:
// 1. submitPaymentApi: POST /payments ด้วย multipart/form-data รองรับ slip upload (QR_CODE/BANK_TRANSFER)
// 2. getMyTransactionsApi: GET /payments/my → ประวัติการชำระเงินของ user คนนั้น
// 3. cancelPremiumApi: DELETE /payments/cancel → ยกเลิก premium, validateStatus <500 เพื่อรับ error detail กลับมาด้วย
`,

  "music-app/src/api/playlistApi.ts": `//
// หลักการทำงาน:
// 1. getPlaylistsApi: GET /playlists → playlist ทั้งหมดของ user พร้อม songs ข้างใน
// 2. createPlaylistApi(title): POST /playlists → สร้าง playlist ใหม่
// 3. deletePlaylistApi(id): DELETE /playlists/:id → ลบ playlist (cascade ลบ songs ใน playlist ด้วย)
// 4. addSongToPlaylistApi: POST /playlists/:id/songs → เพิ่มเพลงเข้า playlist
// 5. removeSongFromPlaylistApi: DELETE /playlists/:id/songs/:songId → ลบเพลงออก
`,

  "music-app/src/api/preferencesApi.ts": `//
// หลักการทำงาน:
// 1. getPreferencesApi: GET /users/me/preferences → ดึง preferences ของ user ที่ login อยู่
// 2. updatePreferencesApi: PUT /users/me/preferences → อัปเดต preferences ทั้งชุด (Partial input)
// 3. ทั้งคู่ใช้ apiClient ที่มี interceptor แนบ token อัตโนมัติ
`,

  "music-app/src/api/searchApi.ts": `//
// หลักการทำงาน:
// 1. searchAll: GET /search?q= พร้อม custom serializer encode ภาษาไทย → merge ศิลปินจากเพลงที่ชื่อตรงด้วย
// 2. searchByLyrics: GET /search/lyrics?q= → ส่งให้ AI ค้นหา → คืน LyricsSearchResult พร้อม aiUsed:true
// 3. getTrendingArtists: GET /songs/trending?limit=20 → แยก artist unique จากเพลง → slice 10 อันดับ
// 4. getBrowseGenres: GET /genres → ทุก genre สำหรับหน้า Browse
// 5. Search History API: GET/POST/DELETE /search/history/items → จัดการประวัติการค้นหา
`,

  // ─── music-app Store ────────────────────────────────────────────────────────

  "music-app/src/store/authSlice.ts": `//
// หลักการทำงาน:
// 1. restoreSession (เรียกตอนแอปเปิด): อ่าน token+user จาก AsyncStorage → setCachedToken → fetchMeApi sync user ล่าสุด → คืน session หรือ null
// 2. loginThunk: เรียก loginApi → บันทึก token ลง AsyncStorage + cachedToken → คืน user+token
// 3. logoutThunk: เรียก logoutApi (best-effort) → setCachedToken(null) → ลบ AsyncStorage ทั้ง 3 key
// 4. extraReducers: restoreSession.fulfilled ตั้ง isLoggedIn=true + ปิด isLoading, login.fulfilled เก็บ user+token, logout.fulfilled ล้าง state ทั้งหมด
// 5. isLoading เริ่มที่ true เพื่อบล็อก UI ขณะ restore session — ปิดทั้ง fulfilled+rejected
`,

  "music-app/src/store/playerSlice.ts": `//
// หลักการทำงาน:
// 1. playSong: ตั้ง currentSong, queue, index, reset progress → isPlaying=true
// 2. nextSong: ตรวจ shuffle→สุ่ม, repeat:one→index เดิม, repeat:all→วนกลับ 0, else→index+1 หรือหยุด
// 3. prevSong: ถ้า progress>3 วิ → seekTo(0) restart, ถ้าไม่ → index-1 (wrap ไปท้ายคิว)
// 4. seekTo: ตั้ง seekRequest (AudioController อ่าน) + อัปเดต progressSeconds ทันที (responsive UI)
// 5. bumpReload: เพิ่ม reloadCount → AudioController ทำลาย+สร้าง player ใหม่ (ใช้หลังโฆษณาจบ)
// 6. logout: extraReducer reset ทั้ง slice กลับเป็น initialState
`,

  "music-app/src/store/librarySlice.ts": `//
// หลักการทำงาน:
// 1. loadLibrary: Promise.allSettled fetch liked/downloaded/playlists/followed พร้อมกัน → ใช้เฉพาะที่ fulfilled
// 2. toggleLikeSong (optimistic): pending → เปลี่ยน UI ทันที, rejected → revert กลับ
// 3. toggleDownload: ดาวน์โหลด MP3 ด้วย File.downloadFileAsync (expo-file-system) หรือลบไฟล์ถ้ามีแล้ว + sync backend
// 4. toggleFollowArtist (optimistic): เหมือน toggleLikeSong
// 5. Playlist thunks: CRUD playlist + add/remove song → อัปเดต state ทันทีหลัง API ตอบ
// 6. getLocalAudioFile: คืน File object ชี้ไปที่ /downloads/{songId}.mp3 ใช้โดย AudioController
`,

  "music-app/src/store/adsSlice.ts": `//
// หลักการทำงาน:
// 1. loginThunk.fulfilled: ถ้า user ไม่ใช่ premium → ตั้ง showingPreHomeAd=true (บล็อก AuthGuard ก่อน navigate)
// 2. showSplashAd thunk: fetch SPLASH ad → ถ้ามี ตั้ง currentAd + adVisible + adContext="SPLASH"
// 3. showAfterSongAd thunk: fetch AFTER_SONG/AFTER_MULTIPLE ad → ถ้ามี ตั้ง state เพื่อแสดง BetweenSongAd
// 4. dismissAd: ล้าง adVisible + currentAd + adContext
// 5. showingPreHomeAd: flag ป้องกัน AuthGuard redirect ก่อนโฆษณา SPLASH แสดงเสร็จ
`,

  "music-app/src/store/skipSlice.ts": `//
// หลักการทำงาน:
// 1. restoreSkips (เรียกตอนเปิดแอป): อ่านจาก AsyncStorage → ตรวจ resetAt ถ้าเลย 24 ชม. reset → คืนค่า
// 2. consumeSkip: ตรวจว่าหมดรอบ 24 ชม.ยัง → ถ้าหมดให้ reset → เพิ่ม skipsUsed ถ้ายังไม่เต็ม MAX_SKIPS
// 3. ตั้ง resetAt ตอนใช้ครั้งแรกของรอบ (resetAt===0) → บันทึกลง AsyncStorage
// 4. limit ผูกกับอุปกรณ์ ไม่ reset เมื่อ logout (intentional design)
`,

  "music-app/src/store/notificationsSlice.ts": `//
// หลักการทำงาน:
// 1. fetchNotifications thunk: GET /notifications → เก็บ items[] ลง state
// 2. markNotificationRead thunk: PATCH /notifications/:id/read → อัปเดต item.isRead=true ใน state
// 3. markAllNotificationsRead thunk: PATCH /notifications/read-all → forEach item.isRead=true
// 4. state.isLoading ใช้แสดง spinner, state.error ใช้แสดงข้อความ error
`,

  "music-app/src/store/preferencesSlice.ts": `//
// หลักการทำงาน:
// 1. loadPreferences (เรียกหลัง login): GET /users/me/preferences → เก็บใน state + sync ลง AsyncStorage
// 2. savePreferences: PUT /users/me/preferences (Partial) → อัปเดต state + sync AsyncStorage
// 3. setPreferenceLocal: อัปเดต state ทันที (optimistic) ก่อน API ตอบ ใช้คู่กับ savePreferences
// 4. logout: reset กลับ DEFAULT values + isLoaded=false
`,

  "music-app/src/store/networkSlice.ts": `//
// หลักการทำงาน:
// 1. state.isOnline เริ่มต้น true
// 2. setOnline(boolean) action: อัปเดต isOnline ตาม NetInfo event ที่ OfflineBanner component subscribe
// 3. slice นี้ไม่มี async thunk — เป็น simple flag ที่ component อ่านเพื่อตัดสิน behavior
`,

  "music-app/src/store/hooks.ts": `//
// หลักการทำงาน:
// 1. export useAppDispatch = useDispatch.withTypes<AppDispatch>() → dispatch พร้อม type thunk
// 2. export useAppSelector = useSelector.withTypes<RootState>() → selector พร้อม type ทุก slice
// 3. ใช้แทน useDispatch/useSelector ทั่วแอปเพื่อให้ TypeScript รู้ type โดยไม่ต้อง cast
`,

  "music-app/src/store/store.ts": `//
// หลักการทำงาน:
// 1. configureStore รวม reducer ทั้งหมด 8 slice: auth, player, library, preferences, notifications, ads, network, skip
// 2. export RootState = ReturnType<typeof store.getState> → type ของ state ทั้งหมด
// 3. export AppDispatch = typeof store.dispatch → type ที่รองรับ async thunk
`,

  // ─── music-app App Screens ──────────────────────────────────────────────────

  "music-app/src/app/_layout.tsx": `//
// หลักการทำงาน:
// 1. RootLayout: ครอบ ErrorBoundary → GestureHandlerRootView → Redux Provider → RootLayoutNav
// 2. RootLayoutNav mount: dispatch restoreSkips, restoreSession → ถ้ามี session dispatch loadPreferences
// 3. AppState listener (เฉพาะตอน login): เมื่อ app กลับ foreground dispatch fetchMeThunk → sync premium status
// 4. AuthGuard: ดู isLoggedIn + isLoading + segments + showingPreHomeAd → redirect login หรือ home
//    - login แล้ว + public route + !showingPreHomeAd → replace("/home")
//    - ยังไม่ login + protected route → replace("/login")
// 5. AudioController + BetweenSongAd + OfflineBanner วางใน root ทำงานตลอดทุกหน้า
`,

  "music-app/src/app/index.tsx": `//
// หลักการทำงาน:
// 1. AuthGuard ใน _layout.tsx จะ redirect ผู้ใช้ที่ login แล้วออกจากหน้านี้ไป /home อัตโนมัติ
// 2. ถ้าไม่ได้ login: แสดง logo animation (stagger: logo→tagline→buttons) และปุ่ม Register/Login
// 3. Animation: Animated.stagger 180ms → fade + slide-up ทีละส่วน
`,

  "music-app/src/app/(auth)/login.tsx": `//
// หลักการทำงาน:
// 1. react-hook-form + zodResolver(loginSchema) validate email/password
// 2. onSubmit: dispatch loginThunk → ถ้า rejected แสดง error บน field, ถ้า fulfilled:
//    - dispatch loadPreferences
//    - ถ้า user ไม่ premium → router.replace("/home-ads") (ดู splash ad ก่อน)
//    - ถ้า premium → AuthGuard redirect ไป /home อัตโนมัติ
// 3. Animated.parallel: fade + slide-up เมื่อ mount
`,

  "music-app/src/app/(auth)/register.tsx": `//
// หลักการทำงาน:
// 1. react-hook-form + zodResolver(registerSchema) validate ชื่อ, email, รหัสผ่าน, ยืนยันรหัสผ่าน
// 2. useWatch("password") → PasswordStrength component คำนวณความแข็งแกร่ง real-time
// 3. onSubmit: dispatch registerThunk → ถ้าสำเร็จ router.replace("/login") ให้ login เอง
// 4. ถ้า error มีคำว่า "email"/"already" → setError บน email field (email ซ้ำ)
// 5. ปุ่ม "Fill test data": setValue ทุก field → ใช้สำหรับ dev testing
`,

  "music-app/src/app/(auth)/set-username.tsx": `//
// หลักการทำงาน:
// 1. รับ params จาก URL: accessToken, email, suggestedName, avatarUrl (ส่งมาจาก login Google หน้าแรก)
// 2. แสดง avatar (จาก URL หรือ initial letter) + email ของ user
// 3. useForm + zodResolver(setUsernameSchema) validate ชื่อ (2-50 ตัว)
// 4. handleConfirm: dispatch googleLoginThunk({ accessToken, name }) → fulfilled → AuthGuard redirect ไป home
`,

  "music-app/src/app/home-ads.tsx": `//
// หลักการทำงาน:
// 1. useEffect mount: dispatch showSplashAd → โหลด ad จาก server
// 2. showSplashAd fulfilled: ถ้าไม่มี ad → setShowingPreHomeAd(false) → AuthGuard redirect /home ทันที
// 3. ถ้ามี ad: แสดง countdown timer (setTimeout ลดทุก 1 วิ) → ปุ่ม Skip ปรากฏเมื่อ timeLeft===0
// 4. AdVideo component: useVideoPlayer play ทันที, subscribe "playToEnd" event → เรียก onEnd(handleSkip)
// 5. handleSkip: dispatch dismissAd + setShowingPreHomeAd(false) → router.replace("/home")
// 6. กด ad image: Linking.openURL(linkUrl) เปิด URL ใน browser
`,

  "music-app/src/app/(player)/player.tsx": `//
// หลักการทำงาน:
// 1. แสดง album art, ชื่อ/ศิลปิน, progress slider, controls, volume slider
// 2. Tab: PLAYER แสดง album art, LYRICS แสดง SyncedLyrics (โหลด lyrics จาก API เมื่อเปิด tab)
// 3. handleSkip (next direction):
//    - ตรวจ canSkip (skipsUsed < FREE_SKIP_LIMIT หรือ premium)
//    - ถ้าไม่ได้: แสดง toast "skip หมดแล้ว"
//    - free user: dispatch consumeSkip → dispatch showAfterSongAd → ถ้ามี ad return (BetweenSongAd จัดการ nextSong)
//    - ถ้าไม่มี ad หรือ premium: dispatch nextSong ทันที
// 4. Slider onSlidingComplete: dispatch seekTo(value) → AudioController seek
// 5. heart/download icon: dispatch toggleLikeSong/toggleDownload (optimistic)
// 6. "..." menu: แสดง AddToPlaylistSheet
`,

  "music-app/src/app/(player)/queue.tsx": `//
// หลักการทำงาน:
// 1. mount: ถ้า queue ว่าง → fetch /songs (สุ่ม 20 เพลง) → dispatch setQueue + playSong
// 2. แสดง Now Playing card + FlatList รายการเพลงที่เหลือใน queue
// 3. ปุ่มลูกศรขึ้น/ลง: dispatch moveQueueItem (เลื่อนเพลงใน queue)
// 4. กด เพลง: dispatch playSong เล่นทันที
// 5. กด trash: dispatch removeFromQueue ลบออกจาก queue
// 6. Repeat mode badge: cycleRepeat (none→all→one) แสดง icon ที่ด้านบน
`,

  "music-app/src/app/(main)/home.tsx": `//
// หลักการทำงาน:
// 1. useFocusEffect: โหลด data ทุกครั้งที่ screen ได้ focus (เพลง/แนวเพลง/ศิลปิน/recently played)
// 2. Tab bar category (For you/Relax/Workout/Travel/Party): เปลี่ยน CategoryContent ที่แสดง
// 3. กด category ที่ต้องใช้ mood songs → getCategorySongs ตาม genre keywords ที่ตรงกัน
// 4. กดเพลง: dispatch playSong พร้อม queue=เพลงทั้งหมดในหมวดนั้น → navigate ไปหน้า player
// 5. BottomNav, MiniPlayer, TopBar แสดงพร้อมกัน
// 6. pullRefresh: reload ข้อมูลทั้งหมด + dispatch loadLibrary
`,

  "music-app/src/app/(main)/search.tsx": `//
// หลักการทำงาน:
// 1. แสดง Trending Artists + Browse Genres เมื่อ input ว่าง (ก่อนค้นหา)
// 2. กดค้นหา: debounce 400ms → searchAll(query) → แสดงผล songs + artists
// 3. mic icon: toggle AI lyrics search mode → searchByLyrics (ส่งให้ AI วิเคราะห์เนื้อเพลง)
// 4. กด result item: บันทึกลง search history (addSearchHistoryItemApi) → navigate/เล่นเพลง
// 5. แสดง recent searches (SearchHistoryItem) เมื่อ query ว่าง — กด X ลบทีละอัน หรือ "clear all"
// 6. BottomNav + MiniPlayer แสดงตลอด
`,

  // ─── music-app Schema & Constants ─────────────────────────────────────────

  "music-app/src/schema/authSchema.ts": `//
// หลักการทำงาน:
// 1. กำหนด reusable field schemas: nameField, emailField (@gmail.com only), passwordField
// 2. registerSchema: รวมทุก field + refine ตรวจ password === confirmPassword
// 3. loginSchema: email + password เท่านั้น
// 4. export type ด้วย z.infer เพื่อใช้กับ react-hook-form โดยไม่ต้องกำหนด type แยก
// 5. schema อื่น: playlistSchema, setUsernameSchema, editProfileSchema, helpSupportSchema
`,

  "music-app/src/constants.ts": `//
// หลักการทำงาน:
// 1. FALLBACK_COLORS: array สี 8 สีสำหรับใช้เป็น fallback background เมื่อไม่มี album art
// 2. colorFor(i): คืนสีตาม index แบบ circular (i % FALLBACK_COLORS.length) ทำให้ทุก item มีสีไม่ซ้ำกัน
`,

  // ─── WebAdmin ──────────────────────────────────────────────────────────────

  "WebAdmin/src/App.tsx": `//
// หลักการทำงาน:
// 1. render AuthRouter ซึ่งกำหนด routes ทั้งหมดของ WebAdmin
// 2. ไม่มี logic เพิ่มเติม — App เป็นแค่ entry point wrapper
`,

  "WebAdmin/src/api/axios.ts": `//
// หลักการทำงาน:
// 1. สร้าง axios instance พร้อม withCredentials:true (ส่ง HttpOnly Cookie ทุก request)
// 2. Request interceptor: อ่าน accessToken จาก Redux store (memory) → แนบ Authorization header
// 3. Response interceptor - 401 handling (silent refresh):
//    - ถ้ากำลัง refresh: เพิ่ม request เข้า failedQueue
//    - ถ้ายังไม่ refresh: dispatch refreshTokenThunk → ถ้าสำเร็จ processQueue + retry request
//    - ถ้า refresh ล้มเหลว: processQueue(error), logout, redirect /login
// 4. token อยู่ใน memory (Redux) เท่านั้น, refresh token อยู่ใน HttpOnly Cookie (browser จัดการเอง)
`,

  "WebAdmin/src/api/authApi.ts": `//
// หลักการทำงาน:
// 1. adminLoginApi: POST /auth/admin/login → คืน accessToken, user (role ต้องเป็น ADMIN)
// 2. logoutApi: POST /auth/logout → backend clear HttpOnly Cookie
// 3. refreshApi: POST /auth/refresh → ใช้ HttpOnly Cookie ส่ง refresh token → คืน accessToken ใหม่
`,

  "WebAdmin/src/store/auth.store.ts": `//
// หลักการทำงาน:
// 1. initialState: อ่าน user จาก localStorage, accessToken เป็น null (ต้อง refresh เสมอ)
// 2. loginThunk: เรียก adminLoginApi → บันทึก user ลง localStorage + accessToken ใน memory
// 3. logoutThunk: เรียก logoutApi → ล้าง user+token ออกจาก state + localStorage
// 4. refreshTokenThunk: เรียก refreshApi ผ่าน HttpOnly Cookie → อัปเดต accessToken ใน memory
// 5. เมื่อ refresh ล้มเหลว: ล้าง state + localStorage ทั้งหมด (force re-login)
`,

  "WebAdmin/src/store/store.ts": `//
// หลักการทำงาน:
// 1. configureStore รวม auth reducer เพียงตัวเดียว (ข้อมูลอื่นดึง API โดยตรงผ่าน hooks)
// 2. export RootState, AppDispatch สำหรับ type-safe dispatch + selector
`,

  "WebAdmin/src/app/router/authRouter.tsx": `//
// หลักการทำงาน:
// 1. กำหนด routes ทั้งหมด: /login → AdminLogin, / + /dashboard/... → protected routes ครอบ AdminRoute
// 2. AdminRoute ตรวจ isAuthenticated + isAdmin ก่อนแสดง children — redirect /login ถ้าไม่ผ่าน
// 3. ProtectedRoute: ตรวจ isAuthenticated อย่างเดียว (ไม่ตรวจ role)
// 4. Sidebar + Outlet pattern: layout มี Sidebar ซ้าย, Outlet เปลี่ยนตาม route ขวา
`,

  "WebAdmin/src/guards/AdminRoute.tsx": `//
// หลักการทำงาน:
// 1. ใช้ useAuth hook ดึง isAuthenticated + isAdmin
// 2. ถ้าไม่ authenticated → Navigate to /login
// 3. ถ้า authenticated แต่ไม่ใช่ admin → Navigate to /forbidden
// 4. ถ้าผ่านทั้งคู่ → render children (หรือ Outlet)
`,

  "WebAdmin/src/guards/ProtectedRoute.tsx": `//
// หลักการทำงาน:
// 1. ตรวจ accessToken จาก Redux state — ถ้าไม่มี → Navigate to /login
// 2. ถ้ามี token → render children
// 3. ง่ายกว่า AdminRoute เพราะไม่ตรวจ role
`,

  "WebAdmin/src/hooks/useAuth.ts": `//
// หลักการทำงาน:
// 1. ดึง user, accessToken, loading, error จาก Redux auth state
// 2. logout function: dispatch logoutThunk → navigate /login
// 3. คำนวณ isAdmin (role==="ADMIN") และ isAuthenticated (มีทั้ง token + user)
// 4. ใช้โดย AdminRoute, Sidebar (แสดงชื่อ), AdminLogin
`,

  "WebAdmin/src/hooks/useAds.ts": `//
// หลักการทำงาน:
// 1. useState สำหรับ ads list, loading, error, modal states
// 2. fetchAds: GET /ads → โหลดรายการโฆษณาทั้งหมด
// 3. createAd/updateAd: POST/PUT /ads → บันทึกโฆษณาใหม่หรือแก้ไข (FormData สำหรับรูป/วิดีโอ)
// 4. deleteAd: DELETE /ads/:id → ลบและ refetch list
// 5. toggleActive: PATCH /ads/:id/toggle → สลับ isActive ของโฆษณา
`,

  "WebAdmin/src/hooks/useAlbums.ts": `//
// หลักการทำงาน:
// 1. fetchAlbums: GET /albums → โหลดอัลบั้มทั้งหมด
// 2. createAlbum/updateAlbum: POST/PUT /albums (FormData สำหรับ cover image)
// 3. deleteAlbum: DELETE /albums/:id → ลบและ refetch
// 4. จัดการ modal states: showCreate, showEdit, editTarget ภายใน hook
`,

  "WebAdmin/src/hooks/useArtists.ts": `//
// หลักการทำงาน:
// 1. fetchArtists: GET /artists → โหลดศิลปินทั้งหมด
// 2. createArtist/updateArtist: POST/PUT /artists (FormData สำหรับ image)
// 3. deleteArtist: DELETE /artists/:id
// 4. pagination: totalPages, currentPage state สำหรับ paginated artist list
`,

  "WebAdmin/src/hooks/useAudioPlayer.ts": `//
// หลักการทำงาน:
// 1. ใช้ HTMLAudioElement สร้าง audio player สำหรับเว็บ (ไม่ใช่ expo-audio)
// 2. play(url): โหลด src และ play audio
// 3. pause: หยุดเล่นชั่วคราว
// 4. ใช้ใน Songmanagement เพื่อ preview เพลงก่อน upload หรือหลัง upload
`,

  "WebAdmin/src/hooks/useDashboard.ts": `//
// หลักการทำงาน:
// 1. mount: fetch stats (GET /dashboard/stats), activities (GET /dashboard/recent), topSongs, growth
// 2. คืน object ที่มี stats, activities, topSongs, revenueData สำหรับ Dashboard component ใช้วาดกราฟ
// 3. revenueData แปลงเป็น format ที่ chart.js ต้องการ (labels + datasets)
`,

  "WebAdmin/src/hooks/useGenres.ts": `//
// หลักการทำงาน:
// 1. fetchGenres: GET /genres → รายการแนวเพลงทั้งหมด
// 2. createGenre/updateGenre: POST/PUT /genres (FormData สำหรับ image)
// 3. deleteGenre: DELETE /genres/:id
`,

  "WebAdmin/src/hooks/usePremiumStats.ts": `//
// หลักการทำงาน:
// 1. fetch /payments/stats → คืน premium stats: active users, revenue, expiring soon
// 2. ใช้ใน PaymentManagement สำหรับแสดง summary cards ด้านบน
`,

  "WebAdmin/src/hooks/useSongs.ts": `//
// หลักการทำงาน:
// 1. fetchSongs: GET /songs (paginated) → โหลดเพลงพร้อม artist/album/genre
// 2. createSong: POST /songs (FormData: audio file + cover image + metadata)
// 3. updateSong: PUT /songs/:id (FormData)
// 4. deleteSong: DELETE /songs/:id
// 5. pagination + search filter state
`,

  "WebAdmin/src/hooks/useUsers.ts": `//
// หลักการทำงาน:
// 1. fetchUsers: GET /users (paginated, search) → รายการผู้ใช้ทั้งหมด
// 2. updateUserRole: PATCH /users/:id/role → เปลี่ยน role (USER/ADMIN)
// 3. banUser/unbanUser: PATCH /users/:id/ban → สั่งแบน/ปลดแบน
// 4. pagination + search + filter state
`,

  "WebAdmin/src/features/auth/AdminLogin.tsx": `//
// หลักการทำงาน:
// 1. react-hook-form + zod validate email/password
// 2. onSubmit: dispatch loginThunk → ถ้าสำเร็จ navigate /dashboard
// 3. ถ้า error: แสดง server error message
`,

  "WebAdmin/src/features/dashboard/Dashboard.tsx": `//
// หลักการทำงาน:
// 1. useDashboard hook โหลด stats, activities, topSongs, growth data
// 2. แสดง StatCards (total users, songs, artists, revenue)
// 3. วาดกราฟ Bar (monthly revenue) และ Line (growth trend) ด้วย Chart.js
// 4. แสดง recent activities list และ top songs table
`,

  "WebAdmin/src/features/dashboard/Songmanagement.tsx": `//
// หลักการทำงาน:
// 1. useSongs hook: โหลดเพลง, CRUD operations
// 2. แสดง table รายการเพลง + paginator
// 3. modal สร้าง/แก้ไข: form มี file upload สำหรับ audio + cover
// 4. ปุ่ม play: useAudioPlayer preview เพลงก่อน
// 5. search + filter โดย artist/genre
`,

  "WebAdmin/src/features/dashboard/Usermanagement.tsx": `//
// หลักการทำงาน:
// 1. useUsers hook: โหลด users, ban/unban, change role
// 2. แสดง table ผู้ใช้ + paginator + search
// 3. ปุ่ม ban: ยืนยันด้วย ConfirmDeleteModal ก่อน
// 4. แสดง badge premium/banned/admin
`,

  "WebAdmin/src/features/dashboard/AlbumManagement.tsx": `//
// หลักการทำงาน:
// 1. useAlbums hook: โหลดอัลบั้ม, CRUD
// 2. แสดง table อัลบั้ม + รูปปก
// 3. modal สร้าง/แก้ไข: form มี cover image upload
`,

  "WebAdmin/src/features/dashboard/ArtistManagement.tsx": `//
// หลักการทำงาน:
// 1. useArtists hook: โหลดศิลปิน, CRUD
// 2. แสดง grid หรือ table ศิลปิน + pagination
// 3. modal สร้าง/แก้ไข: form มี image upload
`,

  "WebAdmin/src/features/dashboard/ArtistSongs.tsx": `//
// หลักการทำงาน:
// 1. รับ artistId จาก URL params → GET /songs?artistId= → แสดงเพลงของศิลปินนั้น
// 2. ปุ่ม back กลับไปหน้า ArtistManagement
// 3. สามารถลบเพลงออกจาก artist ได้โดยตรง
`,

  "WebAdmin/src/features/dashboard/GenreManagement.tsx": `//
// หลักการทำงาน:
// 1. useGenres hook: โหลด genres, CRUD
// 2. แสดง grid แนวเพลง + สี + รูป
// 3. modal สร้าง/แก้ไข: form มี color picker + image upload
`,

  "WebAdmin/src/features/dashboard/PaymentManagement.tsx": `//
// หลักการทำงาน:
// 1. usePremiumStats hook: summary cards (active premium, revenue, expiring)
// 2. GET /payments → รายการ transactions ทั้งหมด พร้อม status (PENDING/SUCCESS/FAILED)
// 3. admin approve: PATCH /payments/:id/approve → เปลี่ยน status เป็น SUCCESS + activate premium
// 4. filter ตาม status, search ตาม user email
`,

  "WebAdmin/src/features/dashboard/Admanagement.tsx": `//
// หลักการทำงาน:
// 1. useAds hook: โหลด ads list, CRUD, toggle active
// 2. แสดง table โฆษณา: ชื่อ, ประเภท (SPLASH/AFTER_SONG), impression count, status
// 3. modal สร้าง/แก้ไข: form มี image/video upload + duration + link URL
// 4. toggle switch: เปิด/ปิดโฆษณาได้โดยไม่ต้องลบ
`,

  "WebAdmin/src/features/dashboard/SupportManagement.tsx": `//
// หลักการทำงาน:
// 1. GET /support → รายการ tickets ที่ user ส่งมา
// 2. admin reply: POST /support/:id/reply → ส่งข้อความตอบกลับ + trigger notification ฝั่ง user
// 3. filter ตาม status (open/closed)
`,

  "WebAdmin/src/components/layout/Sidebar.tsx": `//
// หลักการทำงาน:
// 1. แสดงลิงก์ navigate ไปหน้าต่างๆ: Dashboard, Songs, Artists, Albums, Genres, Users, Payments, Ads, Support
// 2. highlight เมนูปัจจุบันตาม useLocation pathname
// 3. ปุ่ม logout: เรียก useAuth().logout → dispatch logoutThunk → navigate /login
`,

  "WebAdmin/src/components/layout/Topbar.tsx": `//
// หลักการทำงาน:
// 1. แสดงชื่อหน้าปัจจุบัน (จาก route) และข้อมูล admin ที่ login อยู่
// 2. ปุ่ม logout หรือ avatar menu ด้านขวา
`,

  "WebAdmin/src/components/common/ConfirmDeleteModal.tsx": `//
// หลักการทำงาน:
// 1. Modal dialog ยืนยันการลบ — แสดงข้อความ + ปุ่ม Confirm/Cancel
// 2. รับ onConfirm, onCancel callbacks
// 3. ใช้ร่วมกันทุกหน้า management เพื่อ prevent accidental delete
`,

  "WebAdmin/src/components/common/MiniPlayer.tsx": `//
// หลักการทำงาน:
// 1. แถบ player เล็กสำหรับ WebAdmin — ใช้ HTML audio element
// 2. แสดงชื่อเพลง + ปุ่ม play/pause ขณะ preview
// 3. ใช้ใน Songmanagement เพื่อ listen เพลงก่อน publish
`,

  "WebAdmin/src/components/common/StatCard.tsx": `//
// หลักการทำงาน:
// 1. card แสดงตัวเลข stat: label + value + icon + optional trend (เปลี่ยนแปลง%)
// 2. รับ props: title, value, icon, trend
// 3. ใช้ใน Dashboard สำหรับ 4 card หลัก
`,

  "WebAdmin/src/components/common/index.ts": `//
// หลักการทำงาน:
// 1. re-export components จาก common/ เพื่อ import สะดวก: import { StatCard, ConfirmDeleteModal } from "../components/common"
`,

  "WebAdmin/src/pages/ForbiddenPage.tsx": `//
// หลักการทำงาน:
// 1. แสดงข้อความ 403 Forbidden เมื่อ user ไม่มีสิทธิ์เข้าถึงหน้านั้น
// 2. ปุ่ม "Go back" → navigate(-1) หรือ /dashboard
`,

  "WebAdmin/src/pages/NotFoundPage.tsx": `//
// หลักการทำงาน:
// 1. แสดงข้อความ 404 Not Found สำหรับ route ที่ไม่มีอยู่
// 2. ปุ่ก "Go home" → navigate /dashboard
`,

  "WebAdmin/src/schema/adminSchema.ts": `//
// หลักการทำงาน:
// 1. Zod schemas สำหรับ form validation ฝั่ง WebAdmin
// 2. loginSchema: email + password validation
// 3. song/artist/album/genre schemas: validate ชื่อ, URL, required fields
// 4. export types ด้วย z.infer สำหรับ react-hook-form
`,

  "WebAdmin/src/utils/format.ts": `//
// หลักการทำงาน:
// 1. formatDate: แปลง ISO string → วันที่แบบ readable (dd/mm/yyyy หรือ relative)
// 2. formatCurrency: แปลงตัวเลข → string เงิน (THB) พร้อม comma separator
// 3. formatDuration: แปลงวินาที → mm:ss string สำหรับแสดงความยาวเพลง
`,

  "WebAdmin/src/main.tsx": `//
// หลักการทำงาน:
// 1. Entry point ของ Vite React app
// 2. ครอบ App ด้วย Redux Provider (store) + BrowserRouter
// 3. ReactDOM.createRoot render App ลง #root element
`,

  "WebAdmin/src/types/album.ts": `//
// หลักการทำงาน:
// 1. export interface Album: id, title, coverUrl, artistId, releaseYear, songs[]
// 2. export interface AlbumFormData: fields ที่ form ส่งไป API
// 3. ใช้โดย useAlbums hook และ AlbumManagement component
`,

  "WebAdmin/src/types/artist.ts": `//
// หลักการทำงาน:
// 1. export interface Artist: id, name, imageUrl, bio, followerCount
// 2. export interface ArtistFormData: fields สำหรับ create/update
`,

  "WebAdmin/src/types/auth.ts": `//
// หลักการทำงาน:
// 1. export interface AdminUser: id, name, email, role
// 2. export interface LoginResponse: accessToken, user
// 3. ใช้โดย auth.store.ts และ useAuth hook
`,

  "WebAdmin/src/types/common.ts": `//
// หลักการทำงาน:
// 1. export shared types: PaginatedResponse<T>, ApiResponse<T>
// 2. ใช้เป็น generic wrapper สำหรับ response ทุก API endpoint
`,

  "WebAdmin/src/types/genre.ts": `//
// หลักการทำงาน:
// 1. export interface Genre: id, name, color, imageUrl
// 2. export interface GenreFormData สำหรับ form create/update
`,

  "WebAdmin/src/types/song.ts": `//
// หลักการทำงาน:
// 1. export interface Song: id, title, duration, filePath, coverUrl, artist, album, genre, playCount
// 2. export interface SongFormData: fields สำหรับ upload เพลงใหม่
`,

  "WebAdmin/src/types/user.ts": `//
// หลักการทำงาน:
// 1. export interface User: id, name, email, role, isPremium, premiumExpiresAt, isBanned
// 2. ใช้โดย useUsers hook และ Usermanagement component
`,

  // ─── layout files ──────────────────────────────────────────────────────────

  "music-app/src/app/(auth)/_layout.tsx": `//
// หลักการทำงาน:
// 1. Stack navigator สำหรับ (auth) group: login, register, set-username
// 2. headerShown: false ซ่อน header ทุกหน้าใน group นี้
`,

  "music-app/src/app/(main)/_layout.tsx": `//
// หลักการทำงาน:
// 1. Stack navigator สำหรับ (main) group: home, search, library ฯลฯ
// 2. headerShown: false — แต่ละหน้าจัดการ header เอง
`,

  "music-app/src/app/(player)/_layout.tsx": `//
// หลักการทำงาน:
// 1. Stack navigator สำหรับ (player) group: player, queue
// 2. headerShown: false
`,

  "music-app/src/app/notifications/_layout.tsx": `//
// หลักการทำงาน:
// 1. Stack navigator สำหรับ notifications group
// 2. headerShown: false
`,

  "music-app/src/app/premium/_layout.tsx": `//
// หลักการทำงาน:
// 1. Stack navigator สำหรับ premium flow: index, payment, success
// 2. headerShown: false
`,

  "music-app/src/app/settings/_layout.tsx": `//
// หลักการทำงาน:
// 1. Stack navigator สำหรับ settings: index, edit-profile, help-support
// 2. headerShown: false
`,
};

let updated = 0;
let skipped = 0;

for (const [relPath, principle] of Object.entries(PRINCIPLES)) {
  const filePath = resolve(ROOT, relPath.replace(/\//g, "/"));
  let content;
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    console.warn(`SKIP (not found): ${relPath}`);
    skipped++;
    continue;
  }

  // ตรวจว่ามี "หลักการทำงาน" แล้วหรือยัง
  if (content.includes("หลักการทำงาน:")) {
    console.log(`ALREADY: ${relPath}`);
    skipped++;
    continue;
  }

  // หาบรรทัดแรกที่เป็น comment (// ...) แล้วแทรก principle หลังบรรทัดนั้น
  const lines = content.split("\n");
  const firstCommentIdx = lines.findIndex(l => l.startsWith("//"));
  if (firstCommentIdx === -1) {
    // ถ้าไม่มี comment เลย ให้เพิ่มที่บรรทัดแรก
    const newContent = principle.trimEnd() + "\n\n" + content;
    writeFileSync(filePath, newContent, "utf8");
  } else {
    // แทรก principle หลังบรรทัด comment แรก
    lines.splice(firstCommentIdx + 1, 0, principle.trimEnd());
    writeFileSync(filePath, lines.join("\n"), "utf8");
  }

  console.log(`OK: ${relPath}`);
  updated++;
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
