
import React, { useState } from "react";
import { SweetSpotAnalysis } from "@/types/sweetSpot";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart3, ShoppingCart, TrendingUp, CreditCard, Edit, Save, X } from "lucide-react";
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
      <Card className="overflow-hidden border-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/20 rounded-lg -z-10" />
        <CardHeader className="pb-2 relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full -mr-8 -mt-8"></div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            {t("grandTotal") || "Grand Total"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{analysis.grandTotal.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("totalPotentialAudience") || "Total Potential Audience"}
          </p>
        </CardContent>
      </Card>
      
      {/* Conversion */}
      <Card className="overflow-hidden border-none">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-indigo-500/20 rounded-lg -z-10" />
        <CardHeader className="pb-2 relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/10 rounded-full -mr-8 -mt-8"></div>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-500" />
            {t("conversion") || "Conversion (1%)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-violet-700 dark:text-violet-300">{analysis.conversion.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("potentialCustomers") || "Potential Customers"}
          </p>
        </CardContent>
      </Card>
      
      {/* Sales Per Month */}
      <Card className="overflow-hidden border-none">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/30 to-purple-500/20 rounded-lg -z-10" />
        <CardHeader className="pb-2 relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-fuchsia-500/10 rounded-full -mr-8 -mt-8"></div>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-fuchsia-500" />
            {t("salesPerMonth") || "Monthly Sales"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-fuchsia-700 dark:text-fuchsia-300">{analysis.salesPerMonth}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("estimatedMonthlySales") || "Estimated Monthly Sales"}
          </p>
        </CardContent>
      </Card>
      
      {/* Revenue Per Month - Editable */}
      <Card className="md:col-span-2 overflow-hidden border-none">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-rose-500/20 rounded-lg -z-10" />
        <CardHeader className="pb-2 relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full -mr-10 -mt-10"></div>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-pink-500" />
            {t("revenuePerMonth") || "Target Monthly Revenue"}
            {!isEditingRevenue && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto h-8 w-8 p-0 text-pink-500 hover:text-pink-700 hover:bg-pink-100 dark:hover:bg-pink-900/20" 
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
              <div className="flex items-center">
                <span className="text-lg font-medium mr-2">Rp</span>
                <Input
                  type="number"
                  value={revenueInput}
                  onChange={(e) => setRevenueInput(e.target.value)}
                  placeholder="Enter target revenue"
                  className="text-lg border-pink-200 focus-visible:ring-pink-400"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleSaveRevenue}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {t("save") || "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-1" />
                  {t("cancel") || "Cancel"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">{analysis.revenuePerMonth}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("targetMonthlyRevenue") || "Target Monthly Revenue"}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Product Price - Automatically calculated */}
      <Card className="overflow-hidden border-none">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-amber-500/20 rounded-lg -z-10" />
        <CardHeader className="pb-2 relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full -mr-8 -mt-8"></div>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-500" />
            {t("productPrice") || "Product Price"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{analysis.productPrice}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("calculatedPrice") || "Calculated from Revenue / Monthly Sales"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
