
import React, { createContext, useContext, useState, useEffect } from "react";
import { ContentTag, Platform } from "@/types/content";

// Default options
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

const defaultTags: ContentTag[] = [
  "Education",
  "Entertainment",
  "Promotion",
  "Tutorial",
  "Review",
  "Vlog",
  "Interview",
  "Announcement",
  "Other"
];

interface CustomOptionsContextType {
  platforms: Platform[];
  tags: ContentTag[];
  addCustomPlatform: (platform: Platform) => void;
  addCustomTag: (tag: ContentTag) => void;
  updateCustomPlatform: (oldPlatform: Platform, newPlatform: Platform) => void;
  updateCustomTag: (oldTag: ContentTag, newTag: ContentTag) => void;
  removeCustomPlatform: (platform: Platform) => void;
  removeCustomTag: (tag: ContentTag) => void;
  resetCustomOptions: (type: "platform" | "tag") => void;
}

const CustomOptionsContext = createContext<CustomOptionsContextType | undefined>(undefined);

export const CustomOptionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [platforms, setPlatforms] = useState<Platform[]>(() => {
    const savedPlatforms = localStorage.getItem('customPlatforms');
    return savedPlatforms ? JSON.parse(savedPlatforms) : defaultPlatforms;
  });
  
  const [tags, setTags] = useState<ContentTag[]>(() => {
    const savedTags = localStorage.getItem('customTags');
    return savedTags ? JSON.parse(savedTags) : defaultTags;
  });
  
  useEffect(() => {
    localStorage.setItem('customPlatforms', JSON.stringify(platforms));
  }, [platforms]);
  
  useEffect(() => {
    localStorage.setItem('customTags', JSON.stringify(tags));
  }, [tags]);
  
  const addCustomPlatform = (platform: Platform) => {
    if (!platforms.includes(platform)) {
      setPlatforms([...platforms, platform]);
    }
  };
  
  const addCustomTag = (tag: ContentTag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };
  
  const updateCustomPlatform = (oldPlatform: Platform, newPlatform: Platform) => {
    if (!defaultPlatforms.includes(oldPlatform) && !platforms.includes(newPlatform)) {
      setPlatforms(platforms.map(p => p === oldPlatform ? newPlatform : p));
    }
  };
  
  const updateCustomTag = (oldTag: ContentTag, newTag: ContentTag) => {
    if (!defaultTags.includes(oldTag) && !tags.includes(newTag)) {
      setTags(tags.map(t => t === oldTag ? newTag : t));
    }
  };
  
  const removeCustomPlatform = (platform: Platform) => {
    if (!defaultPlatforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    }
  };
  
  const removeCustomTag = (tag: ContentTag) => {
    if (!defaultTags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    }
  };
  
  const resetCustomOptions = (type: "platform" | "tag") => {
    if (type === "platform") {
      setPlatforms([...defaultPlatforms]);
    } else {
      setTags([...defaultTags]);
    }
  };
  
  return (
    <CustomOptionsContext.Provider value={{
      platforms,
      tags,
      addCustomPlatform,
      addCustomTag,
      updateCustomPlatform,
      updateCustomTag,
      removeCustomPlatform,
      removeCustomTag,
      resetCustomOptions
    }}>
      {children}
    </CustomOptionsContext.Provider>
  );
};

export const useCustomOptions = (): CustomOptionsContextType => {
  const context = useContext(CustomOptionsContext);
  if (context === undefined) {
    throw new Error('useCustomOptions must be used within a CustomOptionsProvider');
  }
  return context;
};
