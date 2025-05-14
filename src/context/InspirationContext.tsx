
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ContentInspiration,
  ContentInspirationCategory,
  InspirationContextType,
  InspirationSource
} from '@/types/inspiration';
import { 
  fetchInspirations,
  addInspiration,
  updateInspiration,
  deleteInspiration,
  exportToCSV as exportInspirationToCSV,
  getInspirationById as getInspirationByIdService
} from '@/services/inspirationService';
import { toast } from 'sonner';

// Create context
const InspirationContext = createContext<InspirationContextType | undefined>(undefined);

// Default categories and sources
const defaultCategories: ContentInspirationCategory[] = [
  "Product Review",
  "Tutorial",
  "Interview",
  "Behind the Scenes",
  "Trends",
  "Case Study",
  "Q&A",
  "User Generated",
  "Educational",
  "Entertainment",
  "Promotional",
  "Informative",
  "Other"
];

const defaultSourceTypes: InspirationSource[] = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitter",
  "LinkedIn",
  "Pinterest",
  "Facebook",
  "Blog",
  "Other"
];

// Provider component
export const InspirationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inspirations, setInspirations] = useState<ContentInspiration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [categories, setCategories] = useState<ContentInspirationCategory[]>(defaultCategories);
  const [sourceTypes] = useState<InspirationSource[]>(defaultSourceTypes);

  // Load inspirations on component mount
  useEffect(() => {
    const loadInspirations = async () => {
      try {
        setIsLoading(true);
        const data = await fetchInspirations();
        setInspirations(data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err);
        setIsLoading(false);
        toast.error("Failed to load inspirations");
      }
    };

    loadInspirations();
  }, []);

  // Add new inspiration
  const addInspirationItem = async (item: Omit<ContentInspiration, "id" | "createdAt" | "updatedAt">) => {
    try {
      const id = await addInspiration(item);
      const newInspiration: ContentInspiration = {
        ...item,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setInspirations([newInspiration, ...inspirations]);
      toast.success("Inspiration added successfully");
      return id;
    } catch (err: any) {
      setError(err);
      toast.error("Failed to add inspiration");
      throw err;
    }
  };

  // Update existing inspiration
  const updateInspirationItem = async (id: string, updates: Partial<ContentInspiration>) => {
    try {
      await updateInspiration(id, updates);
      
      setInspirations(inspirations.map(item => 
        item.id === id 
          ? { ...item, ...updates, updatedAt: new Date() } 
          : item
      ));
      
      toast.success("Inspiration updated successfully");
    } catch (err: any) {
      setError(err);
      toast.error("Failed to update inspiration");
      throw err;
    }
  };

  // Delete inspiration
  const deleteInspirationItem = async (id: string) => {
    try {
      await deleteInspiration(id);
      setInspirations(inspirations.filter(item => item.id !== id));
      toast.success("Inspiration deleted successfully");
    } catch (err: any) {
      setError(err);
      toast.error("Failed to delete inspiration");
      throw err;
    }
  };

  // Get inspiration by ID
  const getInspirationById = (id: string) => {
    return inspirations.find(item => item.id === id);
  };

  // Add custom category
  const addCustomCategory = (category: ContentInspirationCategory) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
      toast.success(`Category "${category}" added successfully`);
    }
  };

  // Export to CSV
  const handleExportToCSV = () => {
    try {
      exportInspirationToCSV(inspirations);
      toast.success("Exported successfully");
    } catch (err: any) {
      setError(err);
      toast.error("Failed to export data");
    }
  };

  const value: InspirationContextType = {
    inspirations,
    isLoading,
    error,
    categories,
    sourceTypes,
    addInspiration: addInspirationItem,
    updateInspiration: updateInspirationItem,
    deleteInspiration: deleteInspirationItem,
    getInspirationById,
    addCustomCategory,
    exportToCSV: handleExportToCSV
  };

  return (
    <InspirationContext.Provider value={value}>
      {children}
    </InspirationContext.Provider>
  );
};

// Custom hook to use the inspiration context
export const useInspiration = () => {
  const context = useContext(InspirationContext);
  if (context === undefined) {
    throw new Error('useInspiration must be used within an InspirationProvider');
  }
  return context;
};
