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
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  CreditCard, 
  DollarSign, 
  ExternalLink, 
  File, 
  FileText, 
  HandshakeIcon, 
  History, 
  Users, 
  Facebook, 
  Instagram, 
  Youtube, 
  Twitter, 
  Linkedin, 
  Globe,
  Calendar,
  CheckCircle2,
  Tag,
  StickyNote,
  Pencil,
  Trash2,
  Eye,
  ThumbsUp,
  MessageCircle,
  Share2,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HistoryTimeline } from "./HistoryTimeline";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { getPlatformIcon, getPlatformColor, getPlatformBgColor } from "@/lib/platform-utils";
import { cn } from "@/lib/utils";

interface ContentDetailsProps {
  contentId: string | null;
  onClose: () => void;
}

// Fungsi untuk mendapatkan ikon platform yang sesuai dari Lucide React
const getPlatformLucideIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'youtube':
      return <Youtube className="h-5 w-5" />;
    case 'instagram':
      return <Instagram className="h-5 w-5" />;
    case 'facebook':
      return <Facebook className="h-5 w-5" />;
    case 'twitter':
      return <Twitter className="h-5 w-5" />;
    case 'linkedin':
      return <Linkedin className="h-5 w-5" />;
    default:
      return <Globe className="h-5 w-5" />;
  }
};

// Fungsi untuk mendapatkan gradien warna berdasarkan status
const getStatusGradient = (status: string) => {
  switch (status) {
    case "Idea":
      return "from-purple-500 to-indigo-600";
    case "Script":
      return "from-blue-500 to-cyan-600";
    case "Recorded":
      return "from-amber-500 to-orange-600";
    case "Edited":
      return "from-emerald-500 to-teal-600";
    case "Ready to Publish":
      return "from-sky-500 to-blue-600";
    case "Published":
      return "from-green-500 to-emerald-600";
    default:
      return "from-slate-500 to-gray-600";
  }
};

export function ContentDetails({ contentId, onClose }: ContentDetailsProps) {
  const { getContentById, deleteContentItem, updateContentItem } = useContent();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'script' | 'checklist' | 'metrics'>('details');
  const navigate = useNavigate();
  
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
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
        {/* Header dengan background gradient berdasarkan status */}
        <div className={`bg-gradient-to-r ${getStatusGradient(content.status)} px-6 py-4 rounded-t-lg`}>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Badge className="bg-white/20 hover:bg-white/30 text-white" variant="outline">
                {getPlatformLucideIcon(content.platform)}
                <span className="ml-1">{content.platform}</span>
              </Badge>
            <div className="flex items-center gap-2">
              <Button
                  variant="ghost"
                  size="icon"
                onClick={() => setShowHistory(!showHistory)}
                  className="text-white hover:bg-white/20"
                >
                  <History className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditContent}
                  className="text-white hover:bg-white/20"
                >
                  <Pencil className="h-5 w-5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <Trash2 className="h-5 w-5" />
              </Button>
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
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">{content.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(content.createdAt, "dd MMM yyyy")}
              </div>
              <Badge className="bg-white/20 hover:bg-white/20 text-white">
                {t(content.status.toLowerCase().replace(/\s+/g, ""))}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="border-b px-6">
          <div className="flex space-x-4 -mb-px">
            <button
              onClick={() => setActiveTab('details')}
              className={cn(
                "py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap",
                activeTab === 'details'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
            >
              {t("details")}
            </button>
            {content.script && (
              <button
                onClick={() => setActiveTab('script')}
                className={cn(
                  "py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap",
                  activeTab === 'script'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                {t("script")}
              </button>
            )}
            {content.status !== "Idea" && (
              <button
                onClick={() => setActiveTab('checklist')}
                className={cn(
                  "py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap",
                  activeTab === 'checklist'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                {t("checklist")}
              </button>
            )}
            {content.status === "Published" && content.metrics && (
              <button
                onClick={() => setActiveTab('metrics')}
                className={cn(
                  "py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap",
                  activeTab === 'metrics'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                {t("metrics")}
              </button>
            )}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="px-6 py-4 overflow-y-auto">
          {/* History Timeline */}
          {showHistory && (
            <Card className="mb-6 bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("statusHistory")}</CardTitle>
              </CardHeader>
              <CardContent>
                <HistoryTimeline history={content.history} />
              </CardContent>
            </Card>
          )}
          
          {/* Tab: Details */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Tags Section */}
          {content.tags && content.tags.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">{t("tags")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="px-3 py-1">{tag}</Badge>
                ))}
              </div>
                  </CardContent>
                </Card>
          )}
          
              {/* Notes Section */}
          {content.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <StickyNote className="h-4 w-4 text-amber-500" />
                      <CardTitle className="text-base">{t("notes")}</CardTitle>
            </div>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-base leading-relaxed">{content.notes}</div>
                  </CardContent>
                </Card>
          )}
          
          {/* Reference Link */}
          {content.referenceLink && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                      <CardTitle className="text-base">{t("referenceLink")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
              <a 
                href={content.referenceLink} 
                target="_blank" 
                rel="noopener noreferrer"
                      className="text-primary flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors w-fit"
              >
                <ExternalLink className="h-4 w-4" />
                      <span className="underline">
                {content.referenceLink.length > 40 
                  ? content.referenceLink.substring(0, 40) + '...' 
                  : content.referenceLink}
                      </span>
                    </a>
                  </CardContent>
                </Card>
              )}
              
              {/* Content Link */}
              {content.status === "Published" && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-indigo-500" />
                      <CardTitle className="text-base">{t("contentLink") || "Link Konten"}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Tampilkan platform links jika ada */}
                    {content.platformLinks && Object.keys(content.platformLinks).length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(content.platformLinks)
                          .filter(([platform, link]) => link) // Hanya tampilkan yang memiliki link
                          .map(([platform, link]) => (
                            <a 
                              key={platform}
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 rounded-md hover:opacity-90 transition-opacity"
                              style={{
                                backgroundColor: getPlatformBgColor(platform),
                                color: getPlatformColor(platform),
                                border: `1px solid ${getPlatformColor(platform)}30`
                              }}
                            >
                              {getPlatformLucideIcon(platform)}
                              <span className="font-medium">{platform}</span>
                            </a>
                          ))}
                      </div>
                    ) : content.contentLink ? (
                      // Tampilkan contentLink lama jika tidak ada platformLinks
                      <a 
                        href={content.contentLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:opacity-90 transition-opacity"
                        style={{
                          backgroundColor: getPlatformBgColor(content.platform),
                          color: getPlatformColor(content.platform),
                          border: `1px solid ${getPlatformColor(content.platform)}30`
                        }}
                      >
                        {getPlatformLucideIcon(content.platform)}
                        <span className="font-medium">{content.platform}</span>
                      </a>
                    ) : (
                      <div className="text-sm text-muted-foreground">Tidak ada link konten</div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Endorsement & Collaboration */}
              {(content.isEndorsement || content.isCollaboration) && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <HandshakeIcon className="h-4 w-4 text-emerald-500" />
                      <CardTitle className="text-base">{t("partnerDetails")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {content.isEndorsement && (
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <h4 className="font-medium text-green-700 dark:text-green-400">{t("endorsement")}</h4>
                          </div>
                          {content.endorsementName && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">{t("endorsementName")}:</span>
                              <span className="ml-2">{content.endorsementName}</span>
                            </div>
                          )}
                          {content.endorsementPrice && (
                            <div>
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">{t("endorsementPrice")}:</span>
                              <span className="ml-2">{content.endorsementPrice}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {content.isCollaboration && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="h-5 w-5 text-blue-500" />
                            <h4 className="font-medium text-blue-700 dark:text-blue-400">{t("collaboration")}</h4>
                          </div>
                          {content.collaborationName && (
                            <div>
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{t("collaborationName")}:</span>
                              <span className="ml-2">{content.collaborationName}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Production Notes */}
              {content.productionNotes && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-violet-500" />
                      <CardTitle className="text-base">{t("productionNotes")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-base leading-relaxed">{content.productionNotes}</div>
                  </CardContent>
                </Card>
              )}
              
              {/* Equipment Used */}
              {content.equipmentUsed && content.equipmentUsed.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-orange-500" />
                      <CardTitle className="text-base">{t("equipmentUsed")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {content.equipmentUsed.map((equipment, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">{equipment}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Content Files */}
              {content.contentFiles && content.contentFiles.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-cyan-500" />
                      <CardTitle className="text-base">{t("contentFiles")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {content.contentFiles.map((file, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border hover:bg-muted transition-colors"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate">{file}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Publication Date */}
              {content.publicationDate && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-teal-500" />
                      <CardTitle className="text-base">{t("publishing")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 p-4 rounded-lg border flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">{t("publicationDate")}</h4>
                        <p className="font-medium text-lg">{format(content.publicationDate, "dd MMMM yyyy")}</p>
                      </div>
                      <Badge 
                        className={`${statusColors[content.status]} text-sm px-3 py-1`}
                      >
                        {t(content.status.toLowerCase().replace(/\s+/g, ""))}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Tab: Script */}
          {activeTab === 'script' && content.script && (
            <Card className="bg-gradient-to-b from-transparent to-muted/20">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">{t("scriptContent")}</CardTitle>
                </div>
                <CardDescription>
                  {t("scriptDescription") || "Naskah konten lengkap"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-5 rounded-lg border">
                  <div className="whitespace-pre-wrap text-base leading-relaxed font-medium">
                    {content.script}
                  </div>
                </div>
              </CardContent>
                </Card>
          )}
          
          {/* Tab: Checklist */}
          {activeTab === 'checklist' && content.status !== "Idea" && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <CardTitle className="text-base">{t("contentChecklist")}</CardTitle>
                </div>
                <CardDescription>
                  {t("checklistDescription") || "Pantau kemajuan dan kelengkapan konten Anda"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className={`flex items-start p-4 rounded-lg border transition-colors ${content.contentChecklist.intro ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-muted/30 border-muted'}`}>
                    <div className="mr-4 pt-0.5">
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
                        className={content.contentChecklist.intro ? 'bg-green-500 border-green-500' : ''}
                  />
                    </div>
                    <div>
                  <label
                    htmlFor="intro"
                        className={`text-base font-medium ${content.contentChecklist.intro ? 'text-green-700 dark:text-green-400' : ''}`}
                  >
                    {t("intro")}
                  </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("introDescription") || "Pembukaan yang menarik perhatian audiens dan memperkenalkan topik"}
                      </p>
                    </div>
                </div>
                  
                  <div className={`flex items-start p-4 rounded-lg border transition-colors ${content.contentChecklist.mainPoints ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-muted/30 border-muted'}`}>
                    <div className="mr-4 pt-0.5">
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
                        className={content.contentChecklist.mainPoints ? 'bg-green-500 border-green-500' : ''}
                  />
                    </div>
                    <div>
                  <label
                    htmlFor="mainPoints"
                        className={`text-base font-medium ${content.contentChecklist.mainPoints ? 'text-green-700 dark:text-green-400' : ''}`}
                  >
                    {t("mainPoints")}
                  </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("mainPointsDescription") || "Poin-poin utama dan pembahasan konten"}
                      </p>
                    </div>
                </div>
                  
                  <div className={`flex items-start p-4 rounded-lg border transition-colors ${content.contentChecklist.callToAction ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-muted/30 border-muted'}`}>
                    <div className="mr-4 pt-0.5">
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
                        className={content.contentChecklist.callToAction ? 'bg-green-500 border-green-500' : ''}
                  />
                    </div>
                    <div>
                  <label
                    htmlFor="callToAction"
                        className={`text-base font-medium ${content.contentChecklist.callToAction ? 'text-green-700 dark:text-green-400' : ''}`}
                  >
                    {t("callToAction")}
                  </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("callToActionDescription") || "Ajakan untuk audiens melakukan tindakan tertentu"}
                      </p>
                    </div>
                </div>
                  
                  <div className={`flex items-start p-4 rounded-lg border transition-colors ${content.contentChecklist.outro ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-muted/30 border-muted'}`}>
                    <div className="mr-4 pt-0.5">
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
                        className={content.contentChecklist.outro ? 'bg-green-500 border-green-500' : ''}
                  />
                    </div>
                    <div>
                  <label
                    htmlFor="outro"
                        className={`text-base font-medium ${content.contentChecklist.outro ? 'text-green-700 dark:text-green-400' : ''}`}
                  >
                    {t("outro")}
                  </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("outroDescription") || "Penutup konten yang berkesan"}
                      </p>
                </div>
              </div>
            </div>
              </CardContent>
            </Card>
          )}
          
          {/* Tab: Metrics */}
          {activeTab === 'metrics' && content.status === "Published" && content.metrics && (
            <div className="space-y-6">
              <Card className="overflow-hidden border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 py-5">
                  <CardTitle className="text-white text-center text-lg">{t("performanceMetrics")}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-b from-sky-50 to-sky-100 dark:from-sky-950/40 dark:to-sky-900/20 p-4 rounded-xl text-center shadow-sm border border-sky-200 dark:border-sky-900/50">
                      <div className="flex justify-center mb-2">
                        <Eye className="h-6 w-6 text-sky-500" />
              </div>
                      <p className="text-sky-700 dark:text-sky-400 text-sm">{t("views")}</p>
                      <p className="text-2xl font-bold text-sky-800 dark:text-sky-300 mt-1">{content.metrics.views || 0}</p>
            </div>
                    
                    <div className="bg-gradient-to-b from-rose-50 to-rose-100 dark:from-rose-950/40 dark:to-rose-900/20 p-4 rounded-xl text-center shadow-sm border border-rose-200 dark:border-rose-900/50">
                      <div className="flex justify-center mb-2">
                        <ThumbsUp className="h-6 w-6 text-rose-500" />
                  </div>
                      <p className="text-rose-700 dark:text-rose-400 text-sm">{t("likes")}</p>
                      <p className="text-2xl font-bold text-rose-800 dark:text-rose-300 mt-1">{content.metrics.likes || 0}</p>
            </div>
                    
                    <div className="bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 p-4 rounded-xl text-center shadow-sm border border-amber-200 dark:border-amber-900/50">
                      <div className="flex justify-center mb-2">
                        <MessageCircle className="h-6 w-6 text-amber-500" />
                  </div>
                      <p className="text-amber-700 dark:text-amber-400 text-sm">{t("comments")}</p>
                      <p className="text-2xl font-bold text-amber-800 dark:text-amber-300 mt-1">{content.metrics.comments || 0}</p>
              </div>
                    
                    <div className="bg-gradient-to-b from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/20 p-4 rounded-xl text-center shadow-sm border border-emerald-200 dark:border-emerald-900/50">
                      <div className="flex justify-center mb-2">
                        <Share2 className="h-6 w-6 text-emerald-500" />
                  </div>
                      <p className="text-emerald-700 dark:text-emerald-400 text-sm">{t("shares")}</p>
                      <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">{content.metrics.shares || 0}</p>
                  </div>
                  </div>
                </CardContent>
              </Card>
                
                {/* Rating */}
                {content.metrics.rating && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <CardTitle className="text-base">{t("rating")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-6 w-6 ${i < content.metrics.rating ? "fill-amber-500" : "text-muted"}`}
                        />
                      ))}
                      <span className="ml-2 font-medium">{content.metrics.rating}/5</span>
                  </div>
                  </CardContent>
                </Card>
                )}
                
                {/* Insights */}
                {content.metrics.insights && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <CardTitle className="text-base">{t("insights")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <div className="whitespace-pre-wrap text-base leading-relaxed">{content.metrics.insights}</div>
                  </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={() => navigate(`/content/metrics/${content.id}`)} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {t("viewDetailedMetrics")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
