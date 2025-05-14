import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, Menu, X, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/context/LanguageContext";
import { NavLink, Link } from "react-router-dom";
import { MobileSidebarLink } from "@/components/ui/mobile-sidebar-link";
import { Layers, LayoutDashboard, ListTodo, CalendarDays, Target, Image } from "lucide-react";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = window.innerWidth <= 768;

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
    <header className="sticky top-0 z-40 border-b shadow-sm bg-background/95 backdrop-blur">
      <nav className="flex h-16 items-center justify-between px-4">
        {/* Logo and menu */}
        <div className="flex items-center gap-2">
          {/* Mobile menu toggle */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-1 rounded-full"
            >
              {isSidebarOpen ? <X /> : <Menu />}
            </Button>
          )}
          
          {/* Logo/Brand */}
          <Link 
            to="/" 
            className="flex items-center gap-2 font-medium text-xl"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Layers className="h-6 w-6" />
            <span className="hidden sm:inline-block">ContentFusion</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/content-board">Content Board</NavLink>
          <NavLink to="/calendar">Calendar</NavLink>
          <NavLink to="/sweet-spot">Sweet Spot</NavLink>
          <NavLink to="/inspiration">Inspiration</NavLink>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-2">
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
      </nav>
      
      {/* Mobile Sidebar */}
      {isMobile && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-200 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        >
          <div 
            className={`fixed inset-y-0 left-0 w-64 bg-background p-4 shadow-xl transition-transform duration-200 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1 mt-4">
              <MobileSidebarLink to="/" icon={<LayoutDashboard size={20} />}>
                Dashboard
              </MobileSidebarLink>
              <MobileSidebarLink to="/content-board" icon={<ListTodo size={20} />}>
                Content Board
              </MobileSidebarLink>
              <MobileSidebarLink to="/calendar" icon={<CalendarDays size={20} />}>
                Calendar
              </MobileSidebarLink>
              <MobileSidebarLink to="/sweet-spot" icon={<Target size={20} />}>
                Sweet Spot
              </MobileSidebarLink>
              <MobileSidebarLink to="/inspiration" icon={<Image size={20} />}>
                Inspiration
              </MobileSidebarLink>
              <MobileSidebarLink to="/settings" icon={<Settings size={20} />}>
                Settings
              </MobileSidebarLink>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile search button */}
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
