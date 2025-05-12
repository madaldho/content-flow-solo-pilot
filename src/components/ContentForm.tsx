import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import React from "react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Facebook, Instagram, Youtube, Twitter, Linkedin, Globe, PlusCircle, Trash2, Link2 } from "lucide-react";
import { Platform, ContentTag, ContentItem, ContentStatus } from "@/types/content";
import { Tags } from "lucide-react";
import { ContentTagSelect } from "./ContentTagSelect";
import { ContentPlatformSelect } from "./ContentPlatformSelect";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { getPlatformIcon, getPlatformColor, getPlatformBgColor } from "@/lib/platform-utils";

// Fungsi untuk mendapatkan ikon platform yang sesuai dari Lucide React
const getPlatformLucideIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'youtube':
      return <Youtube className="h-5 w-5" />;
    case 'instagram':
      return <Instagram className="h-5 w-5" />;
    case 'facebook':
      return <Facebook className="h-5 w-5" />;
    case 'twitter':
      return <Twitter className="h-5 w-5" />;
    case 'linkedin':
      return <Linkedin className="h-5 w-5" />;
    default:
      return <Globe className="h-5 w-5" />;
  }
};

// Fungsi format rupiah
const formatRupiah = (angka: string | number) => {
  // Jika null atau tidak terdefinisi, kembalikan string kosong
  if (!angka) return "";
  
  // Konversi ke string dan hapus karakter selain angka
  const value = angka.toString().replace(/\D/g, "");
  // Format dengan pemisah ribuan
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Fungsi untuk mengambil angka dari format rupiah
const parseRupiah = (rupiahString: string) => {
  // Hapus semua non-digit
  return rupiahString.replace(/\D/g, "");
};

const statuses: ContentStatus[] = ["Idea", "Script", "Recorded", "Edited", "Ready to Publish", "Published"];

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  platforms: z.array(z.string()).min(1, {
    message: "Please select at least one platform.",
  }),
  status: z.string(),
  publicationDate: z.date().optional(),
  notes: z.string().optional(),
  referenceLink: z.string().optional(),
  contentLink: z.string().optional(),
  platformLinks: z.record(z.string().optional()).optional(),
  isEndorsement: z.boolean().default(false),
  isCollaboration: z.boolean().default(false),
  endorsementName: z.string().optional(),
  collaborationName: z.string().optional(),
  endorsementPrice: z.string().optional(),
  script: z.string().optional(),
  scriptFile: z.string().optional(),
  productionNotes: z.string().optional(),
  equipmentUsed: z.string().optional(),
  contentFiles: z.string().optional(),
  metrics: z.object({
    views: z.number().optional(),
    likes: z.number().optional(),
    comments: z.number().optional(),
    shares: z.number().optional(),
    rating: z.number().optional(),
    insights: z.string().optional(),
  }).optional(),
});

interface ContentFormProps {
  initialData?: ContentItem;
  onClose: () => void;
  onSubmit?: (data: ContentItem) => void;
}

export function ContentForm({ initialData, onClose, onSubmit }: ContentFormProps) {
  const { addContentItem, updateContentItem } = useContent();
  const { t } = useLanguage();
  const [selectedTags, setSelectedTags] = useState<ContentTag[]>(
    initialData?.tags || []
  );
  const [tagsOpen, setTagsOpen] = useState(false);
  const [platformsOpen, setPlatformsOpen] = useState(false);
  const [isEndorsement, setIsEndorsement] = useState(initialData?.isEndorsement || false);
  const [isCollaboration, setIsCollaboration] = useState(initialData?.isCollaboration || false);
  const [platformLinks, setPlatformLinks] = useState<Record<string, string>>(
    initialData?.platformLinks || {}
  );
      
  // Ensure initial platforms is always an array
  const initialPlatforms = initialData?.platforms 
    ? Array.isArray(initialData.platforms) && initialData.platforms.length > 0
      ? initialData.platforms
      : initialData.platform ? [initialData.platform] : []
    : initialData?.platform 
      ? [initialData.platform] 
      : [];
      
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(initialPlatforms);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      platforms: initialPlatforms,
      status: initialData?.status || "Idea",
      publicationDate: initialData?.publicationDate,
      notes: initialData?.notes || "",
      referenceLink: initialData?.referenceLink || "",
      contentLink: initialData?.contentLink || "",
      platformLinks: initialData?.platformLinks || {},
      isEndorsement: initialData?.isEndorsement || false,
      isCollaboration: initialData?.isCollaboration || false,
      endorsementName: initialData?.endorsementName || "",
      collaborationName: initialData?.collaborationName || "",
      endorsementPrice: initialData?.endorsementPrice || "",
      script: initialData?.script || "",
      scriptFile: initialData?.scriptFile || "",
      productionNotes: initialData?.productionNotes || "",
      equipmentUsed: initialData?.equipmentUsed ? initialData?.equipmentUsed.join(", ") : "",
      contentFiles: initialData?.contentFiles ? initialData?.contentFiles.join(", ") : "",
      metrics: initialData?.metrics || {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0
      },
    },
  });

  // Watch untuk platform links
  const watchPlatforms = form.watch("platforms");
  
  // Perbarui platform links ketika platforms berubah
  React.useEffect(() => {
    if (Array.isArray(watchPlatforms)) {
      const updatedLinks = { ...platformLinks };
      
      // Hapus platform yang sudah tidak ada
      Object.keys(updatedLinks).forEach(platform => {
        if (!watchPlatforms.includes(platform)) {
          delete updatedLinks[platform];
        }
      });
      
      // Tambahkan platform baru jika belum ada
      watchPlatforms.forEach(platform => {
        if (!updatedLinks[platform]) {
          updatedLinks[platform] = '';
        }
      });
      
      setPlatformLinks(updatedLinks);
      form.setValue("platformLinks", updatedLinks);
    }
  }, [watchPlatforms]);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Convert equipment used string to array
      const equipmentUsed = values.equipmentUsed
        ? values.equipmentUsed.split(",").map(item => item.trim())
        : [];
        
      // Convert content files string to array
      const contentFiles = values.contentFiles
        ? values.contentFiles.split(",").map(item => item.trim())
        : [];

      // Ensure contentChecklist has the correct structure
      const contentChecklist = {
        intro: initialData?.contentChecklist?.intro || false,
        mainPoints: initialData?.contentChecklist?.mainPoints || false,
        callToAction: initialData?.contentChecklist?.callToAction || false,
        outro: initialData?.contentChecklist?.outro || false
      };

      // Ensure we have valid platforms data
      const platformsValue = Array.isArray(values.platforms) ? values.platforms : selectedPlatforms;
      const firstPlatform = platformsValue.length > 0 ? platformsValue[0] : "";

      // Gunakan contentLink dari platformLinks jika tersedia
      let mainContentLink = values.contentLink || '';
      if (values.platformLinks && Object.keys(values.platformLinks).length > 0) {
        // Ambil link dari platform pertama jika tersedia
        if (firstPlatform && values.platformLinks[firstPlatform]) {
          mainContentLink = values.platformLinks[firstPlatform];
        }
      }

      const contentData: Omit<ContentItem, "id" | "createdAt" | "updatedAt"> = {
        title: values.title,
        platform: firstPlatform,
        platforms: platformsValue,
        status: values.status as ContentStatus,
        tags: Array.isArray(selectedTags) ? selectedTags : [],
        publicationDate: values.publicationDate,
        notes: values.notes,
        referenceLink: values.referenceLink,
        contentLink: mainContentLink,
        platformLinks: values.platformLinks,
        isEndorsement: values.isEndorsement,
        isCollaboration: values.isCollaboration,
        endorsementName: values.endorsementName,
        collaborationName: values.collaborationName,
        endorsementPrice: values.endorsementPrice,
        script: values.script,
        scriptFile: values.scriptFile,
        contentChecklist,
        productionNotes: values.productionNotes,
        equipmentUsed,
        contentFiles,
        metrics: values.metrics || { views: 0, likes: 0, comments: 0, shares: 0 }
      };

      if (initialData) {
        // Update existing content
        await updateContentItem(initialData.id, contentData);
        toast.success("Content updated successfully");
      } else {
        // Add new content
        const id = await addContentItem(contentData);
        
        if (onSubmit && id) {
          // Add id, createdAt and updatedAt for the callback
          const now = new Date();
          const completedData = {
            ...contentData,
            id,
            createdAt: now,
            updatedAt: now
          } as ContentItem;
          
          onSubmit(completedData);
        }
      }
      
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save content");
    }
  }

  // Watch isEndorsement and isCollaboration values for conditional rendering
  const watchIsEndorsement = form.watch("isEndorsement");
  const watchIsCollaboration = form.watch("isCollaboration");

  // Update local state when the form values change
  React.useEffect(() => {
    setIsEndorsement(watchIsEndorsement);
    setIsCollaboration(watchIsCollaboration);
  }, [watchIsEndorsement, watchIsCollaboration]);

  // Handle adding/updating platform links
  const updatePlatformLink = (platform: string, link: string) => {
    const updatedLinks = {
      ...platformLinks,
      [platform]: link
    };
    setPlatformLinks(updatedLinks);
    form.setValue("platformLinks", updatedLinks);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Header section */}
        <div className=" p-4 rounded-lg border border-muted">
          <h3 className="font-medium mb-4 text-primary">{t("basicInfo")}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("title")} <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder={t("title")} {...field} className="rounded-lg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
  
            <FormField
              control={form.control}
              name="platforms"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("platforms")} <span className="text-destructive">*</span></FormLabel>
                  <ContentPlatformSelect
                    open={platformsOpen}
                    onOpenChange={setPlatformsOpen}
                    value={selectedPlatforms}
                    onValueChange={(platforms) => {
                      setSelectedPlatforms(platforms);
                      form.setValue("platforms", platforms);
                      form.trigger("platforms");
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
  
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("status")} <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder={t("status")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-lg">
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>{t(status.toLowerCase().replace(/\s+/g, ""))}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
  
            <FormField
              control={form.control}
              name="publicationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("publicationDate")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal rounded-lg",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>{t("pickDate")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-lg" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => field.onChange(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Tags */}
          <div className="mt-4">
            <Label className="text-sm font-medium flex items-center gap-2 mb-2">
              <Tags className="w-4 h-4" />
              {t("tags")}
            </Label>
            <ContentTagSelect
              open={tagsOpen}
              onOpenChange={setTagsOpen}
              value={selectedTags}
              onValueChange={setSelectedTags}
            />
          </div>
        </div>

        {/* Content section */}
        <div className="bg-muted/30 p-4 rounded-lg border border-muted">
          <h3 className="font-medium mb-4 text-primary">{t("contentDetails")}</h3>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("notes")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("additionalInfo")}
                    className="resize-none rounded-lg min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="referenceLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("referenceLink")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("referenceLink")} {...field} className="rounded-lg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
  
            {/* Multi Platform Links */}
            <div>
              <FormLabel>{t("contentLink") || "Link Konten"}</FormLabel>
              <FormDescription className="text-xs mb-2">
                {t("contentLinkDescription") || "Masukkan link untuk setiap platform"}
              </FormDescription>
              
              {selectedPlatforms.length === 0 ? (
                <div className="text-sm text-muted-foreground mt-2">
                  Pilih platform terlebih dahulu
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  {selectedPlatforms.map((platform, index) => (
                    <div key={platform} className="flex items-center gap-2">
                      <div 
                        className="flex items-center justify-center w-10 h-10 rounded-l-md"
                        style={{
                          backgroundColor: getPlatformBgColor(platform),
                          color: getPlatformColor(platform)
                        }}
                      >
                        {getPlatformLucideIcon(platform)}
                      </div>
                      <Input
                        placeholder={`${platform} link`}
                        className="rounded-l-none"
                        value={platformLinks[platform] || ''}
                        onChange={(e) => updatePlatformLink(platform, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="scriptFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("scriptFile")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("scriptFile")} {...field} className="rounded-lg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
  
          <FormField
            control={form.control}
            name="script"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>{t("scriptContent")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("scriptContent")}
                    className="resize-none rounded-lg min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Endorsement and Collaboration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <FormField
                control={form.control}
                name="isEndorsement"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t("isEndorsement") || "Konten Endorsement"}</FormLabel>
                      <FormDescription className="text-xs">
                        {t("isEndorsementDescription") || "Apakah konten ini disponsori/endorse?"}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="isEndorsement">{field.value ? t("yes") : t("no")}</Label>
                        <input
                          type="checkbox"
                          id="isEndorsement"
                          checked={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.checked);
                            if (!e.target.checked) {
                              form.setValue("endorsementName", "");
                              form.setValue("endorsementPrice", "");
                            }
                          }}
                          className="accent-primary w-5 h-5 rounded-lg"
                          aria-label={t("isEndorsement") || "Konten Endorsement"}
                          title={t("isEndorsement") || "Konten Endorsement"}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {watchIsEndorsement && (
                <div className="space-y-3 mt-3 p-3 rounded-lg border">
                  <FormField
                    control={form.control}
                    name="endorsementName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("endorsementName") || "Nama Brand/Sponsor"}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("endorsementName") || "Masukkan nama brand/sponsor"} {...field} className="rounded-lg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endorsementPrice"
                    render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem>
                        <FormLabel>{t("endorsementPrice") || "Harga Endorsement"}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <span className="text-gray-500">Rp</span>
                            </div>
                            <Input 
                              placeholder="1.000.000" 
                              className="rounded-lg pl-12"
                              value={formatRupiah(value || "")}
                              onChange={(e) => {
                                // Simpan nilai numerik ke dalam form
                                const numericValue = parseRupiah(e.target.value);
                                onChange(numericValue);
                              }}
                              {...rest}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          {t("endorsementPriceDescription") || "Masukkan harga endorsement (opsional)"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
            
            <div>
              <FormField
                control={form.control}
                name="isCollaboration"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t("isCollaboration") || "Kolaborasi"}</FormLabel>
                      <FormDescription className="text-xs">
                        {t("isCollaborationDescription") || "Apakah konten ini merupakan kolaborasi dengan kreator lain?"}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="isCollaboration">{field.value ? t("yes") : t("no")}</Label>
                        <input
                          type="checkbox"
                          id="isCollaboration"
                          checked={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.checked);
                            if (!e.target.checked) {
                              form.setValue("collaborationName", "");
                            }
                          }}
                          className="accent-primary w-5 h-5 rounded-lg"
                          aria-label={t("isCollaboration") || "Konten Kolaborasi"}
                          title={t("isCollaboration") || "Konten Kolaborasi"}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {watchIsCollaboration && (
                <div className="mt-3 p-3 rounded-lg border">
                  <FormField
                    control={form.control}
                    name="collaborationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("collaborationName") || "Nama Kolaborator"}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("collaborationName") || "Masukkan nama kreator/kolaborator"} {...field} className="rounded-lg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Production section */}
        <div className="bg-muted/30 p-4 rounded-lg border border-muted">
          <h3 className="font-medium mb-4 text-primary">{t("production")}</h3>
          <FormField
            control={form.control}
            name="productionNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("productionNotes")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("productionNotes")}
                    className="resize-none rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="equipmentUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("equipmentUsed")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("equipmentUsed")} {...field} className="rounded-lg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
  
            <FormField
              control={form.control}
              name="contentFiles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("contentFiles")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("contentFiles")} {...field} className="rounded-lg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
  
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="px-8 py-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors"
          >
            {t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
