
import { ContentProvider } from "@/context/ContentContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CustomOptionsProvider } from "@/context/CustomOptionsContext";
import { SweetSpotProvider } from "@/context/SweetSpotContext";
import { InspirationProvider } from "@/context/InspirationContext";

export const CombinedContextWrapper: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <LanguageProvider>
      <CustomOptionsProvider>
        <ContentProvider>
          <SweetSpotProvider>
            <InspirationProvider>
              {children}
            </InspirationProvider>
          </SweetSpotProvider>
        </ContentProvider>
      </CustomOptionsProvider>
    </LanguageProvider>
  );
};
