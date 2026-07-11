'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Moon, Sun, LogOut, Save } from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { updateProfile } from '@/app/actions/settings';
import { signOut } from '@/app/actions/auth';
import { toast } from 'sonner';

interface SettingsClientProps {
  initialName: string;
  email: string;
}

export function SettingsClient({ initialName, email }: SettingsClientProps) {
  const { isDark, toggle } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(initialName);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('fullName', name);
    
    try {
      const res = await updateProfile(formData);
      if (res.error) throw new Error(res.error);
      toast.success('Profil berhasil diperbarui');
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Profile Settings */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="text-primary-600" />
          Profil Orang Tua
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-surface-700 dark:text-surface-300">
              Nama Lengkap
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-surface-700 dark:text-surface-300">
              Email (Tidak dapat diubah)
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-surface-50 dark:bg-surface-800/50 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-500 text-sm">
              <Mail size={16} />
              {email}
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || name === initialName}
            className="w-full sm:w-auto mt-2"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </form>
      </Card>

      {/* Appearance */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {isDark ? <Moon className="text-secondary-600" /> : <Sun className="text-warning-500" />}
          Tampilan
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Mode Gelap (Dark Mode)</p>
            <p className="text-sm text-surface-400">Ubah tampilan aplikasi menjadi gelap atau terang.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={toggle}
            className="gap-2"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Mode Terang' : 'Mode Gelap'}
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card padding="lg" className="border-danger-200 dark:border-danger-900/30">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-danger-600 dark:text-danger-500">
          <LogOut />
          Sesi Akun
        </h2>
        <p className="text-sm text-surface-500 mb-4">
          Keluar dari perangkat ini. Anda perlu masuk kembali menggunakan email dan password untuk mengakses aplikasi.
        </p>
        <Button 
          variant="outline" 
          onClick={() => signOut()}
          className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 border-danger-200 dark:border-danger-900 dark:hover:bg-danger-500/10"
        >
          Keluar dari Aplikasi
        </Button>
      </Card>
    </div>
  );
}
