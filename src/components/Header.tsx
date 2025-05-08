
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
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
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <h1 
            className="text-xl font-bold cursor-pointer"
            onClick={() => navigate("/")}
          >
            Content<span className="text-primary">Flow</span>
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
          >
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/content-board")}
          >
            Content Board
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/calendar")}
          >
            Calendar
          </Button>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          {onSearch && (
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="Search..."
                className="w-[150px] lg:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <Button size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          )}
          <ThemeToggle />
        </div>
        
        <div className="md:hidden flex items-center gap-2">
          {onSearch && (
            <Button size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Search className="h-4 w-4" />
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 animate-fade-in">
          {onSearch && (
            <div className="flex w-full items-center space-x-2 mb-4">
              <Input
                type="search"
                placeholder="Search..."
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <Button size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/");
                setIsMenuOpen(false);
              }}
            >
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/content-board");
                setIsMenuOpen(false);
              }}
            >
              Content Board
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/calendar");
                setIsMenuOpen(false);
              }}
            >
              Calendar
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
