// Re-export common components ทั้งหมด — ConfirmDeleteModal, MiniPlayer, StatCard | import จากที่เดียว
//
// หลักการทำงาน:
// 1. re-export components จาก common/ เพื่อ import สะดวก: import { StatCard, ConfirmDeleteModal } from "../components/common"

export { default as StatCard } from './StatCard';
export { default as ConfirmDeleteModal } from './ConfirmDeleteModal';
export { default as MiniPlayer } from './MiniPlayer';
