"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAudioFromCloudinary = exports.deleteImageFromCloudinary = exports.uploadAdMediaToCloudinary = exports.uploadAudioToCloudinary = exports.uploadImageToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadImageToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const baseFolder = process.env.CLOUDINARY_FOLDER || "musickyproj";
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: `${baseFolder}/${folder}`,
            resource_type: "image",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
        }, (error, result) => {
            if (error || !result)
                return reject(error);
            resolve(result.secure_url);
        });
        stream_1.Readable.from(buffer).pipe(uploadStream);
    });
};
exports.uploadImageToCloudinary = uploadImageToCloudinary;
// อัปโหลดไฟล์ MP3 ไปยัง Cloudinary
// Cloudinary ใช้ resource_type: "video" สำหรับทั้ง audio และ video
const uploadAudioToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const baseFolder = process.env.CLOUDINARY_FOLDER || "musickyproj";
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: `${baseFolder}/songs/audio`,
            resource_type: "video",
            format: "mp3",
        }, (error, result) => {
            if (error || !result)
                return reject(error);
            resolve(result.secure_url);
        });
        stream_1.Readable.from(buffer).pipe(uploadStream);
    });
};
exports.uploadAudioToCloudinary = uploadAudioToCloudinary;
// อัปโหลดสื่อโฆษณา (image / mp4 / mp3) ไปยัง Cloudinary
const uploadAdMediaToCloudinary = (buffer, mimetype) => {
    return new Promise((resolve, reject) => {
        const baseFolder = process.env.CLOUDINARY_FOLDER || "musickyproj";
        const isImage = mimetype.startsWith("image/");
        const resourceType = isImage ? "image" : "video"; // Cloudinary ใช้ "video" สำหรับ audio/video
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: `${baseFolder}/ads`,
            resource_type: resourceType,
            ...(isImage && { transformation: [{ quality: "auto", fetch_format: "auto" }] }),
        }, (error, result) => {
            if (error || !result) {
                console.error("Cloudinary ad media upload error:", error);
                return reject(error);
            }
            resolve(result.secure_url);
        });
        stream_1.Readable.from(buffer).pipe(uploadStream);
    });
};
exports.uploadAdMediaToCloudinary = uploadAdMediaToCloudinary;
const deleteImageFromCloudinary = async (imageUrl) => {
    try {
        const matches = imageUrl.match(/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
        if (!matches)
            return;
        const publicId = matches[1];
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (_a) {
        // ไม่ throw เพื่อไม่ให้กระทบ flow หลัก
    }
};
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
// ลบไฟล์ audio จาก Cloudinary (resource_type: video)
const deleteAudioFromCloudinary = async (audioUrl) => {
    try {
        const matches = audioUrl.match(/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
        if (!matches)
            return;
        const publicId = matches[1];
        await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: "video" });
    }
    catch (_a) {
        // ไม่ throw เพื่อไม่ให้กระทบ flow หลัก
    }
};
exports.deleteAudioFromCloudinary = deleteAudioFromCloudinary;
//# sourceMappingURL=uploadImage.js.map