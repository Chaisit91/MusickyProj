"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
// Global error handler — ต้องวางไว้หลัง routes ทั้งหมดใน index.ts
const errorMiddleware = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.stack);
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
exports.errorMiddleware = errorMiddleware;
//# sourceMappingURL=errorMiddleware.js.map