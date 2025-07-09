
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SweetSpotEntry } from "@/types/sweetSpot";
import { sweetSpotService } from "@/services/sweetSpotService";
import { useLanguage } from "@/context/LanguageContext";
import { SweetSpotForm } from "@/components/SweetSpotForm";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SweetSpotFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [editingEntry, setEditingEntry] = useState<SweetSpotEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = Boolean(id);
  
  useEffect(() => {
    const loadEntry = async () => {
      if (id) {
        try {
          setIsLoading(true);
          const entry = await sweetSpotService.getEntry(id);
          if (entry) {
            setEditingEntry(entry);
          } else {
            toast.error(t("entryNotFound") || "Entry not found");
            navigate("/sweet-spot");
          }
        } catch (error) {
          console.error('Error loading entry:', error);
          toast.error("Failed to load entry");
          navigate("/sweet-spot");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadEntry();
    
    document.title = isEditing ? 
      "Edit Sweet Spot Entry | ContentFlow" : 
      "Add Sweet Spot Entry | ContentFlow";
  }, [id, navigate, t, isEditing]);
  
  // Handle creating a new entry
  const handleCreate = async (entry: Omit<SweetSpotEntry, 'id'>) => {
    try {
      setIsLoading(true);
      await sweetSpotService.createEntry(entry);
      toast.success(t("entryAdded") || "Entry added successfully");
      navigate("/sweet-spot");
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error("Failed to create entry");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle updating an entry
  const handleUpdate = async (id: string, updates: Partial<SweetSpotEntry>) => {
    try {
      setIsLoading(true);
      await sweetSpotService.updateEntry(id, updates);
      toast.success(t("entryUpdated") || "Entry updated successfully");
      navigate("/sweet-spot");
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error("Failed to update entry");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container px-3 md:px-6 py-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/sweet-spot")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToAnalysis") || "Back to Analysis"}
          </Button>
        </div>
      
        <div className="bg-gradient-to-br from-primary/10 to-background p-5 rounded-xl shadow-sm mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            {isEditing ? 
              (t("editSweetSpotEntry") || "Edit Sweet Spot Entry") : 
              (t("addSweetSpotEntry") || "Add Sweet Spot Entry")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 
              (t("updateEntryDetails") || "Update the entry details below") : 
              (t("fillEntryDetails") || "Fill in the details below to add a new entry")}
          </p>
        </div>
        
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : (
            <SweetSpotForm
              entry={editingEntry}
              onSubmit={isEditing && editingEntry ? 
                (updates) => handleUpdate(editingEntry.id, updates) : 
                handleCreate}
              onCancel={() => navigate("/sweet-spot")}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
