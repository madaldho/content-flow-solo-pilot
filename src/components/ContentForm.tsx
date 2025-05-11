
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

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
import { CalendarIcon, Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { Platform, ContentTag, ContentItem, ContentStatus } from "@/types/content";
import { Badge } from "@/components/ui/badge";
import { Tags } from "lucide-react";
import { ContentTagSelect } from "./ContentTagSelect";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

const defaultPlatforms: Platform[] = ["YouTube", "TikTok", "Instagram", "Twitter", "LinkedIn", "Blog", "Podcast", "Other"];
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
  const { addContentItem, updateContentItem, platforms } = useContent();
  const { t } = useLanguage();
  const [selectedTags, setSelectedTags] = useState<ContentTag[]>(
    initialData?.tags || []
  );
  const [tagsOpen, setTagsOpen] = useState(false);
  const [platformsOpen, setPlatformsOpen] = useState(false);
  
  // Make sure we have a valid array of platforms to work with
  const availablePlatforms = Array.isArray(platforms) && platforms.length > 0 
    ? platforms 
    : defaultPlatforms;
    
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

      const contentData: Omit<ContentItem, "id" | "createdAt" | "updatedAt"> = {
        title: values.title,
        platform: values.platforms[0], // Keep backward compatibility with single platform
        platforms: values.platforms,   // Add multi-platform support
        status: values.status as ContentStatus,
        tags: selectedTags,
        publicationDate: values.publicationDate,
        notes: values.notes,
        referenceLink: values.referenceLink,
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

  // Function to handle platform selection
  const handlePlatformSelection = (platform: Platform) => {
    let updatedPlatforms: Platform[];
    
    if (selectedPlatforms.includes(platform)) {
      updatedPlatforms = selectedPlatforms.filter(p => p !== platform);
    } else {
      updatedPlatforms = [...selectedPlatforms, platform];
    }
    
    setSelectedPlatforms(updatedPlatforms);
    form.setValue("platforms", updatedPlatforms);
    
    // Validate after setting value
    form.trigger("platforms");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Header section */}
        <div className="bg-muted/30 p-4 rounded-lg border border-muted">
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
                  <Popover open={platformsOpen} onOpenChange={setPlatformsOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          role="combobox"
                          aria-expanded={platformsOpen}
                          className={cn(
                            "w-full justify-between rounded-lg",
                            !field.value?.length && "text-muted-foreground"
                          )}
                        >
                          {field.value?.length > 0
                            ? `${field.value.length} ${t(field.value.length > 1 ? "platforms" : "platform")} ${t("selected")}`
                            : t("selectPlatforms")}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 rounded-lg shadow-lg">
                      <Command>
                        <CommandInput placeholder={t("searchPlatforms")} />
                        <CommandEmpty>{t("noPlatformFound")}</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {availablePlatforms.map((platform) => (
                            <CommandItem
                              key={platform}
                              value={platform}
                              onSelect={() => handlePlatformSelection(platform)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedPlatforms.includes(platform) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {platform}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedPlatforms.map((platform) => (
                      <Badge 
                        key={platform} 
                        variant="secondary" 
                        className="flex items-center gap-1 rounded-md"
                      >
                        {platform}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handlePlatformSelection(platform)} 
                        />
                      </Badge>
                    ))}
                  </div>
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
