'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Child } from '@/types';

interface ChildStore {
  children: Child[];
  activeChildId: string | null;
  activeChild: Child | null;
  setChildren: (children: Child[]) => void;
  setActiveChild: (childId: string) => void;
  clearActiveChild: () => void;
  addChild: (child: Child) => void;
  updateChild: (child: Child) => void;
  removeChild: (childId: string) => void;
}

export const useChildStore = create<ChildStore>()(
  persist(
    (set, get) => ({
      children: [],
      activeChildId: null,
      activeChild: null,

      setChildren: (children) => {
        const { activeChildId } = get();
        const activeChild = activeChildId
          ? children.find((c) => c.id === activeChildId) || children[0] || null
          : children[0] || null;
        set({
          children,
          activeChild,
          activeChildId: activeChild?.id || null,
        });
      },

      setActiveChild: (childId) => {
        const { children } = get();
        const activeChild = children.find((c) => c.id === childId) || null;
        set({ activeChildId: childId, activeChild });
      },

      clearActiveChild: () => {
        set({ activeChildId: null, activeChild: null });
      },

      addChild: (child) => {
        const { children } = get();
        const updated = [...children, child];
        set({
          children: updated,
          activeChild: child,
          activeChildId: child.id,
        });
      },

      updateChild: (child) => {
        const { children, activeChildId } = get();
        const updated = children.map((c) => (c.id === child.id ? child : c));
        set({
          children: updated,
          activeChild: activeChildId === child.id ? child : get().activeChild,
        });
      },

      removeChild: (childId) => {
        const { children, activeChildId } = get();
        const updated = children.filter((c) => c.id !== childId);
        const newActive =
          activeChildId === childId ? updated[0] || null : get().activeChild;
        set({
          children: updated,
          activeChild: newActive,
          activeChildId: newActive?.id || null,
        });
      },
    }),
    {
      name: 'teatch-child-store',
      partialize: (state) => ({ activeChildId: state.activeChildId }),
    }
  )
);
