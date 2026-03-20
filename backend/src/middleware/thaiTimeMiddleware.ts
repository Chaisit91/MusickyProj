import { Request, Response, NextFunction } from "express";

const convertDates = (obj: any): any => {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(convertDates);
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const dateKeys = ["createdAt","updatedAt","lastLogin","downloadedAt","searchedAt","queuedAt","releaseDate","expiresAt"];
    if (dateKeys.includes(key) && obj[key]) {
      result[key] = new Intl.DateTimeFormat("th-TH", {
        timeZone: "Asia/Bangkok",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false,
      }).format(new Date(obj[key]));
    } else {
      result[key] = convertDates(obj[key]);
    }
  }
  return result;
};

export const thaiTimeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const originalJson = res.json.bind(res);
  res.json = (data: any) => originalJson(convertDates(data));
  next();
};
