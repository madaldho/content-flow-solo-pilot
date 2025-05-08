
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { ContentItem, ContentStatus, ContentTag, Platform } from "@/types/content";
import { useContent } from "@/context/ContentContext";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

// Available platforms
const PLATFORMS: Platform[] = [
  "YouTube", 
  "TikTok", 
  "Instagram", 
  "Twitter", 
  "LinkedIn", 
  "Blog", 
  "Podcast", 
  "Other"
];

// Available tags
const CONTENT_TAGS: ContentTag[] = [
  "Education", 
  "Entertainment", 
  "Promotion", 
  "Tutorial", 
  "Review", 
  "Vlog", 
  "Interview", 
  "Announcement", 
  "Other"
];

// Content statuses
const CONTENT_STATUSES: ContentStatus[] = [
  "Idea",
  "Script",
  "Recorded",
  "Edited",
  "Ready to Publish",
  "Published"
];

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  platform: z.string(),
  status: z.string(),
  tags: z.array(z.string()),
  notes: z.string().optional(),
  referenceLink: z.string().url().optional().or(z.string().length(0)),
  script: z.string().optional(),
  productionNotes: z.string().optional(),
  equipmentUsed: z.string().optional(),
  publicationDate: z.date().optional(),
  contentChecklist: z.object({
    intro: z.boolean().default(false),
    mainPoints: z.boolean().default(false),
    callToAction: z.boolean().default(false),
    outro: z.boolean().default(false),
  }),
  metrics: z.object({
    views: z.number().optional(),
    likes: z.number().optional(),
    comments: z.number().optional(),
    shares: z.number().optional(),
    insights: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
  }).optional(),
});

interface ContentFormProps {
  initialData?: ContentItem;
  onClose: () => void;
  onSubmit?: (data: ContentItem) => void;
}

export function ContentForm({ initialData, onClose, onSubmit }: ContentFormProps) {
  const { addContentItem, updateContentItem } = useContent();
  const [selectedTags, setSelectedTags] = useState<ContentTag[]>(
    initialData?.tags || []
  );
  const [tagsOpen, setTagsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      platform: initialData?.platform || "YouTube",
      status: initialData?.status || "Idea",
      tags: initialData?.tags || [],
      notes: initialData?.notes || "",
      referenceLink: initialData?.referenceLink || "",
      script: initialData?.script || "",
      productionNotes: initialData?.productionNotes || "",
      equipmentUsed: initialData?.equipmentUsed?.join(", ") || "",
      publicationDate: initialData?.publicationDate,
      contentChecklist: initialData?.contentChecklist || {
        intro: false,
        mainPoints: false,
        callToAction: false,
        outro: false,
      },
      metrics: initialData?.metrics || {
        views: undefined,
        likes: undefined,
        comments: undefined,
        shares: undefined,
        insights: "",
        rating: undefined,
      },
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Convert equipment used string to array
      const equipmentUsed = values.equipmentUsed
        ? values.equipmentUsed.split(",").map(item => item.trim())
        : undefined;

      const contentData = {
        ...values,
        tags: selectedTags,
        equipmentUsed,
      } as Omit<ContentItem, "id" | "createdAt" | "updatedAt" | "contentChecklist"> & 
          { id?: string; createdAt?: Date; updatedAt?: Date; };

      if (initialData) {
        // Update existing content
        updateContentItem(initialData.id, contentData);
        toast.success("Content updated successfully");
      } else {
        // Add new content
        const id = addContentItem(contentData);
        if (onSubmit && contentData && id) {
          // Add id, createdAt and updatedAt for the callback
          const now = new Date();
          const completedData = {
            ...contentData,
            id,
            createdAt: now,
            updatedAt: now,
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

  // Show appropriate fields based on status
  const status = form.watch("status");
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Content title..." {...field} />
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
                <FormLabel>Platform</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CONTENT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tags"
            render={() => (
              <FormItem className="flex flex-col">
                <FormLabel>Tags</FormLabel>
                <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !selectedTags.length && "text-muted-foreground"
                        )}
                      >
                        {selectedTags.length > 0 
                          ? `${selectedTags.length} selected`
                          : "Select tags"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search tags..." />
                      <CommandEmpty>No tag found.</CommandEmpty>
                      <CommandGroup>
                        {CONTENT_TAGS.map((tag) => (
                          <CommandItem
                            key={tag}
                            value={tag}
                            onSelect={() => {
                              setSelectedTags(prev => {
                                if (prev.includes(tag)) {
                                  return prev.filter(item => item !== tag);
                                } else {
                                  return [...prev, tag];
                                }
                              });
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedTags.includes(tag) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {tag}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {selectedTags.map(tag => (
                    <Badge 
                      key={tag}
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedTags(prev => prev.filter(t => t !== tag));
                      }}
                    >
                      {tag} ✕
                    </Badge>
                  ))}
                </div>
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add notes about your content idea..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="referenceLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Link (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormDescription>
                Add a link to reference material or inspiration
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {(status === "Script" || status === "Recorded" || status === "Edited" || status === "Ready to Publish" || status === "Published") && (
          <>
            <Separator className="my-4" />
            
            <FormField
              control={form.control}
              name="script"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Script/Outline</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your content script or outline here..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <FormLabel>Content Checklist</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="contentChecklist.intro"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Introduction
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contentChecklist.mainPoints"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Main Points/Content
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contentChecklist.callToAction"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Call to Action
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contentChecklist.outro"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Outro/Conclusion
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </>
        )}
        
        {(status === "Recorded" || status === "Edited" || status === "Ready to Publish" || status === "Published") && (
          <>
            <Separator className="my-4" />
            
            <FormField
              control={form.control}
              name="productionNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Production Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes about the recording, technical details, or improvements for next time..."
                      className="min-h-[100px]"
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
                  <FormLabel>Equipment Used</FormLabel>
                  <FormControl>
                    <Input placeholder="Camera, Microphone, Lights (comma separated)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        {(status === "Ready to Publish" || status === "Published") && (
          <>
            <Separator className="my-4" />
            
            <FormField
              control={form.control}
              name="publicationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Publication Date</FormLabel>
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
                            <span>Pick a date</span>
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
                  <FormDescription>
                    When will this content be published?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        {status === "Published" && (
          <>
            <Separator className="my-4" />
            <div className="space-y-4">
              <FormLabel>Performance Metrics</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="metrics.views"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Views</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={e => field.onChange(e.target.valueAsNumber || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metrics.likes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Likes</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={e => field.onChange(e.target.valueAsNumber || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metrics.comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={e => field.onChange(e.target.valueAsNumber || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metrics.shares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shares</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={e => field.onChange(e.target.valueAsNumber || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="metrics.rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Rating (1-5)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Rate your content" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {"⭐".repeat(rating)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How would you rate this content's success?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="metrics.insights"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Performance Insights</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What worked well? What could be improved?"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update" : "Create"} Content
          </Button>
        </div>
      </form>
    </Form>
  );
}
