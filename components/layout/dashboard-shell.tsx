'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useChildStore } from '@/lib/stores/child-store';
import { createClient } from '@/lib/supabase/client';
import type { Child } from '@/types';

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  initialChildren: Child[];
}

export function DashboardShell({ children, userName, initialChildren }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setChildren } = useChildStore();

  useEffect(() => {
    setChildren(initialChildren);
  }, [initialChildren, setChildren]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(true)} userName={userName} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
