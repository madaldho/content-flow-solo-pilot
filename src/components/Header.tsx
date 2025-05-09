import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, Menu, X, Settings } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/context/LanguageContext";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Jika tidak ada fungsi onSearch yang diberikan, kita bisa menampilkan
      // notifikasi atau animasi di sini untuk memberi tahu pengguna bahwa
      // fitur pencarian tidak tersedia di halaman ini
      setShowSearchResults(true);
      setTimeout(() => setShowSearchResults(false), 3000); // Hilangkan setelah 3 detik
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <h1 
            className="text-xl font-bold cursor-pointer"
            onClick={() => navigate("/")}
          >
            {t("appName")}<span className="text-primary">{t("appNameHighlight")}</span>
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
          >
            {t("dashboard")}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/content-board")}
          >
            {t("contentBoard")}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/calendar")}
          >
            {t("calendar")}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/settings")}
          >
            {t("settings")}
          </Button>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          {/* Selalu tampilkan search box untuk konsistensi */}
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="search"
              placeholder={t("search")}
              className="w-[150px] lg:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Button 
              size="icon" 
              onClick={handleSearch}
              aria-label={t("searchButton")}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <LanguageSelector language={language} setLanguage={setLanguage} variant="icon" />
          <ThemeToggle />
        </div>
        
        <div className="md:hidden flex items-center gap-2">
          {/* Selalu tampilkan search button untuk konsistensi */}
          <Button 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={t("searchButton")}
          >
            <Search className="h-4 w-4" />
          </Button>
          <LanguageSelector language={language} setLanguage={setLanguage} variant="icon" />
          <ThemeToggle />
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 animate-fade-in">
          {/* Selalu tampilkan search box untuk konsistensi */}
          <div className="flex w-full items-center space-x-2 mb-4">
            <Input
              type="search"
              placeholder={t("search")}
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Button 
              size="icon" 
              onClick={handleSearch}
              aria-label={t("searchButton")}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/");
                setIsMenuOpen(false);
              }}
            >
              {t("dashboard")}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/content-board");
                setIsMenuOpen(false);
              }}
            >
              {t("contentBoard")}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/calendar");
                setIsMenuOpen(false);
              }}
            >
              {t("calendar")}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/settings");
                setIsMenuOpen(false);
              }}
            >
              {t("settings")}
            </Button>
          </div>
        </div>
      )}
      
      {/* Notifikasi search tidak aktif */}
      {showSearchResults && !onSearch && (
        <div className="absolute top-16 left-0 right-0 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-2 text-center text-sm animate-fade-in">
          {t("searchNotAvailable")}
        </div>
      )}
    </header>
  );
}
