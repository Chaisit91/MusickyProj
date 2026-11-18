"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nowThaiTime = exports.toThaiTime = void 0;
const toThaiTime = (date) => {
    return new Intl.DateTimeFormat("th-TH", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(new Date(date));
};
exports.toThaiTime = toThaiTime;
const nowThaiTime = () => {
    return (0, exports.toThaiTime)(new Date());
};
exports.nowThaiTime = nowThaiTime;
//# sourceMappingURL=dateHelper.js.map