
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SweetSpotEntry, SweetSpotAnalysis } from "@/types/sweetSpot";
import { sweetSpotService } from "@/services/sweetSpotService";
import { Button } from "@/components/ui/button";
import { SweetSpotTable } from "@/components/SweetSpotTable";
import { SweetSpotSummary } from "@/components/SweetSpotSummary";
import { useLanguage } from "@/context/LanguageContext";
import { Eye, EyeOff, Plus, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";

export default function SweetSpotAnalysisPage() {
  const [entries, setEntries] = useState<SweetSpotEntry[]>([]);
  const [analysis, setAnalysis] = useState<SweetSpotAnalysis | null>(null);
  const [showExampleData, setShowExampleData] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Load data and calculate analysis
  const loadData = () => {
    const data = sweetSpotService.getData();
    setEntries(data);
    setAnalysis(sweetSpotService.calculateAnalysis(data));
  };
  
  useEffect(() => {
    loadData();
    document.title = "Sweet Spot Analysis | ContentFlow";
  }, []);
  
  // Toggle example data visibility
  const toggleExampleData = () => {
    setShowExampleData(!showExampleData);
  };
  
  // Navigate to add form
  const handleAdd = () => {
    navigate("/sweet-spot/new");
  };
  
  // Navigate to edit form
  const handleEdit = (entry: SweetSpotEntry) => {
    navigate(`/sweet-spot/edit/${entry.id}`);
  };
  
  // Show delete confirmation
  const handleConfirmDelete = (id: string) => {
    setDeleteConfirmId(id);
  };
  
  // Handle deleting an entry
  const handleDelete = () => {
    if (deleteConfirmId) {
      sweetSpotService.deleteEntry(deleteConfirmId);
      toast.success(t("entryDeleted") || "Entry deleted successfully");
      loadData();
      setDeleteConfirmId(null);
    }
  };
  
  // Get example data for reference
  const exampleData = sweetSpotService.getExampleData();
  const exampleAnalysis = sweetSpotService.calculateAnalysis(exampleData);
  
  return (
    <Layout>
      <div className="container px-3 md:px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="bg-gradient-to-br from-primary/10 to-background p-4 rounded-xl shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold">
              {t("sweetSpot") || "Sweet Spot Analysis"}
            </h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              {t("sweetSpotDescription") || "Analyze your target audience and potential reach across different niches"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleAdd}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("addNewEntry") || "Add New Entry"}
            </Button>
            
            <Button 
              variant="outline"
              onClick={toggleExampleData}
              className="flex items-center gap-2"
            >
              {showExampleData ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  {t("hideExampleData") || "Hide Example Data"}
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  {t("showExampleData") || "Show Example Data"}
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Analysis Summary */}
        {analysis && entries.length > 0 && (
          <Card className="mb-8 p-6 border bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="inline-block w-1.5 h-6 bg-primary rounded mr-2"></span>
              {t("yourAnalysis") || "Your Analysis"}
            </h2>
            <SweetSpotSummary 
              analysis={analysis} 
              onRefresh={loadData}
            />
          </Card>
        )}
        
        {/* User's data table */}
        <Card className="mb-8 p-6 border bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="inline-block w-1.5 h-6 bg-secondary rounded mr-2"></span>
            {t("yourData") || "Your Data"}
          </h2>
          
          {entries.length > 0 ? (
            <SweetSpotTable 
              entries={entries} 
              onDelete={handleConfirmDelete}
              onEdit={handleEdit}
            />
          ) : (
            <div className="bg-muted/20 border border-dashed rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {t("noDataYet") || "No data yet. Add your first entry to get started."}
              </p>
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                {t("addFirstEntry") || "Add Your First Entry"}
              </Button>
            </div>
          )}
        </Card>
        
        {/* Example Data section */}
        {showExampleData && (
          <Card className="mb-6 p-6 border bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="inline-block w-1.5 h-6 bg-accent rounded mr-2"></span>
              {t("exampleAnalysis") || "Example Analysis"}
            </h2>
            <div className="mb-6">
              <SweetSpotSummary analysis={exampleAnalysis} />
            </div>
            
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 mt-8">
              <span className="inline-block w-1.5 h-6 bg-accent rounded mr-2"></span>
              {t("exampleData") || "Example Data"}
            </h2>
            <SweetSpotTable 
              entries={exampleData} 
              isExample={true}
            />
          </Card>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("confirmDelete") || "Confirm Deletion"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteWarning") || "This action cannot be undone. This will permanently delete the entry from your sweet spot analysis."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Trash className="mr-2 h-4 w-4" />
              {t("delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
