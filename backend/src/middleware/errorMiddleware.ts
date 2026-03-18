// errorMiddleware สำหรับจัดการข้อผิดพลาดทั้งหมด
export const errorMiddleware = (err: any, req: any, res: any, next: any) => {
  console.error(err.stack);  // แสดง stack ของข้อผิดพลาดใน console
  res.status(500).json({ message: err.message || "Internal Server Error" }); // ส่งข้อความข้อผิดพลาด
};