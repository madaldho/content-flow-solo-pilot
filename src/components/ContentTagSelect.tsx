
import * as React from "react";
import { Check, ChevronsUpDown, Tags } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ContentTag } from "@/types/content";
import { useLanguage } from "@/context/LanguageContext";

const availableTags: ContentTag[] = [
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
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];
  
  const toggleTag = (tag: ContentTag) => {
    if (safeValue.includes(tag)) {
      onValueChange(safeValue.filter((t) => t !== tag));
    } else {
      onValueChange([...safeValue, tag]);
    }
  };

  return (
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
          <CommandInput placeholder={t("searchTags")} className="rounded-lg" />
          <CommandEmpty>{t("noTagFound")}</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {availableTags.map((tag) => (
              <CommandItem
                key={tag}
                value={tag}
                onSelect={() => toggleTag(tag)}
                className="flex items-center gap-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    safeValue.includes(tag) ? "opacity-100" : "opacity-0"
                  )}
                />
                {t(tag.toLowerCase()) || tag}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
