
import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { useInspiration } from "@/context/InspirationContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { InspirationGallery } from "@/components/InspirationGallery";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, Plus, Search, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ContentInspirationCategory, InspirationSource } from "@/types/inspiration";

export default function InspirationPage() {
  const { inspirations, sourceTypes, categories, exportToCSV } = useInspiration();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(!isMobile);

  // Stats for each tab
  const allCount = inspirations.length;
  const favoritesCount = inspirations.filter(item => item.isFavorite).length;

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle source filter change
  const handleSourceChange = (value: string) => {
    setSelectedSource(value === "all" ? undefined : value);
  };

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? undefined : value);
  };

  // Toggle filters visibility on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Content Inspirations</h1>
              <p className="text-muted-foreground">
                Curate and organize content ideas from various sources
              </p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="flex-grow sm:flex-grow-0"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              
              <Button 
                onClick={() => navigate("/inspiration/new")}
                className="flex-grow sm:flex-grow-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New
              </Button>
            </div>
          </div>
          
          {/* Tabs and Filters */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <Tabs defaultValue="all" className="w-full sm:w-auto">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="all" className="flex-1 sm:flex-none">
                      All
                      <Badge variant="secondary" className="ml-2">
                        {allCount}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="favorites" 
                      className="flex-1 sm:flex-none"
                      onClick={() => setShowFavorites(true)}
                    >
                      Favorites
                      <Badge variant="secondary" className="ml-2">
                        {favoritesCount}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search inspirations..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </div>
                  
                  {isMobile && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={toggleFilters}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Select onValueChange={handleSourceChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      {sourceTypes.map((source) => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center">
                    <Button 
                      variant={showFavorites ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => setShowFavorites(!showFavorites)}
                    >
                      <Star 
                        className={`h-4 w-4 mr-1 ${showFavorites ? "fill-white" : ""}`} 
                      />
                      {showFavorites ? "Showing Favorites" : "Show Favorites"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="mt-6">
            <TabsContent value="all" className="m-0">
              <InspirationGallery
                filter={{
                  sourceType: selectedSource,
                  category: selectedCategory,
                  favorite: showFavorites,
                  searchQuery
                }}
              />
            </TabsContent>
            <TabsContent value="favorites" className="m-0">
              <InspirationGallery
                filter={{
                  sourceType: selectedSource,
                  category: selectedCategory,
                  favorite: true,
                  searchQuery
                }}
              />
            </TabsContent>
          </div>
        </div>
      </div>
    </Layout>
  );
}
