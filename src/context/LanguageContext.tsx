
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
    // Dashboard
    "dashboard": "Dashboard",
    "contentBoard": "Content Board",
    "calendar": "Calendar",
    "addContent": "Add Content",
    "export": "Export",
    "quickActions": "Quick Actions",
    "search": "Search",
    "clearSearch": "Clear",
    
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
    "status": "Status",
    "publicationDate": "Publication Date",
    "notes": "Notes",
    "additionalInfo": "Additional information or context for this content.",
    "referenceLink": "Reference Link",
    "scriptFile": "Script File",
    "script": "Script",
    "productionNotes": "Production Notes",
    "equipmentUsed": "Equipment Used",
    "contentFiles": "Content Files",
    "tags": "Tags",
    "selectTags": "Select tags...",
    "submit": "Submit",
    
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
    
    // General
    "all": "All",
    "searchResults": "Search Results",
    "noResults": "No content matches your search",
    "pickDate": "Pick a date",
    "noTagFound": "No tag found.",
    "searchTags": "Search tags..."
  },
  id: {
    // Dashboard
    "dashboard": "Dashboard",
    "contentBoard": "Papan Konten",
    "calendar": "Kalender",
    "addContent": "Tambah Konten",
    "export": "Ekspor",
    "quickActions": "Aksi Cepat",
    "search": "Cari",
    "clearSearch": "Hapus",
    
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
    "status": "Status",
    "publicationDate": "Tanggal Publikasi",
    "notes": "Catatan",
    "additionalInfo": "Informasi atau konteks tambahan untuk konten ini.",
    "referenceLink": "Tautan Referensi",
    "scriptFile": "Berkas Naskah",
    "script": "Naskah",
    "productionNotes": "Catatan Produksi",
    "equipmentUsed": "Peralatan yang Digunakan",
    "contentFiles": "Berkas Konten",
    "tags": "Tag",
    "selectTags": "Pilih tag...",
    "submit": "Kirim",
    
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
    
    // General
    "all": "Semua",
    "searchResults": "Hasil Pencarian",
    "noResults": "Tidak ada konten yang cocok dengan pencarian Anda",
    "pickDate": "Pilih tanggal",
    "noTagFound": "Tag tidak ditemukan.",
    "searchTags": "Cari tag..."
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
    // Use browser language preference or default to English
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || ((navigator.language.startsWith('id') ? 'id' : 'en') as Language);
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
