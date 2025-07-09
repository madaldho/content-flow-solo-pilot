import { useState, useEffect } from "react";
import { SweetSpotEntry } from "@/types/sweetSpot";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface SweetSpotFormProps {
  entry?: SweetSpotEntry | null;
  onSubmit: (entry: Omit<SweetSpotEntry, 'id'> | Partial<SweetSpotEntry>) => void;
  onCancel?: () => void;
}

// Form schema
const formSchema = z.object({
  niche: z.string().min(1, "Niche is required"),
  account: z.string().min(1, "Account name is required"),
  keywords: z.string().optional(),
  audience: z.number().min(1, "Audience must be at least 1"),
  revenueStream: z.string().min(1, "Revenue stream is required"),
  pricing: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SweetSpotForm({ entry, onSubmit, onCancel }: SweetSpotFormProps) {
  const { t } = useLanguage();
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      niche: "KEY NICHE",
      account: "",
      keywords: "",
      audience: 1000,
      revenueStream: "Endorsement",
      pricing: "Rp",
    },
  });
  
  // Initialize form with entry data if editing
  useEffect(() => {
    if (entry) {
      form.reset({
        niche: entry.niche,
        account: entry.account,
        keywords: entry.keywords,
        audience: entry.audience,
        revenueStream: entry.revenueStream,
        pricing: entry.pricing,
      });
    }
  }, [entry, form]);
  
  const handleSubmit = (values: FormValues) => {
    console.log('🐛 Debug: Form values:', values);
    onSubmit(values);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="niche"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("niche") || "Niche"}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectNiche") || "Select Niche"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="KEY NICHE">KEY NICHE</SelectItem>
                    <SelectItem value="BENANG MERAH NICHE">BENANG MERAH NICHE</SelectItem>
                    <SelectItem value="OTHER NICHE">OTHER NICHE</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t("nicheDescription") || "The category this account belongs to"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="account"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("account") || "Account"}</FormLabel>
                <FormControl>
                  <Input placeholder="Account name" {...field} />
                </FormControl>
                <FormDescription>
                  {t("accountDescription") || "The name of the social media account"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("keywords") || "Keywords"}</FormLabel>
                <FormControl>
                  <Input placeholder="Related keywords" {...field} />
                </FormControl>
                <FormDescription>
                  {t("keywordsDescription") || "Keywords relevant to this account"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="audience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("audience") || "Audience"}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Audience size"
                    {...field} 
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : 0;
                      field.onChange(value);
                    }}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  {t("audienceDescription") || "The size of the account's audience"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="revenueStream"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("revenueStream") || "Revenue Stream"}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectRevenueStream") || "Select Revenue Stream"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Endorsement">Endorsement</SelectItem>
                    <SelectItem value="Course">Course</SelectItem>
                    <SelectItem value="Webinar">Webinar</SelectItem>
                    <SelectItem value="Affiliate">Affiliate</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t("revenueStreamDescription") || "How revenue is generated from this account"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="pricing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("pricing") || "Pricing"}</FormLabel>
                <FormControl>
                  <Input placeholder="Rp1,000,000" {...field} />
                </FormControl>
                <FormDescription>
                  {t("pricingDescription") || "The pricing structure for this revenue stream"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
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
    </Form>
  );
}
