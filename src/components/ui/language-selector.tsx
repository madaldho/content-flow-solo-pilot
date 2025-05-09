
import * as React from "react";
import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type Language = "en" | "id";

interface LanguageSelectorProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

export function LanguageSelector({ language, setLanguage }: LanguageSelectorProps) {
  const languages = [
    { code: "en", name: "English" },
    { code: "id", name: "Indonesia" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-9 h-9 rounded-full">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glassmorphism">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as Language)}
            className={cn(
              "cursor-pointer",
              language === lang.code && "font-medium"
            )}
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                language === lang.code ? "opacity-100" : "opacity-0"
              )}
            />
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
