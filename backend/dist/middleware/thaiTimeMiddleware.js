"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thaiTimeMiddleware = void 0;
const convertDates = (obj) => {
    if (!obj || typeof obj !== "object")
        return obj;
    if (Array.isArray(obj))
        return obj.map(convertDates);
    const result = {};
    for (const key of Object.keys(obj)) {
        const dateKeys = [
            "createdAt", "updatedAt", "lastLogin", "downloadedAt",
            "searchedAt", "queuedAt", "releaseDate", "expiresAt",
            "startDate", "endDate", // เพิ่ม 2 ตัวนี้
        ];
        if (dateKeys.includes(key) && obj[key]) {
            result[key] = new Intl.DateTimeFormat("th-TH", {
                timeZone: "Asia/Bangkok",
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", second: "2-digit",
                hour12: false,
            }).format(new Date(obj[key]));
        }
        else {
            result[key] = convertDates(obj[key]);
        }
    }
    return result;
};
const thaiTimeMiddleware = (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (data) => originalJson(convertDates(data));
    next();
};
exports.thaiTimeMiddleware = thaiTimeMiddleware;
//# sourceMappingURL=thaiTimeMiddleware.js.map