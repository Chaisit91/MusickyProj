import { Request } from "express";

/**
 * ใช้ type นี้แทน Request ในทุก service ที่รับไฟล์จาก multer
 * แก้ปัญหา TypeScript: "Property 'file' does not exist on type 'Request'"
 */
export type MulterRequest = Request & {
  file?: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
    destination?: string;
    filename?: string;
    path?: string;
  };
  files?:
    | {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
      }[]
    | { [fieldname: string]: any[] };
};