"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadImage = void 0;
const uploadImage_1 = require("../../utils/uploadImage");
const VALID_FOLDERS = ["artists", "albums", "genres", "ads"];
/**
 * POST /api/upload/:folder
 * folder = artists | albums | genres | ads
 *
 * Body: multipart/form-data { image: File }
 * Response: { success: true, data: { url: string } }
 */
const uploadImage = async (req, res) => {
    const folder = req.params.folder;
    if (!VALID_FOLDERS.includes(folder)) {
        res.status(400).json({
            success: false,
            message: `Invalid folder. Must be one of: ${VALID_FOLDERS.join(", ")}`,
        });
        return;
    }
    if (!req.file) {
        res.status(400).json({ success: false, message: "Image file is required" });
        return;
    }
    const url = await (0, uploadImage_1.uploadImageToCloudinary)(req.file.buffer, folder);
    res.status(201).json({
        success: true,
        data: { url },
    });
};
exports.uploadImage = uploadImage;
/**
 * DELETE /api/upload
 * Body: { url: string }
 * Response: { success: true, message: "Image deleted" }
 */
const deleteImage = async (req, res) => {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ success: false, message: "url is required" });
        return;
    }
    await (0, uploadImage_1.deleteImageFromCloudinary)(url);
    res.json({ success: true, message: "Image deleted" });
};
exports.deleteImage = deleteImage;
//# sourceMappingURL=uploadService.js.map