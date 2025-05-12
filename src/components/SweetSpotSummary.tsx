
import { SweetSpotAnalysis } from "@/types/sweetSpot";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart3, ShoppingCart, TrendingUp, CreditCard } from "lucide-react";

interface SweetSpotSummaryProps {
  analysis: SweetSpotAnalysis;
}

export function SweetSpotSummary({ analysis }: SweetSpotSummaryProps) {
  const { t } = useLanguage();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Grand Total */}
      <Card className="bg-gradient-to-br from-card to-primary/5 border hover:shadow-md transition-all">
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
      <Card className="bg-gradient-to-br from-card to-secondary/5 border hover:shadow-md transition-all">
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
      <Card className="bg-gradient-to-br from-card to-accent/5 border hover:shadow-md transition-all">
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
      
      {/* Revenue Per Month */}
      <Card className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-card to-primary/5 border hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t("revenuePerMonth") || "Monthly Revenue"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{analysis.revenuePerMonth}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("estimatedMonthlyRevenue") || "Estimated Monthly Revenue at"} {analysis.productPrice} {t("perProduct") || "per product"}
          </p>
        </CardContent>
      </Card>
      
      {/* Product Price */}
      <Card className="bg-gradient-to-br from-card to-secondary/5 border hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-secondary" />
            {t("productPrice") || "Product Price"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{analysis.productPrice}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("basePrice") || "Base Price for Calculations"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
