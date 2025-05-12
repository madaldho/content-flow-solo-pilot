import { Platform } from "@/types/content";

// Warna untuk setiap platform sesuai dengan identitas mereka
export const platformColors: Record<string, string> = {
  "YouTube": "#FF0000", // Merah
  "TikTok": "#000000", // Hitam
  "Instagram": "#E1306C", // Merah muda keunguan
  "Twitter": "#1DA1F2", // Biru Twitter
  "Facebook": "#4267B2", // Biru Facebook
  "LinkedIn": "#0077B5", // Biru LinkedIn
  "Blog": "#FF5722", // Oranye
  "Podcast": "#8E44AD", // Ungu
  "Reddit": "#FF4500", // Oranye Reddit
  "Pinterest": "#E60023", // Merah Pinterest
  "Snapchat": "#FFFC00", // Kuning Snapchat
  "Twitch": "#6441A4", // Ungu Twitch
  "Other": "#718096", // Abu-abu
};

// Emoji ikon untuk setiap platform
export const platformIcons: Record<string, string> = {
  "YouTube": "📺",
  "TikTok": "📱",
  "Instagram": "📷",
  "Twitter": "🐦",
  "Facebook": "👍",
  "LinkedIn": "💼",
  "Blog": "📝",
  "Podcast": "🎙️",
  "Reddit": "🤖",
  "Pinterest": "📌",
  "Snapchat": "👻",
  "Twitch": "🎮",
  "Other": "📄",
};

// Mendapatkan warna platform dengan fallback ke Default
export const getPlatformColor = (platform: string): string => {
  return platformColors[platform] || platformColors["Other"];
};

// Mendapatkan ikon platform dengan fallback ke Default
export const getPlatformIcon = (platform: string): string => {
  return platformIcons[platform] || platformIcons["Other"];
};

// Mendapatkan warna latar yang lebih transparan untuk badges
export const getPlatformBgColor = (platform: string): string => {
  const color = getPlatformColor(platform);
  return `${color}20`; // Menambahkan 20 (12.5% opacity) di akhir warna hex
};

// Mendapatkan warna teks yang kontras dengan warna platform
export const getPlatformTextColor = (platform: string): string => {
  const color = getPlatformColor(platform);
  // Warna yang lebih gelap menggunakan teks putih, yang lebih terang menggunakan teks hitam
  const darkColors = ["#FF0000", "#000000", "#E1306C", "#0077B5", "#E60023", "#6441A4"];
  return darkColors.includes(color) ? "#FFFFFF" : "#000000";
}; 