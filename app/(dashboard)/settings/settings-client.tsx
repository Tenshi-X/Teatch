'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Moon, Sun, LogOut, Save, Camera, Globe } from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { Avatar } from '@/components/ui/avatar';
import { updateProfile } from '@/app/actions/settings';
import { signOut } from '@/app/actions/auth';
import { useLanguageStore } from '@/lib/stores/language-store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

interface SettingsClientProps {
  initialName: string;
  email: string;
  avatarUrl?: string;
}

export function SettingsClient({ initialName, email, avatarUrl }: SettingsClientProps) {
  const { isDark, toggle } = useTheme();
  const { language, setLanguage } = useLanguageStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(avatarUrl || '');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('settings.nameEmpty', language));
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('fullName', name);
    if (avatar) {
      formData.append('avatar', avatar);
    }
    
    try {
      const res = await updateProfile(formData);
      if (res.error) throw new Error(res.error);
      toast.success(t('settings.profileUpdated', language));
    } catch (error: any) {
      toast.error(error.message || t('settings.profileFailed', language));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t('settings.title', language)}</h1>
        <p className="text-surface-400">{t('settings.desc', language)}</p>
      </div>

      {/* Profile Settings */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="text-primary-600" />
          {t('settings.profile', language)}
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={name} className="w-20 h-20 rounded-full object-cover border-2 border-[var(--card-border)]" />
              ) : (
                <Avatar name={name} size="lg" />
              )}
              <label className="absolute bottom-0 right-0 p-1.5 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors shadow-md">
                <Camera size={14} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatar(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            </div>
            <div className="text-sm text-surface-500">
              <p className="font-medium text-surface-700 dark:text-surface-300">{t('settings.photo', language)}</p>
              <p className="text-xs">{t('settings.photoFormat', language)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium mb-1.5 text-surface-700 dark:text-surface-300">
              {t('settings.fullName', language)}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('settings.fullNamePlaceholder', language)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-surface-700 dark:text-surface-300">
              {t('settings.email', language)}
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-surface-50 dark:bg-surface-800/50 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-500 text-sm">
              <Mail size={16} />
              {email}
            </div>
          </div>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || (name === initialName && !avatar)}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? t('settings.saving', language) : t('settings.save', language)}
          </Button>
        </form>
      </Card>

      {/* Appearance & Language */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {isDark ? <Moon className="text-secondary-600" /> : <Sun className="text-warning-500" />}
          {t('settings.appearance', language)}
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('settings.darkMode', language)}</p>
              <p className="text-sm text-surface-400">{t('settings.darkModeDesc', language)}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={toggle}
              className="gap-2"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              {isDark ? t('settings.light', language) : t('settings.dark', language)}
            </Button>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-[var(--card-border)]">
            <div>
              <p className="font-medium flex items-center gap-2">
                <Globe size={18} className="text-primary-500" />
                {t('settings.language', language)}
              </p>
              <p className="text-sm text-surface-400">{t('settings.languageDesc', language)}</p>
            </div>
            <div className="flex bg-surface-100 dark:bg-surface-800 rounded-lg p-1">
              <button
                onClick={() => setLanguage('id')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  language === 'id' 
                    ? 'bg-white dark:bg-surface-600 shadow-sm text-primary-600 dark:text-primary-400' 
                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                Indo
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  language === 'en' 
                    ? 'bg-white dark:bg-surface-600 shadow-sm text-primary-600 dark:text-primary-400' 
                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card padding="lg" className="border-danger-200 dark:border-danger-900/30">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-danger-600 dark:text-danger-500">
          <LogOut />
          {t('settings.session', language)}
        </h2>
        <p className="text-sm text-surface-500 mb-4">
          {t('settings.sessionDesc', language)}
        </p>
        <Button 
          variant="outline" 
          onClick={() => signOut()}
          className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 border-danger-200 dark:border-danger-900 dark:hover:bg-danger-500/10"
        >
          {t('settings.logoutBtn', language)}
        </Button>
      </Card>
    </div>
  );
}
