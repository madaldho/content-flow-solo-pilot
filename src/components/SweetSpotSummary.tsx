
import React, { useState } from "react";
import { SweetSpotAnalysis } from "@/types/sweetSpot";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart3, ShoppingCart, TrendingUp, CreditCard, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sweetSpotService } from "@/services/sweetSpotService";
import { toast } from "sonner";

interface SweetSpotSummaryProps {
  analysis: SweetSpotAnalysis;
  onRefresh?: () => void;
}

export function SweetSpotSummary({ analysis, onRefresh }: SweetSpotSummaryProps) {
  const { t } = useLanguage();
  const [isEditingRevenue, setIsEditingRevenue] = useState(false);
  const [revenueInput, setRevenueInput] = useState('');

  // Start editing revenue
  const handleEditRevenue = () => {
    const currentRevenue = sweetSpotService.parseCurrency(analysis.revenuePerMonth);
    setRevenueInput(currentRevenue.toString());
    setIsEditingRevenue(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditingRevenue(false);
  };

  // Save new revenue target
  const handleSaveRevenue = () => {
    const newRevenue = parseInt(revenueInput);
    if (isNaN(newRevenue) || newRevenue <= 0) {
      toast.error(t("invalidRevenue") || "Please enter a valid revenue amount");
      return;
    }
    
    sweetSpotService.updateTargetRevenue(newRevenue);
    setIsEditingRevenue(false);
    toast.success(t("revenueUpdated") || "Target revenue updated successfully");
    
    // Refresh analysis data
    if (onRefresh) {
      onRefresh();
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Grand Total */}
      <Card className="bg-gradient-to-br from-card to-primary/10 border hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t("grandTotal") || "Grand Total"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{analysis.grandTotal.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("totalPotentialAudience") || "Total Potential Audience"}
          </p>
        </CardContent>
      </Card>
      
      {/* Conversion */}
      <Card className="bg-gradient-to-br from-card to-secondary/10 border hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-secondary" />
            {t("conversion") || "Conversion (1%)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{analysis.conversion.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("potentialCustomers") || "Potential Customers"}
          </p>
        </CardContent>
      </Card>
      
      {/* Sales Per Month */}
      <Card className="bg-gradient-to-br from-card to-accent/10 border hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-accent" />
            {t("salesPerMonth") || "Monthly Sales"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{analysis.salesPerMonth}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("estimatedMonthlySales") || "Estimated Monthly Sales"}
          </p>
        </CardContent>
      </Card>
      
      {/* Revenue Per Month - Editable */}
      <Card className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-card to-primary/10 border hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t("revenuePerMonth") || "Target Monthly Revenue"}
            {!isEditingRevenue && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto h-8 w-8 p-0" 
                onClick={handleEditRevenue}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit Revenue Target</span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditingRevenue ? (
            <div className="space-y-2">
              <Input
                type="number"
                value={revenueInput}
                onChange={(e) => setRevenueInput(e.target.value)}
                placeholder="Enter target revenue"
                className="text-lg"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveRevenue}>
                  {t("save") || "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  {t("cancel") || "Cancel"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold">{analysis.revenuePerMonth}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("targetMonthlyRevenue") || "Target Monthly Revenue"}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Product Price - Automatically calculated */}
      <Card className="bg-gradient-to-br from-card to-secondary/10 border hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-secondary" />
            {t("productPrice") || "Product Price"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{analysis.productPrice}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("calculatedPrice") || "Calculated from Revenue / Monthly Sales"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
