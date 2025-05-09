import { useState } from "react";
import { useContent } from "@/context/ContentContext";
import { ContentItem } from "@/types/content";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { ContentForm } from "./ContentForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ExternalLink, File, FileText, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { HistoryTimeline } from "./HistoryTimeline";
import { useLanguage } from "@/context/LanguageContext";

interface ContentDetailsProps {
  contentId: string | null;
  onClose: () => void;
}

export function ContentDetails({ contentId, onClose }: ContentDetailsProps) {
  const { getContentById, deleteContentItem, updateContentItem } = useContent();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // If no content ID, return null
  if (!contentId) return null;
  
  // Get content item from context
  const content = getContentById(contentId);
  
  // If content not found, return null
  if (!content) return null;
  
  const handleEditContent = () => {
    setIsEditing(true);
  };

  const handleDeleteContent = () => {
    deleteContentItem(content.id);
    onClose();
  };

  const statusColors = {
    "Idea": "bg-status-idea text-white",
    "Script": "bg-status-script text-white",
    "Recorded": "bg-status-recorded text-white",
    "Edited": "bg-status-edited text-white",
    "Ready to Publish": "bg-status-ready text-white",
    "Published": "bg-status-published text-white"
  };
  
  // If editing, show the edit form
  if (isEditing) {
    return (
      <Dialog open={true} onOpenChange={() => setIsEditing(false)}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("edit")}</DialogTitle>
          </DialogHeader>
          <ContentForm 
            initialData={content} 
            onClose={() => setIsEditing(false)} 
          />
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={contentId !== null} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{content.title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1"
              >
                <History className="h-4 w-4" />
                {t("statusHistory")}
              </Button>
              <Badge className={statusColors[content.status]}>{t(content.status.toLowerCase().replace(/\s+/g, ""))}</Badge>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">{t("platform")}</h3>
              <p>{content.platform}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">{t("created")}</h3>
              <p>{format(content.createdAt, "MMM dd, yyyy")}</p>
            </div>
          </div>
          
          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">{t("tags")}</h3>
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Notes */}
          {content.notes && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">{t("notes")}</h3>
              <p className="whitespace-pre-wrap">{content.notes}</p>
            </div>
          )}
          
          {/* Reference Link */}
          {content.referenceLink && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">{t("referenceLink")}</h3>
              <a 
                href={content.referenceLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                {content.referenceLink.length > 40 
                  ? content.referenceLink.substring(0, 40) + '...' 
                  : content.referenceLink}
              </a>
            </div>
          )}
          
          {/* Script */}
          {content.script && (
            <>
              <Separator />
              <div>
                <h3 className="text-base font-semibold mb-2">{t("scriptContent")}</h3>
                <Card className="p-4 bg-muted/50">
                  <div className="whitespace-pre-wrap">{content.script}</div>
                </Card>
              </div>
            </>
          )}
          
          {/* Content Checklist */}
          {(content.status !== "Idea") && (
            <div>
              <h3 className="text-base font-semibold mb-2">{t("contentChecklist")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="intro" 
                    checked={content.contentChecklist.intro} 
                    onCheckedChange={(checked) => {
                      updateContentItem(content.id, {
                        contentChecklist: {
                          ...content.contentChecklist,
                          intro: !!checked
                        }
                      });
                    }}
                  />
                  <label
                    htmlFor="intro"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("intro")}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="mainPoints" 
                    checked={content.contentChecklist.mainPoints} 
                    onCheckedChange={(checked) => {
                      updateContentItem(content.id, {
                        contentChecklist: {
                          ...content.contentChecklist,
                          mainPoints: !!checked
                        }
                      });
                    }}
                  />
                  <label
                    htmlFor="mainPoints"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("mainPoints")}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="callToAction" 
                    checked={content.contentChecklist.callToAction}
                    onCheckedChange={(checked) => {
                      updateContentItem(content.id, {
                        contentChecklist: {
                          ...content.contentChecklist,
                          callToAction: !!checked
                        }
                      });
                    }}
                  />
                  <label
                    htmlFor="callToAction"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("callToAction")}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="outro" 
                    checked={content.contentChecklist.outro}
                    onCheckedChange={(checked) => {
                      updateContentItem(content.id, {
                        contentChecklist: {
                          ...content.contentChecklist,
                          outro: !!checked
                        }
                      });
                    }}
                  />
                  <label
                    htmlFor="outro"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("outro")}
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {/* Production Notes */}
          {content.productionNotes && (
            <>
              <Separator />
              <div>
                <h3 className="text-base font-semibold mb-1">{t("productionNotes")}</h3>
                <p className="whitespace-pre-wrap">{content.productionNotes}</p>
              </div>
            </>
          )}
          
          {/* Equipment Used */}
          {content.equipmentUsed && content.equipmentUsed.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">{t("equipmentUsed")}</h3>
              <div className="flex flex-wrap gap-2">
                {content.equipmentUsed.map((equipment, index) => (
                  <Badge key={index} variant="outline">{equipment}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Content Files */}
          {content.contentFiles && content.contentFiles.length > 0 && (
            <div>
              <h3 className="text-base font-semibold mb-2">{t("contentFiles")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {content.contentFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded-md"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Publication Date */}
          {content.publicationDate && (
            <>
              <Separator />
              <div>
                <h3 className="text-base font-semibold">{t("publishing")}</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground">{t("publicationDate")}</h4>
                    <p>{format(content.publicationDate, "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground">{t("status")}</h4>
                    <Badge className={statusColors[content.status]}>{t(content.status.toLowerCase().replace(/\s+/g, ""))}</Badge>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Metrics */}
          {content.metrics && content.status === "Published" && (
            <>
              <Separator />
              <div>
                <h3 className="text-base font-semibold mb-2">{t("performance")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">{t("views")}</p>
                    <p className="text-xl font-semibold">{content.metrics.views || 0}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">{t("likes")}</p>
                    <p className="text-xl font-semibold">{content.metrics.likes || 0}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">{t("comments")}</p>
                    <p className="text-xl font-semibold">{content.metrics.comments || 0}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">{t("shares")}</p>
                    <p className="text-xl font-semibold">{content.metrics.shares || 0}</p>
                  </div>
                </div>
                
                {/* Rating */}
                {content.metrics.rating && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">{t("rating")}</h4>
                    <p>{"⭐".repeat(content.metrics.rating)}</p>
                  </div>
                )}
                
                {/* Insights */}
                {content.metrics.insights && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">{t("insights")}</h4>
                    <p className="whitespace-pre-wrap">{content.metrics.insights}</p>
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* History Timeline */}
          {showHistory && (
            <div className="mt-4 border rounded-md p-3 bg-muted/30">
              <HistoryTimeline history={content.history} />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">{t("delete")}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deleteWarning")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteContent}>{t("delete")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button onClick={handleEditContent}>{t("edit")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
