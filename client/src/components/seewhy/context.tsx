import { createContext, useContext } from 'react';

export interface AppCtxType {
  username: string;
  addTip: (cents: number, target: string) => void;
  addRevenue: (cents: number) => void;
  totalRevenue: number;
  tipTotal: number;
}

export const AppCtx = createContext<AppCtxType | null>(null);
export function useApp() { return useContext(AppCtx); }
