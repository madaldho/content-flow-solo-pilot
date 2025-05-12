
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusIcon, FileText, Search, TrendingUp, Calendar, Compass } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1 container py-4 md:py-6 space-y-4 md:space-y-6 px-3 md:px-4">
        {/* Dashboard Header */}
        <div className="relative overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-90"></div>
          <div className="relative z-10 p-6 md:p-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to Content Hub</h1>
            <p className="text-indigo-100 max-w-2xl">Track, manage, and optimize your content strategy across all platforms from one central dashboard.</p>
            
            <div className="flex flex-wrap gap-3 mt-6">
              <Button 
                onClick={() => navigate("/sweet-spot")}
                className="bg-white text-indigo-700 hover:bg-indigo-50"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Sweet Spot Analysis
              </Button>
              
              <Button 
                onClick={() => exportToCSV()} 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t("export")}
              </Button>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mb-32 -mr-32"></div>
          <div className="absolute top-0 right-20 w-20 h-20 bg-purple-300 opacity-20 rounded-full -mt-10"></div>
        </div>
        
        {/* Search Results */}
        {isSearching && (
          <div className="space-y-4 bg-white dark:bg-slate-800/60 p-5 rounded-xl shadow-md backdrop-blur-sm border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-indigo-800 dark:text-indigo-300">
                {t("searchResults")} ({searchResults.length})
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsSearching(false);
                  setSearchResults([]);
                }}
                className="w-full xs:w-auto justify-center"
              >
                {t("clearSearch")}
              </Button>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 numbered-list">
                {searchResults.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`content-card numbered-item p-4 rounded-lg cursor-pointer transition-all duration-200 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700`}
                    onClick={() => setSelectedContentId(item.id)}
                  >
                    <h3 className="font-medium line-clamp-1">{item.title}</h3>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs">{item.platform}</span>
                      <span className="text-muted-foreground">{t(item.status.toLowerCase().replace(/\s+/g, ""))}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto opacity-20 mb-2" />
                {t("noResults")}
              </div>
            )}
          </div>
        )}
        
        {/* Dashboard Stats */}
        {!isSearching && (
          <>
            <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl shadow-md backdrop-blur-sm border border-indigo-100 dark:border-indigo-900/30">
              <DashboardStats />
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-4 bg-white dark:bg-slate-800/60 p-5 rounded-xl shadow-md backdrop-blur-sm border border-indigo-100 dark:border-indigo-900/30">
              <h2 className="text-xl font-bold text-indigo-800 dark:text-indigo-300">{t("quickActions")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-6 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 hover:shadow-md hover:border-indigo-300"
                  onClick={() => setIsAddingContent(true)}
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <PlusIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{t("addContent")}</div>
                    <div className="text-xs text-muted-foreground">{t("addIdea")}</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-6 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800/50 hover:shadow-md hover:border-purple-300"
                  onClick={() => navigate("/content-board")}
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <Compass className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{t("contentBoard")}</div>
                    <div className="text-xs text-muted-foreground">{t("filterByPlatform")}</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-6 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-white to-fuchsia-50/50 dark:from-slate-800 dark:to-fuchsia-900/20 border border-fuchsia-200 dark:border-fuchsia-800/50 hover:shadow-md hover:border-fuchsia-300"
                  onClick={() => navigate("/calendar")}
                >
                  <div className="w-12 h-12 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/50 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-fuchsia-600 dark:text-fuchsia-300" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{t("calendar")}</div>
                    <div className="text-xs text-muted-foreground">{t("publicationDate")}</div>
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
          <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-indigo-100 dark:border-indigo-800/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-indigo-800 dark:text-indigo-300">{t("addContent")}</DialogTitle>
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
