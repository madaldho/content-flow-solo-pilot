import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "id";

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

// Translation dictionary
const translations: Translations = {
  en: {
    // App
    "appName": "Content",
    "appNameHighlight": "Flow",
    "closeMenu": "Close Menu",
    "openMenu": "Open Menu",
    "searchButton": "Search",
    "searchNotAvailable": "Search is not available on this page",
    "errorUpdatingStatus": "Failed to update content status. Please try again.",
    
    // Dashboard
    "dashboard": "Dashboard",
    "contentBoard": "Content Board",
    "calendar": "Calendar",
    "addContent": "Add Content",
    "export": "Export",
    "quickActions": "Quick Actions",
    "search": "Cari",
    "clearSearch": "Clear",
    "settings": "Settings",
    "activeContent": "Active Content",
    "itemsInProgress": "Items in progress",
    "contentItemsBeingWorkedOn": "Content items being worked on",
    "noActiveContentItems": "No active content items",
    "publishedThisWeek": "Published This Week",
    "last7Days": "Last 7 days",
    "itemsPublishedCount": "{{count}} item{{count !== 1 ? 's' : ''}} published",
    "noContentPublishedThisWeek": "No content published this week",
    "bestPerformer": "Best Performer",
    "mostViewedContent": "Most viewed content",
    "noPublishedContentYet": "No published content yet",
    "unfinished": "Unfinished",
    "contentToComplete": "Content to complete",
    "itemsAwaitingCompletion": "{{count}} item{{count !== 1 ? 's' : ''}} awaiting completion",
    "allContentComplete": "All content is complete",
    "contentStatusBreakdown": "Content Status Breakdown",
    "noContentCreatedYet": "No content created yet. Start by adding your first content idea!",
    "reminders": "Reminders",
    "unfinishedContent": "Unfinished Content",
    "unfinishedContentMessage": "You have {{count}} unfinished content item{{count !== 1 ? 's' : ''}}. Check your content board to continue working on them.",
    "readyToPublishMessage": "You have {{count}} item{{count !== 1 ? 's' : ''}} ready to publish. Check your calendar to schedule them.",
    
    // Content Board
    "idea": "Idea",
    "script": "Script",
    "recorded": "Recorded",
    "edited": "Edited",
    "readyToPublish": "Ready to Publish",
    "published": "Published",
    "noContent": "No content in this status",
    "filterByPlatform": "Filter by Platform",
    "addIdea": "Add Idea",
    
    // Content Form
    "title": "Title",
    "platform": "Platform",
    "platforms": "Platforms",
    "status": "Status",
    "publicationDate": "Publication Date",
    "notes": "Notes",
    "additionalInfo": "Additional information or context for this content.",
    "referenceLink": "Reference Link",
    "scriptFile": "Script File",
    "scriptContent": "Script",
    "productionNotes": "Production Notes",
    "equipmentUsed": "Equipment Used",
    "contentFiles": "Content Files",
    "selectTags": "Select tags...",
    "selected": "selected",
    "submit": "Submit",
    "selectPlatforms": "Select platforms...",
    "searchPlatforms": "Search platforms...",
    "noPlatformFound": "No platform found.",
    "basicInfo": "Basic Information",
    "contentDetails": "Content Details",
    "production": "Production Information",
    
    // Content Details
    "edit": "Edit Content",
    "delete": "Delete",
    "confirmDelete": "Are you sure?",
    "deleteWarning": "This action cannot be undone. This will permanently delete this content.",
    "cancel": "Cancel",
    "created": "Created",
    "contentChecklist": "Content Checklist",
    "intro": "Introduction",
    "mainPoints": "Main Points/Content",
    "callToAction": "Call to Action",
    "outro": "Outro/Conclusion",
    "publishing": "Publishing",
    "performance": "Performance Metrics",
    "views": "Views",
    "likes": "Likes",
    "comments": "Comments",
    "shares": "Shares",
    "rating": "Your Rating",
    "insights": "Performance Insights",
    
    // Settings
    "appSettings": "App Settings",
    "customization": "Customization",
    "manageOptions": "Manage Options",
    "platformOptions": "Platform Options",
    "tagOptions": "Tag Options",
    "addNew": "Add New",
    "editSelected": "Edit Selected",
    "deleteSelected": "Delete Selected",
    "confirmAction": "Confirm Action",
    "name": "Name",
    "save": "Save",
    "enterName": "Enter name",
    "selectOption": "Select option",
    "manageContent": "Manage Content",
    "exportData": "Export Data",
    "importData": "Import Data",
    "backupRestore": "Backup & Restore",
    "confirmResetWarning": "This will delete all custom options. Default options will be restored.",
    "reset": "Reset",
    "actions": "Actions",
    
    // Language
    "language": "Language",
    "toggleLanguage": "Toggle Language",
    "selectLanguage": "Select Language",
    
    // History
    "statusHistory": "Status History",
    "movedFrom": "Moved from",
    "to": "to",
    "createdAs": "Created as",
    "noHistory": "No status history available",
    "moveTo": "Move to",
    
    // General
    "all": "All",
    "searchResults": "Search Results",
    "noResults": "No content matches your search",
    "pickDate": "Pick a date",
    "noTagFound": "No tag found.",
    "searchTags": "Search tags...",
    "education": "Education",
    "entertainment": "Entertainment",
    "promotion": "Promotion",
    "tutorial": "Tutorial",
    "review": "Review",
    "vlog": "Vlog",
    "interview": "Interview",
    "announcement": "Announcement",
    "other": "Other",
    "tag": "Tag",
    "tags": "Tags"
  },
  id: {
    // App
    "appName": "Konten",
    "appNameHighlight": "Flow",
    "closeMenu": "Tutup Menu",
    "openMenu": "Buka Menu",
    "searchButton": "Cari",
    "searchNotAvailable": "Pencarian tidak tersedia di halaman ini",
    "errorUpdatingStatus": "Gagal memperbarui status konten. Silakan coba lagi.",
    
    // Dashboard
    "dashboard": "Dashboard",
    "contentBoard": "Papan Konten",
    "calendar": "Kalender",
    "addContent": "Tambah Konten",
    "export": "Ekspor",
    "quickActions": "Aksi Cepat",
    "search": "Cari",
    "clearSearch": "Hapus",
    "settings": "Pengaturan",
    "activeContent": "Konten Aktif",
    "itemsInProgress": "Item dalam proses",
    "contentItemsBeingWorkedOn": "Item konten sedang dikerjakan",
    "noActiveContentItems": "Tidak ada item konten aktif",
    "publishedThisWeek": "Terpublikasi Minggu Ini",
    "last7Days": "7 hari terakhir",
    "itemsPublishedCount": "{{count}} item terpublikasi",
    "noContentPublishedThisWeek": "Tidak ada konten yang dipublikasikan minggu ini",
    "bestPerformer": "Performa Terbaik",
    "mostViewedContent": "Konten paling banyak dilihat",
    "noPublishedContentYet": "Belum ada konten yang dipublikasikan",
    "unfinished": "Belum Selesai",
    "contentToComplete": "Konten untuk diselesaikan",
    "itemsAwaitingCompletion": "{{count}} item menunggu penyelesaian",
    "allContentComplete": "Semua konten telah selesai",
    "contentStatusBreakdown": "Pembagian Status Konten",
    "noContentCreatedYet": "Belum ada konten yang dibuat. Mulai dengan menambahkan ide konten pertama Anda!",
    "reminders": "Pengingat",
    "unfinishedContent": "Konten Belum Selesai",
    "unfinishedContentMessage": "Anda memiliki {{count}} item konten yang belum selesai. Periksa papan konten Anda untuk melanjutkan pekerjaan.",
    "readyToPublishMessage": "Anda memiliki {{count}} item siap dipublikasikan. Periksa kalender Anda untuk menjadwalkannya.",
    
    // Content Board
    "idea": "Ide",
    "script": "Naskah",
    "recorded": "Direkam",
    "edited": "Diedit",
    "readyToPublish": "Siap Publikasi",
    "published": "Terpublikasi",
    "noContent": "Tidak ada konten dalam status ini",
    "filterByPlatform": "Filter berdasarkan Platform",
    "addIdea": "Tambah Ide",
    
    // Content Form
    "title": "Judul",
    "platform": "Platform",
    "platforms": "Platform",
    "status": "Status",
    "publicationDate": "Tanggal Publikasi",
    "notes": "Catatan",
    "additionalInfo": "Informasi atau konteks tambahan untuk konten ini.",
    "referenceLink": "Tautan Referensi",
    "scriptFile": "Berkas Naskah",
    "scriptContent": "Naskah",
    "productionNotes": "Catatan Produksi",
    "equipmentUsed": "Peralatan yang Digunakan",
    "contentFiles": "Berkas Konten",
    "selectTags": "Pilih tag...",
    "selected": "terpilih",
    "submit": "Kirim",
    "selectPlatforms": "Pilih platform...",
    "searchPlatforms": "Cari platform...",
    "noPlatformFound": "Platform tidak ditemukan.",
    "basicInfo": "Informasi Dasar",
    "contentDetails": "Detail Konten",
    "production": "Informasi Produksi",
    
    // Content Details
    "edit": "Edit Konten",
    "delete": "Hapus",
    "confirmDelete": "Apakah Anda yakin?",
    "deleteWarning": "Tindakan ini tidak dapat dibatalkan. Ini akan menghapus konten ini secara permanen.",
    "cancel": "Batal",
    "created": "Dibuat",
    "contentChecklist": "Daftar Konten",
    "intro": "Pendahuluan",
    "mainPoints": "Poin Utama/Konten",
    "callToAction": "Ajakan Bertindak",
    "outro": "Penutup",
    "publishing": "Penerbitan",
    "performance": "Metrik Kinerja",
    "views": "Tampilan",
    "likes": "Suka",
    "comments": "Komentar",
    "shares": "Berbagi",
    "rating": "Penilaian Anda",
    "insights": "Wawasan Kinerja",
    
    // Settings
    "appSettings": "Pengaturan Aplikasi",
    "customization": "Kustomisasi",
    "manageOptions": "Kelola Opsi",
    "platformOptions": "Opsi Platform",
    "tagOptions": "Opsi Tag",
    "addNew": "Tambah Baru",
    "editSelected": "Edit Terpilih",
    "deleteSelected": "Hapus Terpilih",
    "confirmAction": "Konfirmasi Tindakan",
    "name": "Nama",
    "save": "Simpan",
    "enterName": "Masukkan nama",
    "selectOption": "Pilih opsi",
    "manageContent": "Kelola Konten",
    "exportData": "Ekspor Data",
    "importData": "Impor Data",
    "backupRestore": "Cadangan & Pemulihan",
    "confirmResetWarning": "Ini akan menghapus semua opsi kustom. Opsi default akan dipulihkan.",
    "reset": "Atur Ulang",
    "actions": "Tindakan",
    
    // Language
    "language": "Bahasa",
    "toggleLanguage": "Ganti Bahasa",
    "selectLanguage": "Pilih Bahasa",
    
    // History
    "statusHistory": "Riwayat Status",
    "movedFrom": "Dipindahkan dari",
    "to": "ke",
    "createdAs": "Dibuat sebagai",
    "noHistory": "Tidak ada riwayat status tersedia",
    "moveTo": "Pindahkan ke",
    
    // General
    "all": "Semua",
    "searchResults": "Hasil Pencarian",
    "noResults": "Tidak ada konten yang cocok dengan pencarian Anda",
    "pickDate": "Pilih tanggal",
    "noTagFound": "Tag tidak ditemukan.",
    "searchTags": "Cari tag...",
    "education": "Pendidikan",
    "entertainment": "Hiburan",
    "promotion": "Promosi",
    "tutorial": "Tutorial",
    "review": "Ulasan",
    "vlog": "Vlog",
    "interview": "Wawancara",
    "announcement": "Pengumuman",
    "other": "Lainnya",
    "tag": "Tag",
    "tags": "Tag"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Default to Indonesian, use saved language if available
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'id';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
