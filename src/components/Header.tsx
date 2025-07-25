
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, Menu, X, Settings, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/context/LanguageContext";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = () => {
    signOut();
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
      setIsSearchOpen(false);
    } else {
      // If no search function is provided, show a notification
      setShowSearchResults(true);
      setTimeout(() => setShowSearchResults(false), 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Close menu when route changes
  useEffect(() => {
    return () => setIsMenuOpen(false);
  }, [navigate]);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-14 md:h-16 items-center justify-between">
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

        <div className="hidden md:flex items-center gap-2 md:gap-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="rounded-xl"
          >
            {t("dashboard")}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/content-board")}
            className="rounded-xl"
          >
            {t("contentBoard")}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/calendar")}
            className="rounded-xl"
          >
            {t("calendar")}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/sweet-spot")}
            className="rounded-xl"
          >
            {t("sweetSpot") || "Sweet Spot"}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/settings")}
            className="rounded-xl"
          >
            {t("settings")}
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="rounded-xl text-red-600 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
        
        <div className="hidden md:flex items-center gap-2 md:gap-4">
          {/* Search box for desktop */}
          <div className="relative flex w-full max-w-sm items-center space-x-2">
            <Input
              type="search"
              placeholder={t("search")}
              className="w-[150px] lg:w-[250px] pl-9 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" 
              aria-hidden="true"
            />
          </div>
          <LanguageSelector language={language} setLanguage={setLanguage} variant="icon" />
          <ThemeToggle />
        </div>
        
        <div className="md:hidden flex items-center gap-2">
          {/* Mobile search button */}
          <Button 
            size="icon" 
            variant="ghost"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label={t("searchButton")}
          >
            <Search className="h-4 w-4" />
          </Button>
          <LanguageSelector language={language} setLanguage={setLanguage} variant="icon" />
          <ThemeToggle />
        </div>
      </div>
      
      {/* Mobile search input */}
      {isSearchOpen && (
        <div className="md:hidden px-4 py-2 border-t border-border/50 animate-slideDown">
          <div className="flex w-full items-center space-x-2">
            <Input
              type="search"
              placeholder={t("search")}
              className="w-full rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
            />
            <Button 
              size="icon" 
              onClick={handleSearch}
              aria-label={t("searchButton")}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 animate-fade border-t border-border/50">
          <div className="flex flex-col gap-2 py-2">
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
                navigate("/sweet-spot");
                setIsMenuOpen(false);
              }}
            >
              {t("sweetSpot") || "Sweet Spot"}
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
      
      {/* Search not available notification */}
      {showSearchResults && !onSearch && (
        <div className="absolute top-16 left-0 right-0 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-2 text-center text-sm animate-fade">
          {t("searchNotAvailable")}
        </div>
      )}
    </header>
  );
}
