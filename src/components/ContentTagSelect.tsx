
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
  value,
  onValueChange,
  open,
  onOpenChange,
}: ContentTagSelectProps) {
  const toggleTag = (tag: ContentTag) => {
    if (value.includes(tag)) {
      onValueChange(value.filter((t) => t !== tag));
    } else {
      onValueChange([...value, tag]);
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
          {value.length > 0
            ? `${value.length} tag${value.length > 1 ? "s" : ""} selected`
            : "Select tags..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 rounded-xl shadow-lg border border-border/50 bg-popover/95 backdrop-blur-sm">
        <Command>
          <CommandInput placeholder="Search tags..." className="rounded-lg" />
          <CommandEmpty>No tag found.</CommandEmpty>
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
                    value.includes(tag) ? "opacity-100" : "opacity-0"
                  )}
                />
                {tag}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
