
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
  const isEditing = Boolean(id);
  
  useEffect(() => {
    const loadEntry = async () => {
      if (id) {
        try {
          const entry = await sweetSpotService.getEntry(id);
          if (entry) {
            setEditingEntry(entry);
          } else {
            toast.error(t("entryNotFound") || "Entry not found");
            navigate("/sweet-spot");
          }
        } catch (error) {
          console.error("Error loading entry:", error);
          toast.error(t("entryNotFound") || "Entry not found");
          navigate("/sweet-spot");
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
    console.log('🔥 Form handleCreate called with:', entry);
    try {
      console.log('🔥 Calling sweetSpotService.createEntry...');
      const result = await sweetSpotService.createEntry(entry);
      console.log('🔥 Service returned:', result);
      
      toast.success(t("entryAdded") || "Entry added successfully");
      console.log('🔥 Success toast shown, navigating...');
      
      // Add small delay to see the toast
      setTimeout(() => {
        navigate("/sweet-spot");
      }, 1000);
    } catch (error) {
      console.error("❌ Error creating entry:", error);
      toast.error(t("errorCreatingEntry") || "Error creating entry. Please try again.");
    }
  };
  
  // Handle updating an entry
  const handleUpdate = async (id: string, updates: Partial<SweetSpotEntry>) => {
    try {
      await sweetSpotService.updateEntry(id, updates);
      toast.success(t("entryUpdated") || "Entry updated successfully");
      navigate("/sweet-spot");
    } catch (error) {
      console.error("Error updating entry:", error);
      toast.error(t("errorUpdatingEntry") || "Error updating entry");
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
          <SweetSpotForm
            entry={editingEntry}
            onSubmit={isEditing && editingEntry ? 
              (updates) => handleUpdate(editingEntry.id, updates) : 
              handleCreate}
            onCancel={() => navigate("/sweet-spot")}
          />
        </div>
      </div>
    </Layout>
  );
}
