// แปลง ISO / dd/mm/yyyy → yyyy-mm-dd (สำหรับ input[type=date])
export const toDateInputValue = (val?: string | Date | null): string => {
  if (!val) return "";
  try {
    if (typeof val === "string" && val.includes("/")) {
      const [datePart] = val.split(" ");
      const [dd, mm, yyyy] = datePart.split("/");
      return `${parseInt(yyyy) - 543}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
    return new Date(val).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

// แปลงวันที่เป็น dd/mm/yyyy สำหรับแสดงผล
export const formatDate = (d?: string | null): string => {
  if (!d) return "—";
  try {
    if (typeof d === "string" && d.includes("/")) return d.split(" ")[0];
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
  } catch {
    return "—";
  }
};

// แปลงวินาทีเป็น m:ss
export const formatDuration = (sec?: number): string => {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};
