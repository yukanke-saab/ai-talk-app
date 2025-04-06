import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// AppDispatch型を使ったuseDispatchのラッパー
export const useAppDispatch = () => useDispatch<AppDispatch>();

// RootState型を使ったuseSelectorのラッパー
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
