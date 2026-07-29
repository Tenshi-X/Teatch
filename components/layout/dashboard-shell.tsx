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
  userRole?: string;
  avatarUrl?: string;
  worksheetQuota?: number;
  subscriptionPeriodEnd?: string;
  initialChildren: Child[];
}

export function DashboardShell({ 
  children, 
  userName, 
  userRole, 
  avatarUrl,
  worksheetQuota = 0,
  subscriptionPeriodEnd,
  initialChildren 
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setChildren } = useChildStore();

  useEffect(() => {
    setChildren(initialChildren);
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, [initialChildren, setChildren]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        userRole={userRole} 
        worksheetQuota={worksheetQuota}
        subscriptionPeriodEnd={subscriptionPeriodEnd}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          userName={userName} 
          avatarUrl={avatarUrl}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
