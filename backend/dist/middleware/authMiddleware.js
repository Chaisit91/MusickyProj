"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.sseAuthMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// ต้อง login — ถ้าไม่มี token ตีกลับ 401/403 ทันที
const authMiddleware = (req, res, next) => {
    var _a, _b;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(403).json({ success: false, message: "No token provided" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.sub;
        if (!userId) {
            res.status(401).json({ success: false, message: "Invalid token payload" });
            return;
        }
        req.user = {
            id: userId,
            role: (_a = decoded.role) !== null && _a !== void 0 ? _a : "USER",
            email: (_b = decoded.email) !== null && _b !== void 0 ? _b : "",
        };
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
};
exports.authMiddleware = authMiddleware;
// SSE auth — รองรับ token ทั้งจาก header และ query param (EventSource ไม่ support custom headers)
const sseAuthMiddleware = (req, res, next) => {
    var _a, _b;
    const authHeader = req.headers.authorization;
    const queryToken = req.query.token;
    const raw = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer ")) ? authHeader.split(" ")[1] : queryToken;
    if (!raw) {
        res.status(403).json({ success: false, message: "No token provided" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(raw, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.sub;
        if (!userId) {
            res.status(401).json({ success: false, message: "Invalid token payload" });
            return;
        }
        req.user = { id: userId, role: (_a = decoded.role) !== null && _a !== void 0 ? _a : "USER", email: (_b = decoded.email) !== null && _b !== void 0 ? _b : "" };
        next();
    }
    catch (_c) {
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
};
exports.sseAuthMiddleware = sseAuthMiddleware;
// Optional login — ถ้ามี token ก็ decode ใส่ req.user แต่ถ้าไม่มีก็ผ่านได้
// ใช้กับ search — ทุกคนค้นหาได้ แต่ถ้า login จะบันทึก history ด้วย
const optionalAuthMiddleware = (req, _res, next) => {
    var _a, _b;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        next();
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.sub;
        if (userId) {
            req.user = {
                id: userId,
                role: (_a = decoded.role) !== null && _a !== void 0 ? _a : "USER",
                email: (_b = decoded.email) !== null && _b !== void 0 ? _b : "",
            };
        }
    }
    catch (_c) {
        // token ไม่ valid — ไม่ต้องตีกลับ แค่ข้ามไป
    }
    next();
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
//# sourceMappingURL=authMiddleware.js.map