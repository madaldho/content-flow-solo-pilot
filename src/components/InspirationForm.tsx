
import React, { useState, useEffect } from "react";
import { useInspiration } from "@/context/InspirationContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ContentInspiration, ContentInspirationCategory, InspirationSource } from "@/types/inspiration";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Form validation schema
const inspirationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sourceAccount: z.string().min(1, "Source account is required"),
  sourceType: z.string().min(1, "Source type is required"),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  notes: z.string().optional(),
  niche: z.string().optional(),
  isFavorite: z.boolean().default(false),
  screenshotUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional()
});

type InspirationFormData = z.infer<typeof inspirationSchema>;

interface InspirationFormProps {
  initialData?: ContentInspiration;
  isEditing?: boolean;
}

export const InspirationForm: React.FC<InspirationFormProps> = ({ initialData, isEditing = false }) => {
  const { addInspiration, updateInspiration, categories: allCategories, sourceTypes } = useInspiration();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<InspirationFormData>({
    resolver: zodResolver(inspirationSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      sourceAccount: initialData?.sourceAccount || "",
      sourceType: initialData?.sourceType || "Instagram",
      sourceUrl: initialData?.sourceUrl || "",
      categories: initialData?.categories || [],
      notes: initialData?.notes || "",
      niche: initialData?.niche || "",
      isFavorite: initialData?.isFavorite || false,
      screenshotUrl: initialData?.screenshotUrl || "",
      tags: []
    }
  });

  // Initialize tags and preview image from initialData
  useEffect(() => {
    if (initialData) {
      if (initialData.tags) {
        setTags(initialData.tags);
      }
      if (initialData.screenshotUrl) {
        setPreviewImage(initialData.screenshotUrl);
      }
    }
  }, [initialData]);

  // Handle form submission
  const onSubmit = async (data: InspirationFormData) => {
    setIsSubmitting(true);
    
    try {
      const inspirationData = {
        ...data,
        tags,
        screenshotUrl: previewImage || data.screenshotUrl
      };
      
      if (isEditing && initialData) {
        await updateInspiration(initialData.id, inspirationData);
        toast.success("Inspiration updated successfully");
      } else {
        await addInspiration(inspirationData as any);
        toast.success("Inspiration added successfully");
      }
      
      navigate("/inspiration");
    } catch (error) {
      console.error("Error saving inspiration:", error);
      toast.error("Failed to save inspiration");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding a new tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Handle tag input keydown (add tag on Enter)
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle image URL input change
  const handleImageUrlChange = (url: string) => {
    form.setValue("screenshotUrl", url);
    setPreviewImage(url);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the main details for this content inspiration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter content title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the content idea" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="niche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niche</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter the content niche" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The target niche for this content
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="categories"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Categories</FormLabel>
                        <FormDescription>
                          Select all categories that apply
                        </FormDescription>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {allCategories.map((category) => (
                          <FormField
                            key={category}
                            control={form.control}
                            name="categories"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={category}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(category)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, category])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== category
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {category}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Source Details</CardTitle>
                <CardDescription>
                  Enter information about where this content was found
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="sourceAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Account</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. @username" {...field} />
                      </FormControl>
                      <FormDescription>
                        Username or account that published this content
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sourceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sourceTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sourceUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://..." 
                          {...field} 
                          type="url"
                        />
                      </FormControl>
                      <FormDescription>
                        Link to the original content (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visual Reference</CardTitle>
                <CardDescription>
                  Add a screenshot or visual reference of the content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="screenshotUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Screenshot URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://..." 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleImageUrlChange(e.target.value);
                          }}
                          type="url"
                        />
                      </FormControl>
                      <FormDescription>
                        Link to an image of the content (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {previewImage && (
                  <div className="mt-2 rounded-md overflow-hidden border">
                    <AspectRatio ratio={16/9}>
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={() => setPreviewImage(null)}
                      />
                    </AspectRatio>
                    <div className="p-2 flex justify-end">
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setPreviewImage(null);
                          form.setValue("screenshotUrl", "");
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Add tags to help organize this content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="flex-grow"
                  />
                  <Button 
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>
                  Add any other notes or details about this content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any notes or thoughts about this content" 
                          {...field} 
                          rows={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="isFavorite"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Mark as favorite
                          </FormLabel>
                          <FormDescription>
                            Add this content to your favorites list
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/inspiration")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (isEditing ? "Update" : "Save")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
