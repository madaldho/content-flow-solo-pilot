
import * as React from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ContentTag } from "@/types/content";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import { Badge } from "@/components/ui/badge";

interface ContentTagSelectProps {
  value: ContentTag[];
  onValueChange: (value: ContentTag[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentTagSelect({
  value = [], // Provide default empty array to prevent undefined
  onValueChange,
  open,
  onOpenChange,
}: ContentTagSelectProps) {
  const { t } = useLanguage();
  const { tags, addCustomTag } = useContent();
  const [inputValue, setInputValue] = React.useState<string>('');
  
  // Default tags as a fallback
  const defaultTags: ContentTag[] = [
    "Education",
    "Entertainment",
    "Promotion",
    "Tutorial",
    "Review",
    "Vlog",
    "Interview",
    "Announcement",
    "Other",
  ];

  // Combine default tags with custom tags from context
  const availableTags: ContentTag[] = React.useMemo(() => {
    // Ensure tags is an array before attempting to spread it
    const customTags = Array.isArray(tags) ? tags : [];
    return [...new Set([...defaultTags, ...customTags])];
  }, [tags]);
  
  // Ensure value is always an array
  const safeValue = React.useMemo(() => 
    Array.isArray(value) ? value : []
  , [value]);
  
  const toggleTag = (tag: ContentTag) => {
    if (safeValue.includes(tag)) {
      onValueChange(safeValue.filter((t) => t !== tag));
    } else {
      onValueChange([...safeValue, tag]);
    }
  };

  const handleRemoveTag = (tag: ContentTag, e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(safeValue.filter((t) => t !== tag));
  };

  const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim() as ContentTag;
      
      if (!availableTags.includes(newTag)) {
        addCustomTag(newTag);
      }
      
      if (!safeValue.includes(newTag)) {
        onValueChange([...safeValue, newTag]);
      }
      
      setInputValue('');
    }
  };

  const handleAddCustomTagButton = () => {
    if (inputValue.trim()) {
      const newTag = inputValue.trim() as ContentTag;
      
      if (!availableTags.includes(newTag)) {
        addCustomTag(newTag);
      }
      
      if (!safeValue.includes(newTag)) {
        onValueChange([...safeValue, newTag]);
      }
      
      setInputValue('');
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between rounded-xl border-input bg-background hover:bg-secondary/30 transition-colors"
          >
            {safeValue.length > 0
              ? `${safeValue.length} ${t(safeValue.length > 1 ? "tags" : "tag")} ${t("selected")}`
              : t("selectTags")}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 rounded-xl shadow-lg border border-border/50 bg-popover/95 backdrop-blur-sm">
          <Command>
            <div className="flex items-center border-b p-2">
              <CommandInput 
                placeholder={t("searchTags")} 
                className="rounded-lg flex-1" 
                value={inputValue}
                onValueChange={setInputValue}
                onKeyDown={handleAddCustomTag}
              />
              {inputValue.trim() && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleAddCustomTagButton}
                  className="ml-2"
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CommandList>
              <CommandEmpty>{t("noTagFound")}</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto p-2">
                {availableTags.map((tag) => (
                  <CommandItem
                    key={tag}
                    value={tag}
                    onSelect={() => toggleTag(tag)}
                    className="flex items-center gap-2 rounded-lg hover:bg-secondary/50 transition-colors mb-1"
                  >
                    <div className={cn(
                      "flex items-center justify-center rounded-md border w-5 h-5",
                      safeValue.includes(tag) ? "bg-primary border-primary" : "border-input"
                    )}>
                      {safeValue.includes(tag) && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span>{t(tag.toLowerCase()) || tag}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {safeValue.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {safeValue.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              {t(tag.toLowerCase()) || tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={(e) => handleRemoveTag(tag, e)} 
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
