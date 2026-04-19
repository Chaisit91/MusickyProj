// Typed Redux hooks — useAppDispatch และ useAppSelector พร้อม type RootState เพื่อใช้แทน useDispatch/useSelector ทั่วแอพ
//
// หลักการทำงาน:
// 1. export useAppDispatch = useDispatch.withTypes<AppDispatch>() → dispatch พร้อม type thunk
// 2. export useAppSelector = useSelector.withTypes<RootState>() → selector พร้อม type ทุก slice
// 3. ใช้แทน useDispatch/useSelector ทั่วแอปเพื่อให้ TypeScript รู้ type โดยไม่ต้อง cast

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Typed hooks — ใช้แทน useDispatch / useSelector ทั่วทั้งแอป
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
