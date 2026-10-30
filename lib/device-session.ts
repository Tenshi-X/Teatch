'use client';
import { useChildStore } from '@/lib/stores/child-store';
import { signOut } from '@/app/actions/auth';
export function clearDeviceSession() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (
        key.startsWith('teatch:quiz:') ||
        key.startsWith('teatch:generation:') ||
        key === 'teatch-child-store' ||
        key === 'teatch:account'
      )
        localStorage.removeItem(key);
    }
  } catch {
    /* Account-scoped keys still isolate browser storage. */
  }
  useChildStore.getState().setChildren([]);
  useChildStore.getState().clearActiveChild();
}
export async function logout() {
  clearDeviceSession();
  await signOut();
}
export function selectDeviceAccount(ownerId: string) {
  try {
    if (localStorage.getItem('teatch:account') !== ownerId)
      clearDeviceSession();
    localStorage.setItem('teatch:account', ownerId);
  } catch {}
}
