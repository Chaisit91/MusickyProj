"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
// อ่าน role จาก req.user ที่ authMiddleware decode ไว้แล้ว
// ไม่ต้อง query DB ซ้ำทุก request
const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized: No user found" });
            return;
        }
        if (req.user.role !== requiredRole) {
            res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
            return;
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
//# sourceMappingURL=roleMiddleware.js.map