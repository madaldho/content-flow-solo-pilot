
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusIcon, FileExport, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentForm } from "@/components/ContentForm";
import { DashboardStats } from "@/components/DashboardStats";
import { ContentItem } from "@/types/content";
import { useContent } from "@/context/ContentContext";
import { Header } from "@/components/Header";
import { ContentDetails } from "@/components/ContentDetails";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const navigate = useNavigate();
  const { contentItems, exportToCSV } = useContent();
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
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1 container py-6 space-y-8">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          <div className="flex items-center gap-2">
            <Button onClick={() => exportToCSV()} variant="outline">
              <FileExport className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button onClick={() => setIsAddingContent(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </div>
        </div>
        
        {/* Search Results */}
        {isSearching && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Search Results ({searchResults.length})
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsSearching(false);
                  setSearchResults([]);
                }}
              >
                Clear
              </Button>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map(item => (
                  <div 
                    key={item.id} 
                    className="content-card"
                    onClick={() => setSelectedContentId(item.id)}
                  >
                    <h3 className="font-medium line-clamp-1">{item.title}</h3>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span>{item.platform}</span>
                      <span className="text-muted-foreground">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No content matches your search
              </div>
            )}
          </div>
        )}
        
        {/* Dashboard Stats */}
        {!isSearching && (
          <>
            <DashboardStats />
            
            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                  onClick={() => setIsAddingContent(true)}
                >
                  <PlusIcon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">Add New Content</div>
                    <div className="text-sm text-muted-foreground">Create a new content idea</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                  onClick={() => navigate("/content-board")}
                >
                  <Search className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">Content Board</div>
                    <div className="text-sm text-muted-foreground">Manage your content workflow</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                  onClick={() => navigate("/calendar")}
                >
                  <Search className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">Publication Calendar</div>
                    <div className="text-sm text-muted-foreground">Schedule your content</div>
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
          <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Content</DialogTitle>
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
