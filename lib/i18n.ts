type Translations = {
  [key: string]: {
    en: string;
    id: string;
  };
};

export const dict: Translations = {
  'nav.dashboard': { id: 'Dashboard', en: 'Dashboard' },
  'nav.children': { id: 'Anak Saya', en: 'My Children' },
  'nav.create': { id: 'Buat Latihan', en: 'Create Worksheet' },
  'nav.history': { id: 'Riwayat', en: 'History' },
  'nav.statistics': { id: 'Statistik', en: 'Statistics' },
  'nav.admin': { id: 'Admin Dashboard', en: 'Admin Dashboard' },
  'nav.settings': { id: 'Pengaturan', en: 'Settings' },

  'header.quota': { id: 'Sisa Worksheet:', en: 'Worksheets Left:' },
  'header.parentAccount': { id: 'Akun Orang Tua', en: 'Parent Account' },
  'header.logout': { id: 'Keluar', en: 'Log Out' },

  'childSelector.add': { id: 'Tambah Anak', en: 'Add Child' },
  'childSelector.yearsOld': { id: 'tahun', en: 'years old' },
  'childSelector.select': { id: 'Pilih Anak', en: 'Select Child' },
  'childSelector.addNew': { id: 'Tambah Anak Baru', en: 'Add New Child' },

  'settings.title': { id: 'Pengaturan', en: 'Settings' },
  'settings.desc': { id: 'Kelola profil orang tua dan preferensi aplikasi Anda.', en: 'Manage your parent profile and app preferences.' },
  
  'settings.profile': { id: 'Profil Orang Tua', en: 'Parent Profile' },
  'settings.photo': { id: 'Foto Profil', en: 'Profile Photo' },
  'settings.photoFormat': { id: 'Format: JPG, PNG, WebP', en: 'Format: JPG, PNG, WebP' },
  
  'settings.fullName': { id: 'Nama Lengkap', en: 'Full Name' },
  'settings.fullNamePlaceholder': { id: 'Masukkan nama lengkap...', en: 'Enter full name...' },
  'settings.email': { id: 'Email (Tidak dapat diubah)', en: 'Email (Cannot be changed)' },
  
  'settings.saving': { id: 'Menyimpan...', en: 'Saving...' },
  'settings.save': { id: 'Simpan Perubahan', en: 'Save Changes' },

  'settings.appearance': { id: 'Preferensi', en: 'Preferences' },
  'settings.darkMode': { id: 'Mode Gelap (Dark Mode)', en: 'Dark Mode' },
  'settings.darkModeDesc': { id: 'Ubah tampilan aplikasi menjadi gelap atau terang.', en: 'Change the application theme to dark or light.' },
  'settings.light': { id: 'Mode Terang', en: 'Light Mode' },
  'settings.dark': { id: 'Mode Gelap', en: 'Dark Mode' },

  'settings.language': { id: 'Bahasa (Language)', en: 'Language' },
  'settings.languageDesc': { id: 'Pilih bahasa aplikasi.', en: 'Choose application language.' },

  'settings.session': { id: 'Sesi Akun', en: 'Account Session' },
  'settings.sessionDesc': { id: 'Keluar dari perangkat ini. Anda perlu masuk kembali menggunakan email dan password untuk mengakses aplikasi.', en: 'Log out from this device. You will need to sign in again with your email and password.' },
  'settings.logoutBtn': { id: 'Keluar dari Aplikasi', en: 'Log Out of App' },
  
  'settings.nameEmpty': { id: 'Nama tidak boleh kosong', en: 'Name cannot be empty' },
  'settings.profileUpdated': { id: 'Profil berhasil diperbarui', en: 'Profile successfully updated' },
  'settings.profileFailed': { id: 'Gagal memperbarui profil', en: 'Failed to update profile' }
};

export function t(key: keyof typeof dict, lang: 'id' | 'en'): string {
  if (!dict[key]) return key;
  return dict[key][lang] || dict[key]['id'];
}
