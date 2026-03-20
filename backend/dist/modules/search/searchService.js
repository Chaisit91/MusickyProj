"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSearchHistory = exports.getSearchHistory = exports.search = void 0;
const SearchRepository = __importStar(require("./searchRepository"));
const search = async (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== "string" || q.trim() === "") {
        res.status(400).json({ success: false, message: "Query parameter 'q' is required" });
        return;
    }
    const results = await SearchRepository.searchAll(q.trim());
    // บันทึก search history ถ้า login อยู่
    if (req.user) {
        await SearchRepository.createSearchHistory({
            userId: req.user.id,
            query: q.trim(),
        });
    }
    res.json({ success: true, data: results });
};
exports.search = search;
const getSearchHistory = async (req, res) => {
    const userId = req.user.id;
    const history = await SearchRepository.findSearchHistoryByUser(userId);
    res.json({ success: true, data: history });
};
exports.getSearchHistory = getSearchHistory;
const clearSearchHistory = async (req, res) => {
    const userId = req.user.id;
    await SearchRepository.clearSearchHistory(userId);
    res.json({ success: true, message: "Search history cleared" });
};
exports.clearSearchHistory = clearSearchHistory;
//# sourceMappingURL=searchService.js.map