import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Pd } from '../types';

export interface CItm extends Pd {
  q: number;
}

interface CType {
  its: CItm[];
  add: (p: Pd) => void;
  rem: (pid: string) => void;
  clr: () => void;
  tot: number;
  open: boolean;
  tog: () => void;
}

const CContext = createContext<CType | undefined>(undefined);

export const CProv: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [its, setIts] = useState<CItm[]>([]);
  const [open, setOpen] = useState(false);

  const add = (p: Pd) => {
    setIts(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) {
        return prev.map(i =>
          i.id === p.id ? { ...i, q: i.q + 1 } : i
        );
      }
      return [...prev, { ...p, q: 1 }];
    });
    setOpen(true);
  };

  const rem = (pid: string) => {
    setIts(prev => prev.filter(i => i.id !== pid));
  };

  const clr = () => {
    setIts([]);
  };

  const tog = () => setOpen(prev => !prev);

  const tot = its.reduce((s, i) => s + (i.price * i.q), 0);

  return (
    <CContext.Provider value={{
      its,
      add,
      rem,
      clr,
      tot,
      open,
      tog
    }}>
      {children}
    </CContext.Provider>
  );
};

export const useC = () => {
  const c = useContext(CContext);
  if (!c) {
    throw new Error('useC must be used within a CProv');
  }
  return c;
};