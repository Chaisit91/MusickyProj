// Modal ยืนยันก่อนลบ — รับ props: isOpen, itemName, onConfirm, onCancel | แสดงชื่อ item ที่จะลบให้ยืนยันหรือยกเลิก
//
// หลักการทำงาน:
// 1. Modal dialog ยืนยันการลบ — แสดงข้อความ + ปุ่ม Confirm/Cancel
// 2. รับ onConfirm, onCancel callbacks
// 3. ใช้ร่วมกันทุกหน้า management เพื่อ prevent accidental delete

import React from "react";
import { Trash2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ title, onClose, onConfirm }) => (
  <div
    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
      <div className="px-6 py-5">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
          <Trash2 size={18} className="text-red-500" />
        </div>
        <p className="font-semibold text-gray-900 text-sm">ลบ{title}นี้?</p>
        <p className="text-gray-500 text-xs mt-1">รายการนี้จะถูกลบออกจากระบบถาวร</p>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ยกเลิก
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
        >
          ลบ{title}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDeleteModal;
