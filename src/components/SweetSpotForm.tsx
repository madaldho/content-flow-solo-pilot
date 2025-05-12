
import { useState, useEffect } from "react";
import { SweetSpotEntry } from "@/types/sweetSpot";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SweetSpotFormProps {
  entry?: SweetSpotEntry | null;
  onSubmit: (entry: Omit<SweetSpotEntry, 'id'> | Partial<SweetSpotEntry>) => void;
  onCancel?: () => void;
}

export function SweetSpotForm({ entry, onSubmit, onCancel }: SweetSpotFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Omit<SweetSpotEntry, 'id'>>({
    niche: "",
    account: "",
    keywords: "",
    audience: 0,
    revenueStream: "",
    pricing: "",
  });
  
  // Initialize form with entry data if editing
  useEffect(() => {
    if (entry) {
      setFormData({
        niche: entry.niche,
        account: entry.account,
        keywords: entry.keywords,
        audience: entry.audience,
        revenueStream: entry.revenueStream,
        pricing: entry.pricing,
      });
    } else {
      // Reset form when not editing
      setFormData({
        niche: "KEY NICHE",
        account: "",
        keywords: "",
        audience: 0,
        revenueStream: "Endorsement",
        pricing: "Rp",
      });
    }
  }, [entry]);
  
  const handleChange = (field: keyof Omit<SweetSpotEntry, 'id'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.niche || !formData.account || formData.audience <= 0) {
      toast.error(t("pleaseFillRequiredFields") || "Please fill all required fields");
      return;
    }
    
    onSubmit(formData);
    
    // Reset form if not editing
    if (!entry) {
      setFormData({
        niche: "KEY NICHE",
        account: "",
        keywords: "",
        audience: 0,
        revenueStream: "Endorsement",
        pricing: "Rp",
      });
    }
    
    toast.success(entry ? 
      (t("entryUpdated") || "Entry updated successfully") : 
      (t("entryAdded") || "Entry added successfully")
    );
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="niche" className="font-medium">
            {t("niche") || "Niche"} <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={formData.niche} 
            onValueChange={(value) => handleChange("niche", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectNiche") || "Select Niche"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KEY NICHE">KEY NICHE</SelectItem>
              <SelectItem value="BENANG MERAH NICHE">BENANG MERAH NICHE</SelectItem>
              <SelectItem value="OTHER NICHE">OTHER NICHE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="account" className="font-medium">
            {t("account") || "Account"} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="account"
            value={formData.account}
            onChange={(e) => handleChange("account", e.target.value)}
            placeholder="Account name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="keywords" className="font-medium">
            {t("keywords") || "Keywords"}
          </Label>
          <Input
            id="keywords"
            value={formData.keywords}
            onChange={(e) => handleChange("keywords", e.target.value)}
            placeholder="Related keywords"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="audience" className="font-medium">
            {t("audience") || "Audience"} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="audience"
            type="number"
            value={formData.audience || ""}
            onChange={(e) => handleChange("audience", parseInt(e.target.value) || 0)}
            placeholder="Audience size"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="revenueStream" className="font-medium">
            {t("revenueStream") || "Revenue Stream"}
          </Label>
          <Select 
            value={formData.revenueStream} 
            onValueChange={(value) => handleChange("revenueStream", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectRevenueStream") || "Select Revenue Stream"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Endorsement">Endorsement</SelectItem>
              <SelectItem value="Course">Course</SelectItem>
              <SelectItem value="Webinar">Webinar</SelectItem>
              <SelectItem value="Affiliate">Affiliate</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pricing" className="font-medium">
            {t("pricing") || "Pricing"}
          </Label>
          <Input
            id="pricing"
            value={formData.pricing}
            onChange={(e) => handleChange("pricing", e.target.value)}
            placeholder="Rp1,000,000"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("cancel") || "Cancel"}
          </Button>
        )}
        <Button type="submit">
          {entry ? t("updateEntry") || "Update Entry" : t("addEntry") || "Add Entry"}
        </Button>
      </div>
    </form>
  );
}
