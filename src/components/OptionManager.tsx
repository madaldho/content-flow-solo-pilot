import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Check, Plus, MoreVertical, Pencil, Trash, Save, RotateCcw } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { ContentTag, Platform } from "@/types/content";

type OptionType = "platform" | "tag";

interface OptionManagerProps {
  type: OptionType;
  title: string;
  description: string;
}

export function OptionManager({ type, title, description }: OptionManagerProps) {
  const { t } = useLanguage();
  const { platforms, tags, addCustomPlatform, addCustomTag, updateCustomPlatform, updateCustomTag, removeCustomPlatform, removeCustomTag, resetCustomOptions } = useContent();
  
  const options = type === "platform" ? platforms : tags;
  const defaultOptions = type === "platform" 
    ? ["YouTube", "TikTok", "Instagram", "Twitter", "LinkedIn", "Blog", "Podcast", "Other"] 
    : ["Education", "Entertainment", "Promotion", "Tutorial", "Review", "Vlog", "Interview", "Announcement", "Other"];
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [newOptionName, setNewOptionName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  const handleAddOption = () => {
    if (newOptionName.trim()) {
      if (type === "platform") {
        addCustomPlatform(newOptionName as Platform);
      } else {
        addCustomTag(newOptionName as ContentTag);
      }
      setNewOptionName("");
      setIsAddDialogOpen(false);
    }
  };
  
  const handleEditOption = () => {
    if (selectedOption && newOptionName.trim()) {
      if (type === "platform") {
        updateCustomPlatform(selectedOption as Platform, newOptionName as Platform);
      } else {
        updateCustomTag(selectedOption as ContentTag, newOptionName as ContentTag);
      }
      setNewOptionName("");
      setSelectedOption(null);
      setIsEditDialogOpen(false);
    }
  };
  
  const handleDeleteOption = () => {
    if (selectedOption) {
      if (type === "platform") {
        removeCustomPlatform(selectedOption as Platform);
      } else {
        removeCustomTag(selectedOption as ContentTag);
      }
      setSelectedOption(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleResetOptions = () => {
    resetCustomOptions(type);
    setIsResetDialogOpen(false);
  };
  
  const isDefaultOption = (option: string) => defaultOptions.includes(option);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setIsAddDialogOpen(true)} 
            className="w-full xs:w-auto justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("addNew")}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsResetDialogOpen(true)} 
            className="w-full xs:w-auto justify-center"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t("reset")}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {Array.isArray(options) && options.map((option) => (
          <div 
            key={option}
            className={`flex items-center justify-between p-2 md:p-3 border rounded-lg ${
              isDefaultOption(option) ? "bg-secondary/20" : "bg-card hover:bg-secondary/10"
            } transition-colors`}
          >
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              {isDefaultOption(option) && (
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
              )}
              <span className="truncate">{t(option.toLowerCase()) || option}</span>
            </div>
            
            {!isDefaultOption(option) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glassmorphism">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedOption(option);
                      setNewOptionName(option);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    {t("editSelected")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedOption(option);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="text-destructive"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    {t("deleteSelected")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>
      
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px] glassmorphism">
          <DialogHeader>
            <DialogTitle>{t("addNew")}</DialogTitle>
            <DialogDescription>
              {type === "platform" ? t("platformOptions") : t("tagOptions")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              placeholder={t("enterName")}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleAddOption}>
              <Save className="h-4 w-4 mr-2" />
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] glassmorphism">
          <DialogHeader>
            <DialogTitle>{t("editSelected")}</DialogTitle>
            <DialogDescription>
              {type === "platform" ? t("platformOptions") : t("tagOptions")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-name">{t("name")}</Label>
            <Input
              id="edit-name"
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              placeholder={t("enterName")}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleEditOption}>
              <Save className="h-4 w-4 mr-2" />
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="glassmorphism">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmAction")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOption} className="bg-destructive text-destructive-foreground">
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Reset Confirmation */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent className="glassmorphism">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("reset")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmResetWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetOptions} className="bg-destructive text-destructive-foreground">
              {t("reset")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
