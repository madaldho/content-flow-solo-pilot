
import * as React from "react";
import { MoreHorizontal, Edit, Trash2, MoveRight, History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
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
  
  const allStatuses: ContentStatus[] = [
    "Idea", 
    "Script", 
    "Recorded", 
    "Edited", 
    "Ready to Publish", 
    "Published"
  ];
  
  const nextStatus: Record<ContentStatus, ContentStatus | null> = {
    "Idea": "Script",
    "Script": "Recorded",
    "Recorded": "Edited",
    "Edited": "Ready to Publish",
    "Ready to Publish": "Published",
    "Published": null
  };
  
  const statusColors: Record<ContentStatus, string> = {
    "Idea": "text-status-idea",
    "Script": "text-status-script",
    "Recorded": "text-status-recorded",
    "Edited": "text-status-edited",
    "Ready to Publish": "text-status-ready",
    "Published": "text-status-published"
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`action-dots p-1 h-8 w-8 rounded-full hover:bg-muted ${className || ""}`}
          onClick={e => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glassmorphism bg-background/95 backdrop-blur-sm z-50">
        <DropdownMenuLabel className="font-display">{t("actions")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={(e) => { 
          e.stopPropagation();
          onEdit();
        }}>
          <Edit className="mr-2 h-4 w-4" />
          {t("edit")}
        </DropdownMenuItem>
        
        {currentStatus && onMove && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {t("moveToStatus")}
            </DropdownMenuLabel>
            
            {/* Direct next status option */}
            {nextStatus[currentStatus] && (
              <DropdownMenuItem 
                className="font-medium"
                onClick={(e) => { 
                  e.stopPropagation();
                  const nextStat = nextStatus[currentStatus]!;
                  console.log(`Action Menu: Moving from ${currentStatus} to ${nextStat}`);
                  onMove(nextStat);
                }}
              >
                <MoveRight className={`mr-2 h-4 w-4 ${statusColors[nextStatus[currentStatus]!]}`} />
                {t(nextStatus[currentStatus]!.toLowerCase().replace(/\s+/g, ""))}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="pl-2">
                <History className="mr-2 h-4 w-4" />
                {t("allStatuses")}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-48 glassmorphism bg-background/95 backdrop-blur-sm z-50">
                  {allStatuses
                    .filter(status => status !== currentStatus)
                    .map(status => (
                      <DropdownMenuItem
                        key={status}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMove(status);
                        }}
                        className={`${status === nextStatus[currentStatus] ? 'font-medium' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full mr-2 ${statusColors[status].replace('text-', 'bg-')}`}></div>
                        {t(status.toLowerCase().replace(/\s+/g, ""))}
                      </DropdownMenuItem>
                    ))
                  }
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </>
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
