"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// sub = userId, เพิ่ม role และ email ไว้ใน payload
// roleMiddleware จะอ่าน role จาก token โดยตรง ไม่ต้อง query DB
const generateAccessToken = (user) => {
    return jsonwebtoken_1.default.sign({
        sub: user.id,
        role: user.role,
        email: user.email,
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (user) => {
    return jsonwebtoken_1.default.sign({ sub: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};
exports.generateRefreshToken = generateRefreshToken;
//# sourceMappingURL=jwt.js.map