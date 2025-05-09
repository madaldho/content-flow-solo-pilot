
import { useState } from "react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/ui/language-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { OptionManager } from "@/components/OptionManager";
import { ContentTag, Platform } from "@/types/content";

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("platforms");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{t("settings")}</h1>
            <p className="text-muted-foreground">{t("customization")}</p>
          </div>
          
          <LanguageSelector 
            language={language} 
            setLanguage={setLanguage}
            variant={isMobile ? "icon" : "full"} 
          />
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border/40 glassmorphism">
          <Tabs defaultValue="platforms" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="platforms">{t("platformOptions")}</TabsTrigger>
              <TabsTrigger value="tags">{t("tagOptions")}</TabsTrigger>
            </TabsList>
            <TabsContent value="platforms" className="animate-fade">
              <OptionManager 
                type="platform"
                title={t("platformOptions")}
                description={t("manageOptions")}
              />
            </TabsContent>
            <TabsContent value="tags" className="animate-fade">
              <OptionManager 
                type="tag"
                title={t("tagOptions")}
                description={t("manageOptions")}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
