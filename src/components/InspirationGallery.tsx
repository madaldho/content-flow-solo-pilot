
import React, { useState } from "react";
import { useInspiration } from "@/context/InspirationContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Link, Pencil, Star, Trash2, Image, Copy } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { ContentInspiration } from "@/types/inspiration";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const sourceIconMap: Record<string, string> = {
  Instagram: "instagram",
  TikTok: "tiktok",
  YouTube: "youtube",
  Twitter: "twitter",
  LinkedIn: "linkedin",
  Pinterest: "pinterest",
  Facebook: "facebook",
  Blog: "blog",
  Other: "globe"
};

interface InspirationGalleryProps {
  filter?: {
    sourceType?: string;
    category?: string;
    favorite?: boolean;
    searchQuery?: string;
  };
}

export const InspirationGallery: React.FC<InspirationGalleryProps> = ({ filter = {} }) => {
  const { inspirations, deleteInspiration, updateInspiration } = useInspiration();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [viewInspiration, setViewInspiration] = useState<ContentInspiration | null>(null);

  // Filter inspirations based on filter props
  const filteredInspirations = inspirations.filter(item => {
    // Filter by source type
    if (filter.sourceType && item.sourceType !== filter.sourceType) {
      return false;
    }
    
    // Filter by category
    if (filter.category && !item.categories.includes(filter.category as any)) {
      return false;
    }
    
    // Filter by favorites
    if (filter.favorite && !item.isFavorite) {
      return false;
    }
    
    // Filter by search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        (item.description?.toLowerCase().includes(query) || false) ||
        item.sourceAccount.toLowerCase().includes(query) ||
        item.sourceType.toLowerCase().includes(query) ||
        (item.notes?.toLowerCase().includes(query) || false)
      );
    }
    
    return true;
  });

  const handleToggleFavorite = async (id: string, currentState: boolean | undefined) => {
    try {
      await updateInspiration(id, { isFavorite: !currentState });
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      "Product Review": "bg-blue-500 hover:bg-blue-600",
      "Tutorial": "bg-green-500 hover:bg-green-600",
      "Interview": "bg-purple-500 hover:bg-purple-600",
      "Behind the Scenes": "bg-amber-500 hover:bg-amber-600",
      "Trends": "bg-pink-500 hover:bg-pink-600",
      "Case Study": "bg-indigo-500 hover:bg-indigo-600",
      "Q&A": "bg-orange-500 hover:bg-orange-600",
      "User Generated": "bg-teal-500 hover:bg-teal-600",
      "Educational": "bg-cyan-500 hover:bg-cyan-600",
      "Entertainment": "bg-rose-500 hover:bg-rose-600",
      "Promotional": "bg-violet-500 hover:bg-violet-600",
      "Informative": "bg-emerald-500 hover:bg-emerald-600",
      "Other": "bg-gray-500 hover:bg-gray-600"
    };
    
    return colors[category] || "bg-gray-500 hover:bg-gray-600";
  };

  if (filteredInspirations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Image className="w-16 h-16 mb-4 text-gray-400" />
        <h3 className="text-lg font-medium">No inspirations found</h3>
        <p className="text-muted-foreground mt-2">
          {filter.searchQuery 
            ? "Try adjusting your search or filters" 
            : "Add some inspirations to get started"}
        </p>
        <Button 
          className="mt-4" 
          onClick={() => navigate("/inspiration/new")}
        >
          Add New Inspiration
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredInspirations.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-2">
                  <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <span className="font-medium">{item.sourceAccount}</span>
                    <span className="mx-1">•</span>
                    <span>{item.sourceType}</span>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleFavorite(item.id, item.isFavorite)}
                  className={`flex-shrink-0 ${item.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
                >
                  <Star className={`h-5 w-5 ${item.isFavorite ? 'fill-yellow-500' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-2">
              {item.screenshotUrl && (
                <div className="mb-3 rounded-md overflow-hidden border">
                  <AspectRatio ratio={16/9}>
                    <img 
                      src={item.screenshotUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                </div>
              )}
              
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
              )}
              
              <div className="flex flex-wrap gap-1 mb-1">
                {item.categories.slice(0, 3).map((category, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
                {item.categories.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.categories.length - 3}
                  </Badge>
                )}
              </div>
              
              {item.niche && (
                <Badge variant="outline" className="text-xs mt-1">
                  Niche: {item.niche}
                </Badge>
              )}
            </CardContent>
            
            <CardFooter className="p-2 pt-0 flex justify-between gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setViewInspiration(item)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyToClipboard(item.title)}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/inspiration/edit/${item.id}`)}
                className="flex-1"
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Inspiration</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this inspiration? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={() => deleteInspiration(item.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Inspiration Detail Modal */}
      {viewInspiration && (
        <AlertDialog open={!!viewInspiration} onOpenChange={() => setViewInspiration(null)}>
          <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center justify-between">
                <span>{viewInspiration.title}</span>
                <Button
                  variant="ghost" 
                  size="sm"
                  className={`${viewInspiration.isFavorite ? 'text-yellow-500' : ''}`}
                  onClick={() => handleToggleFavorite(viewInspiration.id, viewInspiration.isFavorite)}
                >
                  <Star className={`h-5 w-5 mr-1 ${viewInspiration.isFavorite ? 'fill-yellow-500' : ''}`} />
                  {viewInspiration.isFavorite ? 'Favorited' : 'Add to Favorites'}
                </Button>
              </AlertDialogTitle>
            </AlertDialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {viewInspiration.screenshotUrl ? (
                  <div className="rounded-md overflow-hidden border mb-4">
                    <AspectRatio ratio={16/9}>
                      <img 
                        src={viewInspiration.screenshotUrl} 
                        alt={viewInspiration.title}
                        className="w-full h-full object-cover" 
                      />
                    </AspectRatio>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 bg-muted rounded-md mb-4">
                    <Image className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Source Information</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Account:</span>
                      <span className="text-sm">{viewInspiration.sourceAccount}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Platform:</span>
                      <span className="text-sm">{viewInspiration.sourceType}</span>
                    </div>
                    {viewInspiration.sourceUrl && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Link:</span>
                        <a 
                          href={viewInspiration.sourceUrl}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          Visit <Link className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                {viewInspiration.categories.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-1">
                      {viewInspiration.categories.map((category, idx) => (
                        <Badge key={idx} variant="secondary">{category}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {viewInspiration.tags && viewInspiration.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {viewInspiration.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="bg-muted p-3 rounded-md text-sm">
                    {viewInspiration.description || "No description provided"}
                  </p>
                </div>
                
                {viewInspiration.notes && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Notes</h3>
                    <p className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
                      {viewInspiration.notes}
                    </p>
                  </div>
                )}
                
                {viewInspiration.niche && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Niche</h3>
                    <Badge variant="outline">{viewInspiration.niche}</Badge>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Copy Content</h3>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <Input 
                        value={viewInspiration.title} 
                        readOnly 
                        className="flex-grow"
                      />
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="ml-2"
                        onClick={() => handleCopyToClipboard(viewInspiration.title)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {viewInspiration.description && (
                      <div className="flex items-center">
                        <Input 
                          value={viewInspiration.description} 
                          readOnly 
                          className="flex-grow"
                        />
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="ml-2"
                          onClick={() => handleCopyToClipboard(viewInspiration.description)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {viewInspiration.sourceUrl && (
                      <div className="flex items-center">
                        <Input 
                          value={viewInspiration.sourceUrl} 
                          readOnly 
                          className="flex-grow"
                        />
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="ml-2"
                          onClick={() => handleCopyToClipboard(viewInspiration.sourceUrl)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel>Close</AlertDialogCancel>
              <Button
                onClick={() => {
                  setViewInspiration(null);
                  navigate(`/inspiration/edit/${viewInspiration.id}`);
                }}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};
