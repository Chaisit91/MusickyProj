import { Request, Response } from "express";
import * as Repo from "./supportRepository";
import { TicketStatus } from "@prisma/client";
import { createNotification } from "../notification/notificationRepository";

// ── User endpoints ─────────────────────────────────────────────────────────────
export const submitTicket = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { subject, description, contactEmail } = req.body;
  if (!subject || !description) {
    res.status(400).json({ success: false, message: "subject and description required" });
    return;
  }
  const ticket = await Repo.createTicket({ userId, subject, description, contactEmail });
  res.status(201).json({ success: true, data: ticket });
};

export const getMyTickets = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const tickets = await Repo.getMyTickets(userId);
  res.json({ success: true, data: tickets });
};

export const getMyTicket = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const ticket = await Repo.getTicketById(req.params.id as string, userId);
  if (!ticket) { res.status(404).json({ success: false, message: "Not found" }); return; }
  res.json({ success: true, data: ticket });
};

export const replyTicket = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const ticket = await Repo.getTicketById(req.params.id as string, userId);
  if (!ticket) { res.status(404).json({ success: false, message: "Not found" }); return; }
  const { content } = req.body;
  if (!content) { res.status(400).json({ success: false, message: "content required" }); return; }
  const msg = await Repo.addUserMessage(req.params.id as string, content);
  res.status(201).json({ success: true, data: msg });
};

// ── Admin endpoints ────────────────────────────────────────────────────────────
export const adminGetTickets = async (req: Request, res: Response) => {
  const { status } = req.query;
  const tickets = await Repo.getAllTickets(status as TicketStatus | undefined);
  res.json({ success: true, data: tickets });
};

export const adminGetTicket = async (req: Request, res: Response) => {
  const ticket = await Repo.getTicketById(req.params.id as string);
  if (!ticket) { res.status(404).json({ success: false, message: "Not found" }); return; }
  res.json({ success: true, data: ticket });
};

export const adminReplyTicket = async (req: Request, res: Response) => {
  const { content } = req.body;
  if (!content) { res.status(400).json({ success: false, message: "content required" }); return; }
  const ticket = await Repo.getTicketById(req.params.id as string);
  if (!ticket) { res.status(404).json({ success: false, message: "Not found" }); return; }
  const msg = await Repo.adminReply(req.params.id as string, content);
  await createNotification({
    userId: ticket.userId,
    type: "SUPPORT_REPLY",
    title: `ตอบกลับ: ${ticket.subject}`,
    body: content,
  });
  res.status(201).json({ success: true, data: msg });
};

export const adminUpdateStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  const valid: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
  if (!valid.includes(status)) { res.status(400).json({ success: false, message: "Invalid status" }); return; }
  const ticket = await Repo.updateTicketStatus(req.params.id as string, status);
  res.json({ success: true, data: ticket });
};
