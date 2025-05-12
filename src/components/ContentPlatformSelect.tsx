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
import { Platform } from "@/types/content";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import { Badge } from "@/components/ui/badge";
import { getPlatformIcon, getPlatformColor, getPlatformBgColor, getPlatformTextColor } from "@/lib/platform-utils";

interface ContentPlatformSelectProps {
  value: Platform[];
  onValueChange: (value: Platform[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Default platforms yang tetap
const defaultPlatforms: Platform[] = [
  "YouTube", 
  "TikTok", 
  "Instagram", 
  "Twitter", 
  "LinkedIn", 
  "Blog", 
  "Podcast", 
  "Other"
];

export function ContentPlatformSelect({
  value = [], // Provide default empty array to prevent undefined
  onValueChange,
  open,
  onOpenChange,
}: ContentPlatformSelectProps) {
  const { t } = useLanguage();
  const { platforms, addCustomPlatform } = useContent();
  const [inputValue, setInputValue] = React.useState<string>('');
  
  // Combine default platforms with custom platforms from context
  const availablePlatforms: Platform[] = React.useMemo(() => {
    // Pastikan platforms dari context valid, jika tidak gunakan default
    const customPlatforms = Array.isArray(platforms) ? platforms : [];
    // Gabungkan dan hapus duplikat
    return [...new Set([...defaultPlatforms, ...customPlatforms])];
  }, [platforms]);
  
  // Memastikan value selalu berupa array
  const safeValue = React.useMemo(() => 
    Array.isArray(value) ? value : []
  , [value]);
  
  // Function untuk toggle platform selection
  const togglePlatform = (platform: Platform) => {
    if (safeValue.includes(platform)) {
      onValueChange(safeValue.filter((p) => p !== platform));
    } else {
      onValueChange([...safeValue, platform]);
    }
  };

  // Function untuk remove platform
  const handleRemovePlatform = (platform: Platform, e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(safeValue.filter((p) => p !== platform));
  };

  // Function untuk add custom platform dengan Enter key
  const handleAddCustomPlatform = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newPlatform = inputValue.trim() as Platform;
      
      if (!availablePlatforms.includes(newPlatform)) {
        addCustomPlatform(newPlatform);
      }
      
      if (!safeValue.includes(newPlatform)) {
        onValueChange([...safeValue, newPlatform]);
      }
      
      setInputValue('');
    }
  };

  // Function untuk add custom platform dengan button
  const handleAddCustomPlatformButton = () => {
    if (inputValue.trim()) {
      const newPlatform = inputValue.trim() as Platform;
      
      if (!availablePlatforms.includes(newPlatform)) {
        addCustomPlatform(newPlatform);
      }
      
      if (!safeValue.includes(newPlatform)) {
        onValueChange([...safeValue, newPlatform]);
      }
      
      setInputValue('');
    }
  };

  // Logging untuk debug
  React.useEffect(() => {
    console.log("Available platforms:", availablePlatforms);
    console.log("Selected platforms:", safeValue);
  }, [availablePlatforms, safeValue]);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between rounded-lg border-input bg-background hover:bg-secondary/30 transition-colors"
          >
            {safeValue.length > 0
              ? `${safeValue.length} ${t(safeValue.length > 1 ? "platforms" : "platform")} ${t("selected")}`
              : t("selectPlatforms")}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        {open && (
          <PopoverContent className="w-full p-0 rounded-lg shadow-lg border border-border/50 bg-popover/95 backdrop-blur-sm">
            <Command>
              <div className="flex items-center border-b p-2">
                <CommandInput 
                  placeholder={t("searchPlatforms")} 
                  className="rounded-lg flex-1" 
                  value={inputValue}
                  onValueChange={setInputValue}
                  onKeyDown={handleAddCustomPlatform}
                />
                {inputValue.trim() && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleAddCustomPlatformButton}
                    className="ml-2"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CommandList>
                <CommandEmpty>{t("noPlatformFound")}</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto p-2">
                  {availablePlatforms.map((platform) => (
                    <CommandItem
                      key={platform}
                      value={platform}
                      onSelect={() => togglePlatform(platform)}
                      className="flex items-center gap-2 rounded-lg hover:bg-secondary/50 transition-colors mb-1"
                    >
                      <div className={cn(
                        "flex items-center justify-center rounded-md border w-5 h-5",
                        safeValue.includes(platform) ? "bg-primary border-primary" : "border-input"
                      )}>
                        {safeValue.includes(platform) && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-6 h-6 flex items-center justify-center rounded-full" 
                          style={{ 
                            backgroundColor: getPlatformBgColor(platform), 
                            color: getPlatformColor(platform),
                            border: `1px solid ${getPlatformColor(platform)}30` 
                          }}
                        >
                          {getPlatformIcon(platform)}
                        </span>
                      <span>{platform}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
      
      {safeValue.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {safeValue.map((platform) => (
            <Badge 
              key={platform} 
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
              style={{
                backgroundColor: getPlatformBgColor(platform),
                color: getPlatformColor(platform),
                border: `1px solid ${getPlatformColor(platform)}30` 
              }}
            >
              <span className="mr-1">{getPlatformIcon(platform)}</span>
              {platform}
              <X 
                className="h-3 w-3 cursor-pointer ml-1" 
                onClick={(e) => handleRemovePlatform(platform, e)} 
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
} 