import { Response } from "express";
import { MulterRequest } from "../../types/multerRequest";
import { uploadImageToCloudinary, deleteImageFromCloudinary, UploadFolder } from "../../utils/uploadImage";

const VALID_FOLDERS: UploadFolder[] = ["artists", "albums", "genres", "ads"];

/**
 * POST /api/upload/:folder
 * folder = artists | albums | genres | ads
 *
 * Body: multipart/form-data { image: File }
 * Response: { success: true, data: { url: string } }
 */
export const uploadImage = async (req: MulterRequest, res: Response) => {
  const folder = req.params.folder as UploadFolder;

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

  const url = await uploadImageToCloudinary(req.file.buffer, folder);

  res.status(201).json({
    success: true,
    data: { url },
  });
};

/**
 * DELETE /api/upload
 * Body: { url: string }
 * Response: { success: true, message: "Image deleted" }
 */
export const deleteImage = async (req: MulterRequest, res: Response) => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ success: false, message: "url is required" });
    return;
  }

  await deleteImageFromCloudinary(url);
  res.json({ success: true, message: "Image deleted" });
};