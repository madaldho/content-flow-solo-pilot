
import { useState, useEffect } from "react";
import { ContentBoard } from "@/components/ContentBoard";
import { Header } from "@/components/Header";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentItem, Platform } from "@/types/content";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1 container py-4 md:py-6 space-y-4 md:space-y-6 px-3 md:px-4">
        <div className="relative overflow-hidden rounded-xl mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 opacity-90"></div>
          <div className="relative z-10 p-6 md:p-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("contentBoard")}</h1>
            <p className="text-violet-100 max-w-2xl">Visualize and organize your content pipeline across all platforms.</p>
            
            <div className="flex flex-col xs:flex-row items-center gap-4 mt-6 w-full sm:w-auto max-w-2xl">
              <div className="relative w-full xs:w-64">
                <Input
                  id="content-search"
                  type="search"
                  placeholder={t("search")}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 rounded-lg w-full border-white/30 bg-white/20 text-white placeholder:text-white/70 focus-visible:ring-white/50"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
              </div>
              
              <Select 
                value={platformFilter} 
                onValueChange={(value) => handlePlatformFilterChange(value as Platform | "All")}
              >
                <SelectTrigger className="w-full xs:w-48 rounded-lg border-white/30 bg-white/20 text-white focus:ring-white/50">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={t("filterByPlatform")} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-violet-200 dark:border-violet-800/30 rounded-lg">
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform === "All" ? t("all") : platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mb-32 -mr-32"></div>
          <div className="absolute top-0 right-20 w-20 h-20 bg-purple-300 opacity-20 rounded-full -mt-10"></div>
        </div>

        {/* Main Content Board */}
        <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl shadow-md backdrop-blur-sm border border-indigo-100 dark:border-indigo-900/30">
          <ContentBoard />
        </div>
      </main>
    </div>
  );
}
