import * as React from "react";
import { MoreHorizontal, Edit, Trash2, MoveRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ContentStatus } from "@/types/content";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "./ui/button";

interface ContentActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onMove?: (status: ContentStatus) => void;
  currentStatus?: ContentStatus;
  className?: string;
}

export function ContentActionMenu({ 
  onEdit, 
  onDelete, 
  onMove, 
  currentStatus,
  className 
}: ContentActionMenuProps) {
  const { t } = useLanguage();
  
  const nextStatus: Record<ContentStatus, ContentStatus | null> = {
    "Idea": "Script",
    "Script": "Recorded",
    "Recorded": "Edited",
    "Edited": "Ready to Publish",
    "Ready to Publish": "Published",
    "Published": null
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`action-dots ${className}`}
          onClick={e => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 glassmorphism">
        <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={(e) => { 
          e.stopPropagation();
          onEdit();
        }}>
          <Edit className="mr-2 h-4 w-4" />
          {t("edit")}
        </DropdownMenuItem>
        
        {currentStatus && onMove && nextStatus[currentStatus] && (
          <DropdownMenuItem onClick={(e) => { 
            e.stopPropagation();
            const nextStat = nextStatus[currentStatus]!;
            console.log(`Action Menu: Moving from ${currentStatus} to ${nextStat}`);
            onMove(nextStat);
          }}>
            <MoveRight className="mr-2 h-4 w-4" />
            {t("moveTo")} {t(nextStatus[currentStatus]!.toLowerCase().replace(/\s+/g, ""))}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={(e) => { 
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t("delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
