
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusIcon, FileText, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ContentForm } from "@/components/ContentForm";
import { DashboardStats } from "@/components/DashboardStats";
import { ContentItem } from "@/types/content";
import { useContent } from "@/context/ContentContext";
import { Header } from "@/components/Header";
import { ContentDetails } from "@/components/ContentDetails";
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { contentItems, exportToCSV } = useContent();
  const { t } = useLanguage();
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const results = contentItems.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.platform.toLowerCase().includes(lowerQuery) ||
      item.status.toLowerCase().includes(lowerQuery) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) ||
      (item.notes && item.notes.toLowerCase().includes(lowerQuery))
    );
    
    setSearchResults(results);
    setIsSearching(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1 container py-6 space-y-8">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glassmorphism p-4 rounded-xl shadow-sm">
          <h1 className="text-3xl font-elegant">{t("dashboard")}</h1>
          
          <div className="flex items-center gap-2">
            <Button onClick={() => exportToCSV()} variant="outline" className="rounded-xl">
              <FileText className="h-4 w-4 mr-2" />
              {t("export")}
            </Button>
            
            <Button onClick={() => setIsAddingContent(true)} className="rounded-xl transition-all hover:shadow-lg">
              <PlusIcon className="h-4 w-4 mr-2" />
              {t("addContent")}
            </Button>
          </div>
        </div>
        
        {/* Search Results */}
        {isSearching && (
          <div className="space-y-4 glassmorphism p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-elegant">
                {t("searchResults")} ({searchResults.length})
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsSearching(false);
                  setSearchResults([]);
                }}
              >
                {t("clearSearch")}
              </Button>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 numbered-list">
                {searchResults.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`content-card numbered-item card-hover glassmorphism p-4 rounded-lg cursor-pointer transition-all duration-200 bg-gradient-to-br from-background to-secondary/20 border ${index % 2 === 0 ? 'border-primary/10' : 'border-secondary/40'}`}
                    onClick={() => setSelectedContentId(item.id)}
                  >
                    <h3 className="font-medium line-clamp-1 font-elegant">{item.title}</h3>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span>{item.platform}</span>
                      <span className="text-muted-foreground">{t(item.status.toLowerCase().replace(/\s+/g, ""))}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                {t("noResults")}
              </div>
            )}
          </div>
        )}
        
        {/* Dashboard Stats */}
        {!isSearching && (
          <>
            <div className="glassmorphism p-4 rounded-xl shadow-sm">
              <DashboardStats />
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-4 glassmorphism p-4 rounded-xl shadow-sm">
              <h2 className="text-xl font-elegant">{t("quickActions")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-background to-primary/5 hover:from-background hover:to-primary/10"
                  onClick={() => setIsAddingContent(true)}
                >
                  <PlusIcon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">{t("addContent")}</div>
                    <div className="text-sm text-muted-foreground">{t("addIdea")}</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-background to-secondary/10 hover:from-background hover:to-secondary/20"
                  onClick={() => navigate("/content-board")}
                >
                  <Search className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">{t("contentBoard")}</div>
                    <div className="text-sm text-muted-foreground">{t("filterByPlatform")}</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-background to-accent/10 hover:from-background hover:to-accent/20"
                  onClick={() => navigate("/calendar")}
                >
                  <Search className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">{t("calendar")}</div>
                    <div className="text-sm text-muted-foreground">{t("publicationDate")}</div>
                  </div>
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
      
      {/* Add Content Dialog */}
      {isAddingContent && (
        <Dialog open={isAddingContent} onOpenChange={setIsAddingContent}>
          <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto glassmorphism">
            <DialogHeader>
              <DialogTitle className="font-elegant text-2xl">{t("addContent")}</DialogTitle>
              <DialogDescription>{t("addContentDescription")}</DialogDescription>
            </DialogHeader>
            <ContentForm 
              onClose={() => setIsAddingContent(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Content Details Dialog */}
      <ContentDetails
        contentId={selectedContentId}
        onClose={() => setSelectedContentId(null)}
      />
    </div>
  );
}
