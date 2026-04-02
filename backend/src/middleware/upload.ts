import multer from "multer";

// เก็บไฟล์ใน memory buffer เพื่อส่งต่อ Cloudinary โดยตรง
const storage = multer.memoryStorage();

// ---- Image only (artists, albums, genres, ads) ----
const imageFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WEBP and GIF images are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ---- Song upload: รับได้ทั้ง image (coverImage) + audio/mp3 (audioFile) ----
const songFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedAudioTypes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/x-mp3",
    "application/octet-stream", // บางระบบส่งมาเป็น octet-stream
  ];
  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedAudioTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG/PNG/WEBP images and MP3 audio files are allowed"));
  }
};

export const uploadSong = multer({
  storage,
  fileFilter: songFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB (รองรับเพลงใหญ่)
});

// ---- Ad media: รับได้ทั้ง image, mp3, mp4 ----
const adFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = [
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "video/mp4", "video/quicktime", "video/x-mp4",
    "audio/mpeg", "audio/mp3", "audio/x-mp3",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image, MP4, or MP3 files are allowed"));
  }
};

export const uploadAd = multer({
  storage,
  fileFilter: adFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});
