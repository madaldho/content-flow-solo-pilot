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
import { CalendarIcon } from "lucide-react";
import { Platform, ContentTag, ContentItem, ContentStatus } from "@/types/content";
import { Badge } from "@/components/ui/badge";
import { Tags } from "lucide-react";
import { ContentTagSelect } from "./ContentTagSelect";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";

// Define the statuses
const statuses: ContentStatus[] = ["Idea", "Script", "Recorded", "Edited", "Ready to Publish", "Published"];

// Create a schema that accepts both predefined platforms and custom platforms
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  platform: z.string(),
  status: z.enum(["Idea", "Script", "Recorded", "Edited", "Ready to Publish", "Published"]),
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

  // Get available platforms from context or use default
  const availablePlatforms = Array.isArray(platforms) && platforms.length > 0 
    ? platforms 
    : ["YouTube", "TikTok", "Instagram", "Twitter", "LinkedIn", "Blog", "Podcast", "Other"];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      platform: initialData?.platform || availablePlatforms[0],
      status: initialData?.status || "Idea",
      publicationDate: initialData?.publicationDate,
      notes: initialData?.notes || "",
      referenceLink: initialData?.referenceLink || "",
      script: initialData?.script || "",
      scriptFile: initialData?.scriptFile || "",
      productionNotes: initialData?.productionNotes || "",
      equipmentUsed: initialData?.equipmentUsed ? initialData?.equipmentUsed.join(", ") : "",
      contentFiles: initialData?.contentFiles ? initialData?.contentFiles.join(", ") : "",
      metrics: initialData?.metrics,
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
        platform: values.platform,
        status: values.status,
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
        metrics: values.metrics
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("title")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("title")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("platform")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("platform")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availablePlatforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("status")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("status")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                          "w-full pl-3 text-left font-normal",
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("notes")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("additionalInfo")}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t("additionalInfo")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="referenceLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("referenceLink")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("referenceLink")} {...field} />
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
                  <Input placeholder={t("scriptFile")} {...field} />
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
            <FormItem>
              <FormLabel>{t("scriptContent")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("scriptContent")}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productionNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("productionNotes")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("productionNotes")}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="equipmentUsed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("equipmentUsed")}</FormLabel>
              <FormControl>
                <Input placeholder={t("equipmentUsed")} {...field} />
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
                <Input placeholder={t("contentFiles")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tag selection */}
        <div>
          <Label className="text-sm text-muted-foreground flex items-center gap-2">
            <Tags className="w-4 h-4" />
            {t("tags")}
          </Label>
          <ContentTagSelect
            open={tagsOpen}
            onOpenChange={setTagsOpen}
            value={selectedTags}
            onValueChange={setSelectedTags}
          />
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>

        <Button type="submit">{t("submit")}</Button>
      </form>
    </Form>
  );
}
