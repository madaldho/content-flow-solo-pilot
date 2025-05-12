
import React from "react";
import { SweetSpotEntry } from "@/types/sweetSpot";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SweetSpotTableProps {
  entries: SweetSpotEntry[];
  onDelete?: (id: string) => void;
  onEdit?: (entry: SweetSpotEntry) => void;
  isExample?: boolean;
}

export function SweetSpotTable({ entries, onDelete, onEdit, isExample = false }: SweetSpotTableProps) {
  const { t } = useLanguage();
  
  // Group entries by niche
  const entriesByNiche = entries.reduce((acc, entry) => {
    const niche = entry.niche;
    if (!acc[niche]) {
      acc[niche] = [];
    }
    acc[niche].push(entry);
    return acc;
  }, {} as Record<string, SweetSpotEntry[]>);
  
  // Calculate total audience for each niche
  const calculateNicheTotal = (nicheEntries: SweetSpotEntry[]) => {
    return nicheEntries.reduce((sum, entry) => sum + entry.audience, 0);
  };

  // Get color for niche header
  const getNicheColor = (niche: string) => {
    switch (niche) {
      case "KEY NICHE":
        return "bg-gradient-to-r from-primary/10 to-primary/5";
      case "BENANG MERAH NICHE":
        return "bg-gradient-to-r from-secondary/10 to-secondary/5";
      default:
        return "bg-gradient-to-r from-accent/10 to-accent/5";
    }
  };
  
  if (entries.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center bg-card">
        <p className="text-muted-foreground">
          {isExample ? 
            (t("noExampleData") || "No example data available.") :
            (t("noDataYet") || "No data yet. Add your first entry to get started.")}
        </p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead className="w-[180px]">{t("account") || "Account"}</TableHead>
              <TableHead>{t("keywords") || "Keywords"}</TableHead>
              <TableHead className="text-right">{t("audience") || "Audience"}</TableHead>
              <TableHead>{t("revenueStream") || "Revenue Stream"}</TableHead>
              <TableHead className="text-right">{t("pricing") || "Pricing"}</TableHead>
              {!isExample && (
                <TableHead className="w-[100px] text-center">{t("actions") || "Actions"}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(entriesByNiche).map(([niche, nicheEntries]) => (
              <React.Fragment key={niche}>
                {/* Niche header */}
                <TableRow className={`${getNicheColor(niche)} border-b border-t`}>
                  <TableCell colSpan={isExample ? 5 : 6} className="font-bold text-lg py-3 px-4">
                    <div className="flex items-center">
                      <span>{niche}</span>
                      <Badge variant="outline" className="ml-3 bg-background">
                        {nicheEntries.length} {nicheEntries.length === 1 ? 'entry' : 'entries'}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
                
                {/* Niche entries */}
                {nicheEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{entry.account}</TableCell>
                    <TableCell>{entry.keywords}</TableCell>
                    <TableCell className="text-right">
                      {entry.audience.toLocaleString()}
                    </TableCell>
                    <TableCell>{entry.revenueStream}</TableCell>
                    <TableCell className="text-right">{entry.pricing}</TableCell>
                    {!isExample && (
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          {onEdit && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => onEdit(entry)}
                              title={t("edit") || "Edit"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => onDelete(entry.id)}
                              className="text-destructive hover:text-destructive"
                              title={t("delete") || "Delete"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                
                {/* Niche calculations */}
                <TableRow className="bg-muted/10 border-t">
                  <TableCell colSpan={2} className="font-semibold">
                    {t("total") || "Total"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {calculateNicheTotal(nicheEntries).toLocaleString()}
                  </TableCell>
                  <TableCell colSpan={isExample ? 2 : 3}></TableCell>
                </TableRow>
                
                <TableRow className="bg-muted/10">
                  <TableCell colSpan={2} className="font-semibold">
                    {t("assumptionAudience") || "Assumption Audience"} 
                    {niche === "KEY NICHE" ? " (10%)" : " (5%)"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {Math.round(
                      calculateNicheTotal(nicheEntries) * 
                      (niche === "KEY NICHE" ? 0.1 : 0.05)
                    ).toLocaleString()}
                  </TableCell>
                  <TableCell colSpan={isExample ? 2 : 3}></TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
