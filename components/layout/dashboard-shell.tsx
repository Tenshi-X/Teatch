'use client';

import { useState, useEffect, useSyncExternalStore, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useChildStore } from '@/lib/stores/child-store';
import type { Child } from '@/types';
import { selectDeviceAccount } from '@/lib/device-session';
import { RuntimeSignals } from '@/components/feedback/runtime-signals';
function subscribeScreen(notify: () => void) {
  const media = window.matchMedia('(min-width:1024px)');
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}

interface DashboardShellProps {
  ownerId: string;
  children: React.ReactNode;
  userName: string;
  userRole?: string;
  avatarUrl?: string;
  worksheetQuota?: number;
  subscriptionPeriodEnd?: string;
  initialChildren: Child[];
}

export function DashboardShell({
  ownerId,
  children,
  userName,
  userRole,
  avatarUrl,
  worksheetQuota = 0,
  subscriptionPeriodEnd,
  initialChildren,
}: DashboardShellProps) {
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null);
  const pathname = usePathname();
  const practicing = /^\/worksheets\/[^/]+\/attempt\/?$/.test(pathname);
  const desktop = useSyncExternalStore(
    subscribeScreen,
    () => window.matchMedia('(min-width:1024px)').matches,
    () => true
  );
  const sidebarOpen = sidebarOverride ?? desktop;
  const closeSidebar = useCallback(() => setSidebarOverride(false), []);
  const { setChildren } = useChildStore();

  useEffect(() => {
    selectDeviceAccount(ownerId);
    setChildren(initialChildren);
  }, [ownerId, initialChildren, setChildren]);

  if (practicing) {
    return (
      <main id="main-content" className="min-h-dvh px-4 py-6 sm:px-6 sm:py-10">
        <RuntimeSignals ownerId={ownerId} />
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <a
        href="#main-content"
        className="skip-link button-base action-primary min-h-12 px-5"
      >
        Langsung ke isi halaman
      </a>
      <RuntimeSignals ownerId={ownerId} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        isMobile={!desktop}
        userRole={userRole}
      />
      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        inert={!desktop && sidebarOpen}
      >
        <Header
          onMenuToggle={() => setSidebarOverride(!sidebarOpen)}
          menuOpen={sidebarOpen}
          userName={userName}
          avatarUrl={avatarUrl}
          worksheetQuota={worksheetQuota}
          subscriptionPeriodEnd={subscriptionPeriodEnd}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-4 sm:p-6 xl:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
