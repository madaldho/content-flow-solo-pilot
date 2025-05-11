
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/ui/language-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { OptionManager } from "@/components/OptionManager";

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("platforms");

  useEffect(() => {
    // Set page title
    document.title = `${t("settings")} | ContentFlow`;
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <main className="flex-1 container px-3 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold">{t("settings")}</h1>
            <p className="text-muted-foreground">{t("customization")}</p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <LanguageSelector 
              language={language} 
              setLanguage={setLanguage}
              variant={isMobile ? "icon" : "full"} 
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        <div className="bg-card rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm border border-border/40 glassmorphism">
          <Tabs defaultValue="platforms" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6 rounded-lg">
              <TabsTrigger value="platforms" className="rounded-l-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t("platformOptions")}
              </TabsTrigger>
              <TabsTrigger value="tags" className="rounded-r-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t("tagOptions")}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="platforms" className="animate-fade space-y-4 rounded-lg p-4 bg-background/50">
              <OptionManager 
                type="platform"
                title={t("platformOptions")}
                description={t("manageOptions")}
              />
            </TabsContent>
            
            <TabsContent value="tags" className="animate-fade space-y-4 rounded-lg p-4 bg-background/50">
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
