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
exports.adminUpdateStatus = exports.adminReplyTicket = exports.adminGetTicket = exports.adminGetTickets = exports.replyTicket = exports.getMyTicket = exports.getMyTickets = exports.submitTicket = void 0;
const Repo = __importStar(require("./supportRepository"));
const notificationRepository_1 = require("../notification/notificationRepository");
// ── User endpoints ─────────────────────────────────────────────────────────────
const submitTicket = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { subject, description, contactEmail } = req.body;
    if (!subject || !description) {
        res.status(400).json({ success: false, message: "subject and description required" });
        return;
    }
    const ticket = await Repo.createTicket({ userId, subject, description, contactEmail });
    res.status(201).json({ success: true, data: ticket });
};
exports.submitTicket = submitTicket;
const getMyTickets = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const tickets = await Repo.getMyTickets(userId);
    res.json({ success: true, data: tickets });
};
exports.getMyTickets = getMyTickets;
const getMyTicket = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const ticket = await Repo.getTicketById(req.params.id, userId);
    if (!ticket) {
        res.status(404).json({ success: false, message: "Not found" });
        return;
    }
    res.json({ success: true, data: ticket });
};
exports.getMyTicket = getMyTicket;
const replyTicket = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const ticket = await Repo.getTicketById(req.params.id, userId);
    if (!ticket) {
        res.status(404).json({ success: false, message: "Not found" });
        return;
    }
    const { content } = req.body;
    if (!content) {
        res.status(400).json({ success: false, message: "content required" });
        return;
    }
    const msg = await Repo.addUserMessage(req.params.id, content);
    res.status(201).json({ success: true, data: msg });
};
exports.replyTicket = replyTicket;
// ── Admin endpoints ────────────────────────────────────────────────────────────
const adminGetTickets = async (req, res) => {
    const { status } = req.query;
    const tickets = await Repo.getAllTickets(status);
    res.json({ success: true, data: tickets });
};
exports.adminGetTickets = adminGetTickets;
const adminGetTicket = async (req, res) => {
    const ticket = await Repo.getTicketById(req.params.id);
    if (!ticket) {
        res.status(404).json({ success: false, message: "Not found" });
        return;
    }
    res.json({ success: true, data: ticket });
};
exports.adminGetTicket = adminGetTicket;
const adminReplyTicket = async (req, res) => {
    const { content } = req.body;
    if (!content) {
        res.status(400).json({ success: false, message: "content required" });
        return;
    }
    const ticket = await Repo.getTicketById(req.params.id);
    if (!ticket) {
        res.status(404).json({ success: false, message: "Not found" });
        return;
    }
    const msg = await Repo.adminReply(req.params.id, content);
    await (0, notificationRepository_1.createNotification)({
        userId: ticket.userId,
        type: "SUPPORT_REPLY",
        title: `ตอบกลับ: ${ticket.subject}`,
        body: content,
    });
    res.status(201).json({ success: true, data: msg });
};
exports.adminReplyTicket = adminReplyTicket;
const adminUpdateStatus = async (req, res) => {
    const { status } = req.body;
    const valid = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (!valid.includes(status)) {
        res.status(400).json({ success: false, message: "Invalid status" });
        return;
    }
    const ticket = await Repo.updateTicketStatus(req.params.id, status);
    res.json({ success: true, data: ticket });
};
exports.adminUpdateStatus = adminUpdateStatus;
//# sourceMappingURL=supportService.js.map