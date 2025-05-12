
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SweetSpotEntry, SweetSpotAnalysis } from "@/types/sweetSpot";
import { sweetSpotService } from "@/services/sweetSpotService";
import { Button } from "@/components/ui/button";
import { SweetSpotTable } from "@/components/SweetSpotTable";
import { SweetSpotForm } from "@/components/SweetSpotForm";
import { SweetSpotSummary } from "@/components/SweetSpotSummary";
import { useLanguage } from "@/context/LanguageContext";
import { Eye, EyeOff, Plus } from "lucide-react";

export default function SweetSpotAnalysisPage() {
  const [entries, setEntries] = useState<SweetSpotEntry[]>([]);
  const [analysis, setAnalysis] = useState<SweetSpotAnalysis | null>(null);
  const [editingEntry, setEditingEntry] = useState<SweetSpotEntry | null>(null);
  const [showExampleData, setShowExampleData] = useState(false);
  const { t } = useLanguage();
  
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
  
  // Handle creating a new entry
  const handleCreate = (entry: Omit<SweetSpotEntry, 'id'>) => {
    sweetSpotService.createEntry(entry);
    loadData();
    setEditingEntry(null);
  };
  
  // Handle updating an entry
  const handleUpdate = (id: string, updates: Partial<SweetSpotEntry>) => {
    sweetSpotService.updateEntry(id, updates);
    loadData();
    setEditingEntry(null);
  };
  
  // Handle deleting an entry
  const handleDelete = (id: string) => {
    sweetSpotService.deleteEntry(id);
    loadData();
  };
  
  // Select entry for editing
  const handleEdit = (entry: SweetSpotEntry) => {
    setEditingEntry(entry);
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingEntry(null);
  };
  
  // Get example data for reference
  const exampleData = sweetSpotService.getExampleData();
  const exampleAnalysis = sweetSpotService.calculateAnalysis(exampleData);
  
  return (
    <Layout>
      <div className="container px-3 md:px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="glassmorphism p-4 rounded-xl shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold">
              {t("sweetSpot") || "Sweet Spot Analysis"}
            </h1>
          </div>
          
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
        
        {/* Form for adding/editing entries */}
        <div className="bg-card border rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingEntry ? 
              (t("editEntry") || "Edit Entry") : 
              (t("addNewEntry") || "Add New Entry")}
          </h2>
          
          <SweetSpotForm
            entry={editingEntry}
            onSubmit={editingEntry 
              ? (updates) => handleUpdate(editingEntry.id, updates) 
              : handleCreate}
            onCancel={editingEntry ? handleCancelEdit : undefined}
          />
        </div>
        
        {/* Analysis Summary */}
        {analysis && entries.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {t("yourAnalysis") || "Your Analysis"}
            </h2>
            <SweetSpotSummary analysis={analysis} />
          </div>
        )}
        
        {/* User's data table */}
        {entries.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {t("yourData") || "Your Data"}
            </h2>
            <SweetSpotTable 
              entries={entries} 
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </div>
        ) : (
          <div className="bg-muted/20 border border-dashed rounded-lg p-8 text-center mb-8">
            <p className="text-muted-foreground mb-4">
              {t("noDataYet") || "No data yet. Add your first entry using the form above."}
            </p>
          </div>
        )}
        
        {/* Example Data section */}
        {showExampleData && (
          <>
            <h2 className="text-xl font-semibold mb-4 mt-8 border-t pt-8">
              {t("exampleDataForReference") || "Example Data (For Reference)"}
            </h2>
            
            <div className="mb-6">
              <SweetSpotSummary analysis={exampleAnalysis} />
            </div>
            
            <SweetSpotTable 
              entries={exampleData} 
              isExample={true}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
