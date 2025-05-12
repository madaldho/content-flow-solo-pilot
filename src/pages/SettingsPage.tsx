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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
        
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glassmorphism p-4 rounded-xl shadow-sm">
            <h1 className="text-2xl md:text-3xl font-elegant">
              {t("settings")}
            </h1>
          </div>
        </div>

        <div className="bg-card rounded-lg md:rounded-xl p-3 md:p-6 shadow-sm border border-border/40 glassmorphism">
          <Tabs
            defaultValue="platforms"
            value={activeTab}
            onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6 rounded-lg">
              <TabsTrigger
                value="platforms"
                className="rounded-l-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t("platformOptions")}
              </TabsTrigger>
              <TabsTrigger
                value="tags"
                className="rounded-r-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t("tagOptions")}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="platforms"
              className="animate-fade rounded-lg p-3 md:p-4 bg-background/50">
              <OptionManager
                type="platform"
                title={t("platformOptions")}
                description={t("manageOptions")}
              />
            </TabsContent>

            <TabsContent
              value="tags"
              className="animate-fade rounded-lg p-3 md:p-4 bg-background/50">
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
