
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LoadingSpinner } from "./LoadingSpinner";
import { useLanguage } from "@/context/LanguageContext";

interface MetricsImporterProps {
  onMetricsImported: (metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    insights?: string;
  }) => void;
  platform: string;
}

export function MetricsImporter({ onMetricsImported, platform }: MetricsImporterProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const extractMetricsFromLink = async () => {
    if (!url.trim()) {
      toast.error(t("pleaseEnterUrl"));
      return;
    }

    setLoading(true);
    
    try {
      // Simulasi ekstraksi metrik berdasarkan platform
      // Dalam implementasi sebenarnya, ini akan menggunakan API dari masing-masing platform
      setTimeout(() => {
        let metrics;

        if (platform === "YouTube") {
          metrics = {
            views: Math.floor(Math.random() * 10000),
            likes: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 200),
            insights: "Video ini mendapatkan performa lebih baik dari 70% video channel Anda."
          };
        } else if (platform === "Instagram") {
          metrics = {
            views: Math.floor(Math.random() * 5000),
            likes: Math.floor(Math.random() * 500),
            comments: Math.floor(Math.random() * 100),
            shares: Math.floor(Math.random() * 50),
            insights: "Post ini menjangkau 2x lebih banyak non-followers dibanding post lain Anda."
          };
        } else if (platform === "TikTok") {
          metrics = {
            views: Math.floor(Math.random() * 20000),
            likes: Math.floor(Math.random() * 2000),
            comments: Math.floor(Math.random() * 300),
            shares: Math.floor(Math.random() * 500),
            insights: "Video ini mendapat interaksi 3x lebih tinggi dari rata-rata konten Anda."
          };
        } else {
          metrics = {
            views: Math.floor(Math.random() * 1000),
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 50),
            shares: Math.floor(Math.random() * 20)
          };
        }
        
        onMetricsImported(metrics);
        toast.success(t("metricsImportedSuccessfully"));
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error importing metrics:", error);
      toast.error(t("errorImportingMetrics"));
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 mt-4 p-3 border border-dashed border-primary/30 rounded-md bg-muted/30">
      <h3 className="text-sm font-semibold">{t("importMetricsFromUrl")}</h3>
      <p className="text-xs text-muted-foreground">{t("pasteContentUrl", { platform })}</p>
      <div className="flex gap-2">
        <Input
          placeholder={`${platform} URL`}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={extractMetricsFromLink} 
          disabled={loading || !url.trim()} 
          size="sm"
          variant="outline"
        >
          {loading ? <LoadingSpinner size="xs" /> : t("import")}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground italic">
        {t("metricsImportDisclaimer")}
      </p>
    </div>
  );
}
