'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useChildStore } from '@/lib/stores/child-store';
import type { Child } from '@/types';
function subscribeScreen(notify: () => void) {
  const media = window.matchMedia('(min-width:1024px)');
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}

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
  initialChildren,
}: DashboardShellProps) {
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null);
  const desktop = useSyncExternalStore(
    subscribeScreen,
    () => window.matchMedia('(min-width:1024px)').matches,
    () => true
  );
  const sidebarOpen = sidebarOverride ?? desktop;
  const { setChildren } = useChildStore();

  useEffect(() => {
    setChildren(initialChildren);
  }, [initialChildren, setChildren]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOverride(false)}
        userRole={userRole}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOverride(!sidebarOpen)}
          userName={userName}
          avatarUrl={avatarUrl}
          worksheetQuota={worksheetQuota}
          subscriptionPeriodEnd={subscriptionPeriodEnd}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
