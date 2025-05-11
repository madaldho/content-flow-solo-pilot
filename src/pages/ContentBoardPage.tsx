
import { useState, useEffect } from "react";
import { ContentBoard } from "@/components/ContentBoard";
import { Header } from "@/components/Header";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentItem, Platform } from "@/types/content";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ContentBoardPage() {
  const { contentItems } = useContent();
  const { t } = useLanguage();
  const [platformFilter, setPlatformFilter] = useState<Platform | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const isMobile = useIsMobile();
  
  // Ensure contentItems is always an array
  const allContentItems = Array.isArray(contentItems) ? contentItems : [];
  
  // Get unique platforms from content items
  const platforms = ["All", ...Array.from(new Set(allContentItems.flatMap(item => 
    Array.isArray(item.platforms) ? item.platforms : [item.platform]
  )))] as (Platform | "All")[];
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setIsSearching(false);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    let results = allContentItems.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      (item.platforms && item.platforms.some(p => p.toLowerCase().includes(lowerQuery))) ||
      item.platform.toLowerCase().includes(lowerQuery) ||
      item.status.toLowerCase().includes(lowerQuery) ||
      (Array.isArray(item.tags) && item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) ||
      (item.notes && item.notes.toLowerCase().includes(lowerQuery))
    );
    
    // Apply platform filter if active
    if (platformFilter !== "All") {
      results = results.filter(item => 
        (item.platforms && item.platforms.includes(platformFilter)) || 
        item.platform === platformFilter
      );
    }
    
    setSearchResults(results);
    setIsSearching(true);
  };
  
  const handlePlatformFilterChange = (platform: Platform | "All") => {
    setPlatformFilter(platform);
    
    // If search query exists, filter search results
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  useEffect(() => {
    // Auto-focus search input on desktop
    if (!isMobile) {
      const searchInput = document.getElementById('content-search');
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [isMobile]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1 container py-4 md:py-6 space-y-4 md:space-y-6 px-3 md:px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glassmorphism p-3 md:p-4 rounded-xl shadow-sm">
          <h1 className="text-xl md:text-2xl font-medium">{t("contentBoard")}</h1>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Input
                id="content-search"
                type="search"
                placeholder={t("search")}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 rounded-xl w-full sm:w-[220px]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            <Select 
              value={platformFilter} 
              onValueChange={(value) => handlePlatformFilterChange(value as Platform | "All")}
            >
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                <SelectValue placeholder={t("filterByPlatform")} />
              </SelectTrigger>
              <SelectContent className="glassmorphism rounded-xl">
                {platforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform === "All" ? t("all") : platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content Board */}
        <ContentBoard />
      </main>
    </div>
  );
}
