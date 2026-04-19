import fs from 'fs';
import path from 'path';

const BASE = 'c:/Users/msi/OneDrive/Documents/GitHub/MusickyProj';

const summaries = {
  // music-app store
  'music-app/src/store/store.ts': 'Redux store หลัก — รวม reducer ทั้งหมด (auth, player, library, preferences, ads, notifications, network, skip) | export RootState, AppDispatch',
  'music-app/src/store/hooks.ts': 'Typed Redux hooks — useAppDispatch และ useAppSelector พร้อม type RootState เพื่อใช้แทน useDispatch/useSelector ทั่วแอพ',
  'music-app/src/store/playerSlice.ts': 'Redux slice จัดการการเล่นเพลง — state: currentSong, queue, progress, duration, shuffle, repeat, volume | actions: playSong, nextSong, prevSong, seekTo, togglePlay, toggleShuffle, cycleRepeat, addToQueue, removeFromQueue, moveQueueItem, stopSong, bumpReload',
  'music-app/src/store/authSlice.ts': 'Redux slice จัดการ auth — state: user, accessToken, isLoggedIn | thunks: loginThunk, googleLoginThunk, logoutThunk, fetchMeThunk, updateProfileThunk | ล้าง state ทั้งหมดเมื่อ logout',
  'music-app/src/store/librarySlice.ts': 'Redux slice จัดการ library — state: likedSongs, downloadedSongs, followedArtists | actions: toggleLikeSong, toggleDownload, toggleFollowArtist, loadLibrary | รองรับ offline playback ด้วย expo-file-system',
  'music-app/src/store/preferencesSlice.ts': 'Redux slice ตั้งค่าผู้ใช้ — state: musicLanguage, streamingQuality, downloadQuality, autoPlay, showLyrics | sync กับ backend ผ่าน preferencesApi | persist ลง AsyncStorage',
  'music-app/src/store/notificationsSlice.ts': 'Redux slice การแจ้งเตือน — state: items[], unreadCount | thunks: fetchNotifications, markAllRead, deleteNotification | ล้าง state เมื่อ logout',
  'music-app/src/store/adsSlice.ts': 'Redux slice ระบบโฆษณา — state: currentAd, adVisible, adContext (SPLASH/AFTER_SONG), pendingNextSong, showingPreHomeAd | thunks: showSplashAd, showAfterSongAd, trackImpression | ตั้ง showingPreHomeAd=true หลัง login สำหรับ free user',
  'music-app/src/store/networkSlice.ts': 'Redux slice ตรวจสอบการเชื่อมต่อ — state: isOnline (true/false) | อัปเดตผ่าน NetInfo listener ใน _layout.tsx',
  'music-app/src/store/skipSlice.ts': 'Redux slice นับการข้ามเพลงของ free user — จำกัด 5 ครั้ง/วัน | reset อัตโนมัติทุก 24 ชม. | persist ลง AsyncStorage | ไม่ reset เมื่อ logout (ขึ้นกับอุปกรณ์)',
  // music-app API
  'music-app/src/api/apiClient.ts': 'Axios instance กลางของ music-app — ตั้ง baseURL, header Authorization | interceptor: แนบ access token ทุก request, refresh token อัตโนมัติเมื่อ 401, logout เมื่อ refresh หมด',
  'music-app/src/api/authApi.ts': 'API auth — register, login, logout, googleLogin, fetchMe, updateProfile (multipart), forgotPassword (ส่ง OTP), resetPassword',
  'music-app/src/api/homeApi.ts': 'API หน้า Home — ดึงเพลงแนะนำ/ใหม่/ยอดนิยม, บันทึก play history (recordPlay), ดึงเนื้อเพลง (getSongLyricsApi) | export Song interface',
  'music-app/src/api/searchApi.ts': 'API ค้นหา — ค้นหาเพลง/ศิลปิน/อัลบั้ม/แนวเพลง แบบ real-time ด้วย keyword',
  'music-app/src/api/detailApi.ts': 'API ดึงรายละเอียด — อัลบั้ม [id], ศิลปิน [id] + เพลง, แนวเพลง [id] + เพลง, playlist [id] + เพลง',
  'music-app/src/api/playlistApi.ts': 'API จัดการ playlist — สร้าง, แก้ไข, ลบ playlist | เพิ่ม/ลบเพลงใน playlist | ดึง playlist ของ user',
  'music-app/src/api/preferencesApi.ts': 'API ตั้งค่าผู้ใช้ — ดึงและอัปเดต: musicLanguage, streamingQuality, downloadQuality, autoPlay, showLyrics',
  'music-app/src/api/notificationsApi.ts': 'API การแจ้งเตือน — ดึงรายการ, mark all read, ลบ notification',
  'music-app/src/api/paymentApi.ts': 'API Premium — สมัครและต่ออายุ Premium subscription | ดึงประวัติการชำระเงิน',
  'music-app/src/api/adsApi.ts': 'API โฆษณา — ดึง ad ตามประเภท (SPLASH/AFTER_SONG/AFTER_MULTIPLE), ดึง ad ที่ active, บันทึก impression สำหรับ analytics',
  // schema / constants
  'music-app/src/schema/authSchema.ts': 'Zod validation schema สำหรับ form auth — loginSchema, registerSchema, forgotEmailSchema, resetPasswordSchema | export types สำหรับใช้กับ react-hook-form',
  'music-app/src/constants.ts': 'Constants ของแอพ — colorFor(index): สีพื้นหลัง album art ตาม index, ค่าคงที่ทั่วไปที่ใช้ร่วมกันทั้งแอพ',
  // Components
  'music-app/src/Components/player/AudioController.tsx': 'Wrapper ตรวจสอบว่า expo-audio native module พร้อมใช้ — ถ้าไม่พร้อม fallback เป็น null (ไม่ crash) | mount เป็น global component ใน _layout.tsx',
  'music-app/src/Components/player/AudioControllerImpl.tsx': 'Audio engine หลัก — ใช้ expo-audio สร้าง AudioPlayer, sync play/pause/seek/volume จาก Redux, จัดการ auto-next song, trigger โฆษณาหลัง 1-3 เพลง (free user), บันทึก play history, lock screen controls',
  'music-app/src/Components/player/MiniPlayer.tsx': 'Player แถบเล็กด้านล่างหน้าจอ — แสดงชื่อเพลง/ศิลปิน/ปก + ปุ่ม play/pause/next | กดเปิดหน้า player เต็มจอ | ซ่อนเมื่อไม่มีเพลงเล่น',
  'music-app/src/Components/player/SyncedLyrics.tsx': 'แสดงเนื้อเพลงแบบ sync กับ timestamp — parse LRC format, highlight บรรทัดปัจจุบันตาม progressSeconds, scroll อัตโนมัติ, กดบรรทัดเพื่อ seek',
  'music-app/src/Components/layout/Topbar.tsx': 'Topbar หน้า home — แสดง logo, ปุ่ม notifications (มี unread badge), ปุ่ม settings',
  'music-app/src/Components/layout/Bottomnav.tsx': 'Bottom navigation — tabs: Home, Search, Library | highlight tab ปัจจุบัน | ซ่อนเมื่ออยู่ในหน้า player',
  'music-app/src/Components/ui/AddToPlaylistSheet.tsx': 'Bottom sheet เพิ่มเพลงเข้า playlist — แสดง playlist ที่มีอยู่ให้เลือก + สร้าง playlist ใหม่ | dismiss เมื่อ song prop เป็น null',
  'music-app/src/Components/ui/Categorycontent.tsx': 'แสดงรายการ content แบบ horizontal scroll — รองรับ: เพลง, ศิลปิน, อัลบั้ม, แนวเพลง | กด item เพื่อ navigate หรือเล่นเพลง',
  'music-app/src/Components/ui/ErrorBoundary.tsx': 'React Error Boundary — ดักจับ JavaScript error ใน component tree ไม่ให้แอพพัง | แสดงหน้า fallback พร้อมปุ่ม retry',
  'music-app/src/Components/ui/FadeInView.tsx': 'Wrapper ทำ fade-in animation — ใช้ Animated.Value + timing เมื่อ component mount | ใช้ครอบ content ที่ต้องการ animate เข้ามา',
  'music-app/src/Components/ui/FormInput.tsx': 'Text input สำหรับ form — รองรับ error state (เปลี่ยนสี border), label, placeholder | ใช้คู่กับ react-hook-form Controller',
  'music-app/src/Components/ui/FormPasswordInput.tsx': 'Password input — เหมือน FormInput แต่มีปุ่ม toggle แสดง/ซ่อนรหัสผ่าน (secureTextEntry)',
  'music-app/src/Components/ui/OfflineBanner.tsx': 'Banner แจ้งเตือนไม่มีอินเทอร์เน็ต — อ่าน state.network.isOnline จาก Redux | แสดงที่ด้านบนสุดของหน้าจอเมื่อ offline',
  'music-app/src/Components/ui/icons/index.tsx': 'รวม SVG icon components ทั้งหมดที่ใช้ในแอพ — export เป็น named exports ให้ import ได้สะดวก',
  'music-app/src/Components/ads/BetweenSongAd.tsx': 'Modal โฆษณาระหว่างเพลง (AFTER_SONG) — แสดงเหนือ player UI, countdown + progress bar, รองรับ image/video ad, เมื่อจบ auto-next song + bumpReload | ปิดด้วยปุ่ม chevron down',
  // app screens
  'music-app/src/app/_layout.tsx': 'Root layout — ครอบ Redux Provider, StatusBar, OfflineBanner, AudioController (global player), BetweenSongAd (global modal), AuthGuard (redirect login/home ตาม auth state + splash ad)',
  'music-app/src/app/index.tsx': 'Landing page — redirect อัตโนมัติ: login แล้ว→/home, ยังไม่ login→แสดง Login/Register button',
  'music-app/src/app/home-ads.tsx': 'หน้า Splash Ad หลัง login สำหรับ free user — โหลด SPLASH ad จาก server, countdown ก่อน skip ได้, video ad auto-navigate เมื่อจบ, ไม่มี ad → redirect /home ทันที',
  'music-app/src/app/(auth)/_layout.tsx': 'Layout สำหรับ auth group — Stack navigator สำหรับหน้า login, register, forgot-password, set-username',
  'music-app/src/app/(auth)/login.tsx': 'หน้า Login — form email/password (zod validation), Google login, link ไป register/forgot-password | dispatch loginThunk หรือ googleLoginThunk',
  'music-app/src/app/(auth)/register.tsx': 'หน้า Register — form ชื่อ, email, รหัสผ่าน, วันเกิด (zod validation) | dispatch registerThunk → auto login หลังสมัคร',
  'music-app/src/app/(auth)/forgot-password.tsx': 'รีเซ็ตรหัสผ่าน 3 ขั้นตอน — step 1: ส่ง email รับ OTP | step 2: กรอก OTP + รหัสผ่านใหม่ | step 3: success → navigate /login',
  'music-app/src/app/(auth)/set-username.tsx': 'ตั้งชื่อหลัง Google login ครั้งแรก — แสดงเฉพาะเมื่อ requiresName=true | dispatch googleLoginThunk พร้อม name',
  'music-app/src/app/(main)/_layout.tsx': 'Layout หน้าหลัก — ครอบ Topbar + Bottomnav + Stack navigator สำหรับ home, search, library pages',
  'music-app/src/app/(main)/home.tsx': 'หน้า Home — แสดง: เพลงแนะนำ, เพลงใหม่, เพลงยอดนิยม, แนวเพลง, ศิลปิน | กด item เพื่อเล่นเพลงหรือ navigate',
  'music-app/src/app/(main)/search.tsx': 'หน้าค้นหา — real-time search (debounce), ค้นได้ทั้ง เพลง/ศิลปิน/อัลบั้ม/แนวเพลง | แสดง recent searches เมื่อยังไม่พิมพ์',
  'music-app/src/app/(main)/liked-songs.tsx': 'หน้าเพลงที่ถูกใจ — แสดงรายการจาก state.library.likedSongs | กดเล่นใส่ queue ได้เลย',
  'music-app/src/app/(main)/recently-played.tsx': 'หน้าเพลงที่เล่นล่าสุด — ดึงจาก API play history | กดเล่นได้ทันที',
  'music-app/src/app/(main)/artist-following.tsx': 'หน้าศิลปินที่ติดตาม — แสดงรายการจาก state.library.followedArtists | กด navigate ไปหน้าศิลปิน',
  'music-app/src/app/(main)/playlists.tsx': 'หน้ารายการ playlist — แสดง playlist ของ user, สร้างใหม่ได้ | กดเข้าไปดู/เล่นได้',
  'music-app/src/app/(main)/your-library.tsx': 'หน้า Library — รวม tabs: Liked Songs, Playlists, Following Artists, Downloads',
  'music-app/src/app/(main)/downloads.tsx': 'หน้าเพลงที่ดาวน์โหลด (offline) — แสดงจาก state.library.downloadedSongs | เล่น offline ได้จาก local file',
  'music-app/src/app/(player)/_layout.tsx': 'Layout สำหรับ player group — Modal-style Stack navigator สำหรับ player.tsx และ queue.tsx',
  'music-app/src/app/(player)/player.tsx': 'หน้า player เต็มจอ — album art, title/artist, progress slider (drag), controls (shuffle/prev/play/next/repeat), lyrics tab (SyncedLyrics), volume slider, Up Next preview | skip แสดง ad สำหรับ free user',
  'music-app/src/app/(player)/queue.tsx': 'หน้าจัดการ queue — แสดง Now Playing + รายการเพลงทั้งหมด, reorder ด้วย up/down, ลบเพลงออกจาก queue, เลือก repeat mode (none/all/one) | auto-load เพลงสุ่มเมื่อ queue ว่าง',
  'music-app/src/app/album/[id].tsx': 'หน้ารายละเอียดอัลบั้ม — ดึงข้อมูลจาก detailApi ด้วย id | แสดงปก, ชื่อ, ศิลปิน, รายการเพลง | กดเล่นทั้งอัลบั้มหรือเลือกเพลง',
  'music-app/src/app/artist/[id].tsx': 'หน้ารายละเอียดศิลปิน — hero image, ชื่อ, ปุ่ม follow, รายการเพลงของศิลปิน | กดเล่นเพลงหรือ follow/unfollow',
  'music-app/src/app/genre/[id].tsx': 'หน้ารายการเพลงตามแนวเพลง — ดึงเพลงทั้งหมดของ genre ด้วย id | กดเล่นได้ทันที',
  'music-app/src/app/playlist/[id].tsx': 'หน้ารายละเอียด playlist — ปก, ชื่อ, รายการเพลง, ปุ่มเล่นทั้ง playlist | เพิ่ม/ลบเพลงได้ถ้าเป็นเจ้าของ',
  'music-app/src/app/notifications/_layout.tsx': 'Layout สำหรับหน้า notifications',
  'music-app/src/app/notifications/index.tsx': 'หน้าการแจ้งเตือน — แสดงรายการ notifications ทั้งหมด, mark all read, ลบแต่ละรายการ | badge unread count จาก Redux',
  'music-app/src/app/premium/_layout.tsx': 'Layout สำหรับหน้า premium',
  'music-app/src/app/premium/index.tsx': 'หน้าแพ็กเกจ Premium — แสดง feature ของ Premium vs Free, ปุ่มสมัคร navigate ไป payment',
  'music-app/src/app/premium/payment.tsx': 'หน้าชำระเงิน Premium — กรอกข้อมูล, เลือกแพ็กเกจ, ยืนยันการสมัคร | dispatch paymentThunk',
  'music-app/src/app/premium/success.tsx': 'หน้า Premium สมัครสำเร็จ — แสดง confirmation + navigate กลับ home',
  'music-app/src/app/settings/_layout.tsx': 'Layout สำหรับหน้า settings',
  'music-app/src/app/settings/index.tsx': 'หน้าตั้งค่าหลัก — links ไป: edit-profile, download-quality, streaming-quality, music-language, help-support | ปุ่ม logout',
  'music-app/src/app/settings/edit-profile.tsx': 'แก้ไขโปรไฟล์ — เปลี่ยนชื่อ, เลือก avatar จาก gallery, upload ด้วย multipart/form-data | dispatch updateProfileThunk',
  'music-app/src/app/settings/download-quality.tsx': 'ตั้งคุณภาพการดาวน์โหลด — เลือก Low/Normal/High | บันทึกผ่าน preferencesApi + update Redux',
  'music-app/src/app/settings/streaming-quality.tsx': 'ตั้งคุณภาพการสตรีม — เลือก Low/Normal/High | บันทึกผ่าน preferencesApi + update Redux',
  'music-app/src/app/settings/music-language.tsx': 'ตั้งภาษาเพลงที่ต้องการ — เลือกหลายภาษาได้ | บันทึกผ่าน preferencesApi + update Redux',
  'music-app/src/app/settings/help-support.tsx': 'หน้าช่วยเหลือ — FAQ, ติดต่อ support, link ไป email/social | ไม่มี API call',
  // WebAdmin
  'WebAdmin/src/App.tsx': 'Root component ของ WebAdmin — render AuthRouter เพียงอย่างเดียว ไม่มี logic เพิ่มเติม',
  'WebAdmin/src/main.tsx': 'Entry point ของ WebAdmin — mount App ลง DOM, ครอบด้วย Redux Provider และ BrowserRouter',
  'WebAdmin/src/api/axios.ts': 'Axios instance ของ WebAdmin — ตั้ง baseURL, interceptor แนบ access token ทุก request, refresh token อัตโนมัติเมื่อ 401, redirect /login เมื่อ refresh หมด',
  'WebAdmin/src/api/authApi.ts': 'API auth admin — adminLogin, adminLogout, refreshToken',
  'WebAdmin/src/api/adsApi.ts': 'API จัดการโฆษณา (Admin) — getAds, createAd, updateAd, deleteAd, toggleAdActive | รองรับ multipart upload image/video',
  'WebAdmin/src/api/albumApi.ts': 'API จัดการอัลบั้ม (Admin) — getAlbums, createAlbum, updateAlbum, deleteAlbum | รองรับ upload ปก',
  'WebAdmin/src/api/artistApi.ts': 'API จัดการศิลปิน (Admin) — getArtists, createArtist, updateArtist, deleteArtist | รองรับ upload รูปศิลปิน',
  'WebAdmin/src/api/dashboardApi.ts': 'API ดึงสถิติ dashboard — total users, premium users, total songs, total revenue, กราฟรายได้รายเดือน',
  'WebAdmin/src/api/genreApi.ts': 'API จัดการแนวเพลง (Admin) — getGenres, createGenre, updateGenre, deleteGenre',
  'WebAdmin/src/api/paymentApi.ts': 'API รายการชำระเงิน (Admin) — getPayments, ดูประวัติ subscription ของ users',
  'WebAdmin/src/api/songApi.ts': 'API จัดการเพลง (Admin) — getSongs, createSong, updateSong, deleteSong | รองรับ multipart upload audio file + ปก',
  'WebAdmin/src/api/userApi.ts': 'API จัดการผู้ใช้ (Admin) — getUsers, updateUser (role/premium), banUser, unbanUser, deleteUser',
  'WebAdmin/src/hooks/useAuth.ts': 'Hook จัดการ auth admin — login, logout, checkAuth, อ่าน user/token จาก Redux | ใช้ใน AdminLogin และ guards',
  'WebAdmin/src/hooks/useAudioPlayer.ts': 'Hook เล่นเสียงใน admin panel — play (toggle pause ถ้าเพลงเดิม), stop, seek, setVolume | ติดตาม progress/duration/isPlaying real-time ผ่าน HTML Audio element',
  'WebAdmin/src/hooks/useAds.ts': 'Hook จัดการโฆษณา — fetch list, create, update, delete, toggle active | จัดการ loading/error state',
  'WebAdmin/src/hooks/useAlbums.ts': 'Hook จัดการอัลบั้ม — fetch list, create, update, delete | จัดการ loading/error state',
  'WebAdmin/src/hooks/useArtists.ts': 'Hook จัดการศิลปิน — fetch list, create, update, delete | จัดการ loading/error state',
  'WebAdmin/src/hooks/useDashboard.ts': 'Hook ดึงสถิติ dashboard — total users, songs, revenue, กราฟรายได้ | auto-fetch เมื่อ mount',
  'WebAdmin/src/hooks/useGenres.ts': 'Hook จัดการแนวเพลง — fetch list, create, update, delete | จัดการ loading/error state',
  'WebAdmin/src/hooks/usePremiumStats.ts': 'Hook ดึงสถิติ premium — จำนวน premium users, revenue รายเดือน | ใช้ใน UserManagement',
  'WebAdmin/src/hooks/useSongs.ts': 'Hook จัดการเพลง — fetch list (filter ตาม artistId ได้), create, update, delete | จัดการ loading/error state',
  'WebAdmin/src/hooks/useUsers.ts': 'Hook จัดการผู้ใช้ — fetch list, search, update role, ban/unban, delete | จัดการ loading/error state',
  'WebAdmin/src/store/store.ts': 'Redux store ของ WebAdmin — มีเฉพาะ authReducer | export RootState, AppDispatch',
  'WebAdmin/src/store/auth.store.ts': 'Auth slice ของ WebAdmin — state: user, accessToken, isAuthenticated | actions: setCredentials, clearCredentials | persist token ลง localStorage',
  'WebAdmin/src/schema/adminSchema.ts': 'Zod schema validation สำหรับ admin forms — loginSchema และ schema อื่นๆ สำหรับ CRUD forms',
  'WebAdmin/src/guards/AdminRoute.tsx': 'Route guard ตรวจสิทธิ์ admin — isAuthenticated + role=ADMIN → render children | ไม่ authenticated → redirect /login | authenticated แต่ไม่ใช่ admin → redirect /forbidden',
  'WebAdmin/src/guards/ProtectedRoute.tsx': 'Route guard ตรวจสอบ login — isAuthenticated → render children | ไม่ authenticated → redirect /login',
  'WebAdmin/src/app/router/authRouter.tsx': 'กำหนด routes ทั้งหมดของ WebAdmin — /login, /forbidden, /dashboard, /users, /artists, /albums, /songs, /songs/:artistId, /Genres, /ads, /payments, /support | ครอบด้วย AdminRoute guard',
  'WebAdmin/src/features/auth/AdminLogin.tsx': 'หน้า Login ของ Admin — form email/password (zod validation) | dispatch loginThunk → redirect /dashboard',
  'WebAdmin/src/features/dashboard/Dashboard.tsx': 'หน้า Dashboard หลัก — StatCards: total users/songs/artists/revenue + กราฟรายได้รายเดือน | ใช้ useDashboard hook',
  'WebAdmin/src/features/dashboard/Usermanagement.tsx': 'หน้าจัดการ Users — table แสดง users ทั้งหมด, search, กำหนด role, toggle premium, ban/unban, ดู premium stats | ใช้ useUsers + usePremiumStats',
  'WebAdmin/src/features/dashboard/ArtistManagement.tsx': 'หน้าจัดการ Artists — table + modal CRUD: สร้าง/แก้ไข/ลบศิลปิน, upload รูปภาพ, กดดูเพลงของศิลปิน | ใช้ useArtists',
  'WebAdmin/src/features/dashboard/ArtistSongs.tsx': 'หน้ารายการเพลงของศิลปิน — แสดงเพลงทั้งหมดของ artistId จาก URL params, preview เพลงด้วย MiniPlayer | ใช้ useSongs + useAudioPlayer',
  'WebAdmin/src/features/dashboard/AlbumManagement.tsx': 'หน้าจัดการ Albums — table + modal CRUD: สร้าง/แก้ไข/ลบอัลบั้ม, เลือกศิลปิน, upload ปก | ใช้ useAlbums + useArtists',
  'WebAdmin/src/features/dashboard/Songmanagement.tsx': 'หน้าจัดการ Songs — table + modal CRUD: สร้าง/แก้ไข/ลบเพลง, upload audio + ปก, เลือกศิลปิน/อัลบั้ม/แนวเพลง, preview เพลง | ใช้ useSongs + useAudioPlayer',
  'WebAdmin/src/features/dashboard/GenreManagement.tsx': 'หน้าจัดการ Genres — table + modal CRUD: สร้าง/แก้ไข/ลบแนวเพลง, upload icon | ใช้ useGenres',
  'WebAdmin/src/features/dashboard/Admanagement.tsx': 'หน้าจัดการโฆษณา — table + modal CRUD: สร้าง/แก้ไข/ลบ ad, เลือกประเภท (SPLASH/AFTER_SONG/AFTER_MULTIPLE), upload image/video, toggle active, preview media | ใช้ useAds',
  'WebAdmin/src/features/dashboard/PaymentManagement.tsx': 'หน้ารายการชำระเงิน — แสดงประวัติ Premium subscription ทั้งหมด, filter ตามช่วงเวลา, ดู status การชำระ',
  'WebAdmin/src/features/dashboard/SupportManagement.tsx': 'หน้าจัดการ Support tickets — แสดงรายการ ticket จาก users, ตอบกลับ, เปลี่ยน status (open/resolved)',
  'WebAdmin/src/components/common/ConfirmDeleteModal.tsx': 'Modal ยืนยันก่อนลบ — รับ props: isOpen, itemName, onConfirm, onCancel | แสดงชื่อ item ที่จะลบให้ยืนยันหรือยกเลิก',
  'WebAdmin/src/components/common/MiniPlayer.tsx': 'Mini audio player สำหรับ preview เพลงใน Admin — progress bar, ปุ่ม play/pause, เวลาผ่านไป/ทั้งหมด, ปุ่ม stop | รับ props จาก useAudioPlayer hook',
  'WebAdmin/src/components/common/StatCard.tsx': 'Card แสดงตัวเลขสถิติ — รับ props: title, value, icon, color | ใช้ใน Dashboard สำหรับแสดง total users, songs, revenue',
  'WebAdmin/src/components/common/index.ts': 'Re-export common components ทั้งหมด — ConfirmDeleteModal, MiniPlayer, StatCard | import จากที่เดียว',
  'WebAdmin/src/components/layout/Sidebar.tsx': 'Sidebar navigation ของ admin panel — links: Dashboard, Users, Artists, Albums, Songs, Genres, Ads, Payments, Support | highlight active route',
  'WebAdmin/src/components/layout/Topbar.tsx': 'Topbar ของ admin panel — แสดงชื่อหน้าปัจจุบัน, ชื่อ admin user, ปุ่ม logout',
  'WebAdmin/src/pages/ForbiddenPage.tsx': 'หน้า 403 Forbidden — แสดงเมื่อ user login แล้วแต่ไม่มีสิทธิ์ admin',
  'WebAdmin/src/pages/NotFoundPage.tsx': 'หน้า 404 Not Found — แสดงเมื่อ route ไม่ตรงกับที่กำหนดใน authRouter',
  'WebAdmin/src/types/auth.ts': 'TypeScript types สำหรับ auth — AdminUser, LoginRequest, LoginResponse, TokenPayload',
  'WebAdmin/src/types/common.ts': 'TypeScript types ทั่วไป — PaginatedResponse<T>, ApiResponse<T>, SortOrder, FilterParams',
  'WebAdmin/src/types/user.ts': 'TypeScript types สำหรับ User — id, name, email, role, isPremium, avatarUrl, createdAt, bannedAt',
  'WebAdmin/src/types/artist.ts': 'TypeScript types สำหรับ Artist — id, name, bio, imageUrl, songCount',
  'WebAdmin/src/types/album.ts': 'TypeScript types สำหรับ Album — id, title, artistId, coverUrl, releaseDate, songCount',
  'WebAdmin/src/types/song.ts': 'TypeScript types สำหรับ Song — id, title, artistId, albumId, genreId, filePath, coverUrl, duration, lyrics',
  'WebAdmin/src/types/genre.ts': 'TypeScript types สำหรับ Genre — id, name, iconUrl',
  'WebAdmin/src/utils/format.ts': 'Utility functions — formatDate, formatNumber (comma), formatDuration (mm:ss), formatBytes (file size) | ใช้ทั่ว WebAdmin',
};

let count = 0;
let notFound = [];
for (const [rel, summary] of Object.entries(summaries)) {
  const filePath = path.join(BASE, rel.replace(/\//g, path.sep));
  if (!fs.existsSync(filePath)) { notFound.push(rel); continue; }
  let src = fs.readFileSync(filePath, 'utf8');
  const line = `// ${summary}\n`;
  // ถ้าบรรทัดแรกเป็น comment summary เดิม → แทนที่ (ไม่ซ้ำ)
  if (src.match(/^\/\/ .+\n/) && !src.startsWith('// ─')) {
    src = line + src.replace(/^\/\/ [^\n]*\n/, '');
  } else {
    src = line + src;
  }
  fs.writeFileSync(filePath, src, 'utf8');
  count++;
}
console.log(`Done: ${count} files updated`);
if (notFound.length) console.log('Not found:', notFound.join(', '));
