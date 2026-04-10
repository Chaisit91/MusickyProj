import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type UploadFolder = "artists" | "albums" | "genres" | "ads" | "songs" | "avatars";

export const uploadImageToCloudinary = (
  buffer: Buffer,
  folder: UploadFolder
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const baseFolder = process.env.CLOUDINARY_FOLDER || "musickyproj";

    console.log("=== uploadImageToCloudinary ===");
    console.log("CLOUDINARY_FOLDER env:", process.env.CLOUDINARY_FOLDER);
    console.log("baseFolder:", baseFolder);
    console.log("folder param:", folder);
    console.log("full path:", `${baseFolder}/${folder}`);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${baseFolder}/${folder}`,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        console.log("Cloudinary upload success:", result.secure_url);
        resolve(result.secure_url);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

// อัปโหลดไฟล์ MP3 ไปยัง Cloudinary
// Cloudinary ใช้ resource_type: "video" สำหรับทั้ง audio และ video
export const uploadAudioToCloudinary = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const baseFolder = process.env.CLOUDINARY_FOLDER || "musickyproj";

    console.log("=== uploadAudioToCloudinary ===");
    console.log("full path:", `${baseFolder}/songs/audio`);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${baseFolder}/songs/audio`,
        resource_type: "video", // Cloudinary ใช้ "video" สำหรับ audio ด้วย
        format: "mp3",
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error("Cloudinary audio upload error:", error);
          return reject(error);
        }
        console.log("Cloudinary audio upload success:", result.secure_url);
        resolve(result.secure_url);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

// อัปโหลดสื่อโฆษณา (image / mp4 / mp3) ไปยัง Cloudinary
export const uploadAdMediaToCloudinary = (
  buffer: Buffer,
  mimetype: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const baseFolder = process.env.CLOUDINARY_FOLDER || "musickyproj";
    const isImage = mimetype.startsWith("image/");
    const resourceType = isImage ? "image" : "video"; // Cloudinary ใช้ "video" สำหรับ audio/video

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${baseFolder}/ads`,
        resource_type: resourceType,
        ...(isImage && { transformation: [{ quality: "auto", fetch_format: "auto" }] }),
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error("Cloudinary ad media upload error:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

export const deleteImageFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    const matches = imageUrl.match(/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    if (!matches) return;
    const publicId = matches[1];
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // ไม่ throw เพื่อไม่ให้กระทบ flow หลัก
  }
};

// ลบไฟล์ audio จาก Cloudinary (resource_type: video)
export const deleteAudioFromCloudinary = async (audioUrl: string): Promise<void> => {
  try {
    const matches = audioUrl.match(/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    if (!matches) return;
    const publicId = matches[1];
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  } catch {
    // ไม่ throw เพื่อไม่ให้กระทบ flow หลัก
  }
};
