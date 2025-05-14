
import React from 'react';
import { LanguageProvider } from './LanguageContext';
import { ContentProvider } from './ContentContext';
import { CustomOptionsProvider } from './CustomOptionsContext';

export const CombinedContextWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <LanguageProvider>
      <CustomOptionsProvider>
        <ContentProvider>
          {children}
        </ContentProvider>
      </CustomOptionsProvider>
    </LanguageProvider>
  );
};
