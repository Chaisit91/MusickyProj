// TypeScript types ทั่วไป — PaginatedResponse<T>, ApiResponse<T>, SortOrder, FilterParams
//
// หลักการทำงาน:
// 1. export shared types: PaginatedResponse<T>, ApiResponse<T>
// 2. ใช้เป็น generic wrapper สำหรับ response ทุก API endpoint

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}