
import { useState } from "react";
import { ContentBoard } from "@/components/ContentBoard";
import { Header } from "@/components/Header";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentForm } from "@/components/ContentForm";
import { LanguageSelector } from "@/components/ui/language-selector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentItem, Platform } from "@/types/content";

export default function ContentBoardPage() {
  const { contentItems } = useContent();
  const { t } = useLanguage();
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<Platform | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Get unique platforms from content items
  const allContentItems = contentItems || [];
  const platforms = ["All", ...Array.from(new Set(allContentItems.map(item => item.platform)))] as (Platform | "All")[];
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setIsSearching(false);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    let results = allContentItems.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.platform.toLowerCase().includes(lowerQuery) ||
      item.status.toLowerCase().includes(lowerQuery) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) ||
      (item.notes && item.notes.toLowerCase().includes(lowerQuery))
    );
    
    // Apply platform filter if active
    if (platformFilter !== "All") {
      results = results.filter(item => item.platform === platformFilter);
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1 container py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">{t("contentBoard")}</h1>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <LanguageSelector 
              language={useLanguage().language} 
              setLanguage={useLanguage().setLanguage} 
            />
            <Select 
              value={platformFilter} 
              onValueChange={(value) => handlePlatformFilterChange(value as Platform | "All")}
            >
              <SelectTrigger className="w-[180px] rounded-xl">
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
            
            <Button 
              onClick={() => setIsAddingContent(true)}
              className="rounded-xl transition-all hover:shadow-lg"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t("addContent")}
            </Button>
          </div>
        </div>

        {/* Main Content Board */}
        <ContentBoard />
      </main>
      
      {/* Add Content Dialog */}
      {isAddingContent && (
        <Dialog open={isAddingContent} onOpenChange={setIsAddingContent}>
          <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto glassmorphism">
            <DialogHeader>
              <DialogTitle>{t("addContent")}</DialogTitle>
            </DialogHeader>
            <ContentForm 
              onClose={() => setIsAddingContent(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
