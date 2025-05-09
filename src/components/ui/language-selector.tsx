
import * as React from "react";
import { Check, Globe, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export type Language = "en" | "id";

interface LanguageSelectorProps {
  language: Language;
  setLanguage: (language: Language) => void;
  variant?: "icon" | "full";
  className?: string;
}

export function LanguageSelector({ 
  language, 
  setLanguage, 
  variant = "icon", 
  className 
}: LanguageSelectorProps) {
  const { t } = useLanguage();
  
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "id", name: "Indonesia", flag: "🇮🇩" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "icon" ? (
          <Button 
            variant="outline" 
            size="icon" 
            className={cn("w-9 h-9 rounded-full shadow-sm", className)}
          >
            <Languages className="h-4 w-4" />
            <span className="sr-only">{t("toggleLanguage")}</span>
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className={cn("shadow-sm", className)}
          >
            <Languages className="h-4 w-4 mr-2" />
            {languages.find(lang => lang.code === language)?.name || "Language"}
            <span className="sr-only">{t("toggleLanguage")}</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="glassmorphism shadow-lg rounded-lg animate-fade"
        sideOffset={8}
      >
        <DropdownMenuLabel>{t("selectLanguage")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as Language)}
            className={cn(
              "cursor-pointer flex items-center gap-2",
              language === lang.code && "font-medium bg-secondary/50"
            )}
          >
            <span className="text-lg mr-1">{lang.flag}</span>
            {lang.name}
            <Check
              className={cn(
                "ml-auto h-4 w-4",
                language === lang.code ? "opacity-100" : "opacity-0"
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
