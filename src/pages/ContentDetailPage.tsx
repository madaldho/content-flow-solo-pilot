import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContent } from "@/context/ContentContext";
import { ContentItem, ContentStatus } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
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
  Star,
  ArrowLeft,
  Edit,
  ScrollText
} from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { Layout } from "@/components/Layout";
import { getPlatformIcon, getPlatformColor, getPlatformBgColor } from "@/lib/platform-utils";
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
import { toast } from "sonner";

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

export default function ContentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getContentById, deleteContentItem, updateContentItem } = useContent();
  const { t } = useLanguage();
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'script' | 'checklist' | 'metrics'>('details');
  const navigate = useNavigate();
  
  // Get content item
  const content = id ? getContentById(id) : null;
  
  // If content not found, show error
  if (!content) {
    return (
      <Layout>
        <div className="container max-w-6xl py-6">
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </Button>
          </div>
          
          <div className="p-12 text-center">
            <h1 className="text-2xl font-bold mb-4">{t("contentNotFound")}</h1>
            <p className="text-muted-foreground mb-6">{t("contentNotFoundDescription")}</p>
            <Button onClick={() => navigate('/content-board')}>
              {t("backToContentBoard")}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const statusColors = {
    "Idea": "bg-status-idea text-white",
    "Script": "bg-status-script text-white",
    "Recorded": "bg-status-recorded text-white",
    "Edited": "bg-status-edited text-white",
    "Ready to Publish": "bg-status-ready text-white",
    "Published": "bg-status-published text-white"
  };
  
  const handleDeleteContent = async () => {
    try {
      await deleteContentItem(content.id);
      toast.success(t("contentDeleted"));
      navigate('/content-board');
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error(t("errorDeletingContent"));
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-6xl py-4 md:py-6 px-4">
        {/* Back button and action buttons - dibuat lebih responsif */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-start"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Button>
          
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-xs sm:text-sm"
              size="sm"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">{t("statusHistory")}</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate(`/content/edit/${content.id}`)}
              className="flex items-center gap-1 text-xs sm:text-sm"
              size="sm"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">{t("edit")}</span>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="flex items-center gap-1 text-xs sm:text-sm"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("delete")}</span>
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
        
        {/* Content Header with gradient background - responsif */}
        <div className={`bg-gradient-to-r ${getStatusGradient(content.status)} px-4 sm:px-8 py-4 sm:py-6 rounded-lg shadow-md mb-6`}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <Badge className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1" variant="outline">
                {getPlatformLucideIcon(content.platform)}
                <span className="ml-1">{content.platform}</span>
              </Badge>
              <Badge className="bg-white/20 hover:bg-white/20 text-white text-xs px-3 py-1">
                {t(content.status.toLowerCase().replace(/\s+/g, ""))}
              </Badge>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white break-words">{content.title}</h1>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-white/90 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {t("created")}: {format(content.createdAt, "dd MMM yyyy")}
              </div>
              
              {content.publicationDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t("publication")}: {format(content.publicationDate, "dd MMM yyyy")}
                </div>
              )}
            </div>
            
            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {content.tags.map((tag) => (
                  <Badge key={tag} className="bg-white/10 hover:bg-white/20 text-white border-none text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* History Timeline if shown */}
        {showHistory && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">{t("statusHistory")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <HistoryTimeline history={content.history} />
            </CardContent>
          </Card>
        )}
        
        {/* Navigation Tabs - Scroll horizontally on mobile */}
        <div className="border-b mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 sm:space-x-4 -mb-px min-w-max">
            <button
              onClick={() => setActiveTab('details')}
              className={cn(
                "py-2 sm:py-3 px-3 sm:px-4 border-b-2 font-medium whitespace-nowrap text-sm",
                activeTab === 'details'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4" />
                {t("details")}
              </div>
            </button>
            
            {content.script && (
              <button
                onClick={() => setActiveTab('script')}
                className={cn(
                  "py-2 sm:py-3 px-3 sm:px-4 border-b-2 font-medium whitespace-nowrap text-sm",
                  activeTab === 'script'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  {t("script")}
                </div>
              </button>
            )}
            
            {content.status !== "Idea" && (
              <button
                onClick={() => setActiveTab('checklist')}
                className={cn(
                  "py-2 sm:py-3 px-3 sm:px-4 border-b-2 font-medium whitespace-nowrap text-sm",
                  activeTab === 'checklist'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("checklist")}
                </div>
              </button>
            )}
            
            {content.status === "Published" && content.metrics && (
              <button
                onClick={() => setActiveTab('metrics')}
                className={cn(
                  "py-2 sm:py-3 px-3 sm:px-4 border-b-2 font-medium whitespace-nowrap text-sm",
                  activeTab === 'metrics'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {t("metrics")}
                </div>
              </button>
            )}
          </div>
        </div>
        
        {/* Content Tabs */}
        <div className="pb-12">
          {/* Tab: Details */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Notes Section */}
                {content.notes && (
                  <Card>
                    <CardHeader className="pb-2 p-4">
                      <div className="flex items-center gap-2">
                        <StickyNote className="h-4 w-4 text-amber-500" />
                        <CardTitle className="text-sm sm:text-base font-medium">{t("notes")}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed font-normal">{content.notes}</div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Reference Link */}
                {content.referenceLink && (
                  <Card>
                    <CardHeader className="pb-2 p-4">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                        <CardTitle className="text-sm sm:text-base font-medium">{t("referenceLink")}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <a 
                        href={content.referenceLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors w-fit text-sm sm:text-base break-all"
                      >
                        <ExternalLink className="h-4 w-4 flex-shrink-0" />
                        <span className="underline overflow-hidden text-ellipsis">
                          {content.referenceLink.length > 30 
                            ? content.referenceLink.substring(0, 30) + '...' 
                            : content.referenceLink}
                        </span>
                      </a>
                    </CardContent>
                  </Card>
                )}
                
                {/* Content Link */}
                {content.status === "Published" && (
                  <Card>
                    <CardHeader className="pb-2 p-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-indigo-500" />
                        <CardTitle className="text-sm sm:text-base font-medium">{t("contentLink") || "Link Konten"}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {/* Tampilkan platform links jika ada */}
                      {content.platformLinks && Object.keys(content.platformLinks).length > 0 ? (
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {Object.entries(content.platformLinks)
                            .filter(([platform, link]) => link) // Hanya tampilkan yang memiliki link
                            .map(([platform, link]) => (
                              <a 
                                key={platform}
                                href={link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-md hover:opacity-90 transition-opacity text-xs sm:text-sm"
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
                          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-md hover:opacity-90 transition-opacity text-xs sm:text-sm"
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
                        <div className="text-xs sm:text-sm text-muted-foreground">Tidak ada link konten</div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Equipment Used */}
                {content.equipmentUsed && content.equipmentUsed.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2 p-4">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-orange-500" />
                        <CardTitle className="text-sm sm:text-base font-medium">{t("equipmentUsed")}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex flex-wrap gap-2">
                        {content.equipmentUsed.map((equipment, index) => (
                          <Badge key={index} variant="outline" className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs">{equipment}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Right Column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Endorsement & Collaboration */}
                {(content.isEndorsement || content.isCollaboration) && (
                  <Card>
                    <CardHeader className="pb-2 p-4">
                      <div className="flex items-center gap-2">
                        <HandshakeIcon className="h-4 w-4 text-emerald-500" />
                        <CardTitle className="text-sm sm:text-base font-medium">{t("partnerDetails")}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {content.isEndorsement && (
                          <div className="bg-green-50 dark:bg-green-950/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-900">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                              <h4 className="font-medium text-sm sm:text-base text-green-700 dark:text-green-400">{t("endorsement")}</h4>
                            </div>
                            {content.endorsementName && (
                              <div className="mb-1 sm:mb-2 text-xs sm:text-sm">
                                <span className="font-medium text-green-600 dark:text-green-400">{t("endorsementName")}:</span>
                                <span className="ml-1 sm:ml-2">{content.endorsementName}</span>
                              </div>
                            )}
                            {content.endorsementPrice && (
                              <div className="text-xs sm:text-sm">
                                <span className="font-medium text-green-600 dark:text-green-400">{t("endorsementPrice")}:</span>
                                <span className="ml-1 sm:ml-2">{content.endorsementPrice}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {content.isCollaboration && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                              <h4 className="font-medium text-sm sm:text-base text-blue-700 dark:text-blue-400">{t("collaboration")}</h4>
                            </div>
                            {content.collaborationName && (
                              <div className="text-xs sm:text-sm">
                                <span className="font-medium text-blue-600 dark:text-blue-400">{t("collaborationName")}:</span>
                                <span className="ml-1 sm:ml-2">{content.collaborationName}</span>
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
                    <CardHeader className="pb-2 p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-violet-500" />
                        <CardTitle className="text-sm sm:text-base font-medium">{t("productionNotes")}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed font-normal">{content.productionNotes}</div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Content Files */}
                {content.contentFiles && content.contentFiles.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2 p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-cyan-500" />
                        <CardTitle className="text-sm sm:text-base font-medium">{t("contentFiles")}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {content.contentFiles.map((file, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-2 p-2 sm:p-3 bg-muted/50 rounded-lg border hover:bg-muted transition-colors"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs sm:text-sm truncate">{file}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          {/* Tab: Script */}
          {activeTab === 'script' && content.script && (
            <Card className="bg-gradient-to-b from-transparent to-muted/10">
              <CardHeader className="p-4">
                <div className="flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm sm:text-base font-medium">{t("scriptContent")}</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  {t("scriptDescription") || "Naskah konten lengkap"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="bg-muted/30 p-3 sm:p-6 rounded-lg border">
                  <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed font-normal">
                    {content.script}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Tab: Checklist */}
          {activeTab === 'checklist' && content.status !== "Idea" && (
            <Card>
              <CardHeader className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <CardTitle className="text-sm sm:text-base font-medium">{t("contentChecklist")}</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  {t("checklistDescription") || "Pantau kemajuan dan kelengkapan konten Anda"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                  <div className={`flex items-start p-3 sm:p-5 rounded-lg border transition-colors ${content.contentChecklist.intro ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-muted/30 border-muted'}`}>
                    <div className="mr-3 sm:mr-4 pt-0.5">
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
                        className={`text-sm sm:text-base font-medium ${content.contentChecklist.intro ? 'text-green-700 dark:text-green-400' : ''}`}
                      >
                        {t("intro")}
                      </label>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {t("introDescription") || "Pembukaan yang menarik perhatian audiens dan memperkenalkan topik"}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`flex items-start p-3 sm:p-5 rounded-lg border transition-colors ${content.contentChecklist.mainPoints ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-muted/30 border-muted'}`}>
                    <div className="mr-3 sm:mr-4 pt-0.5">
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
                        className={`text-sm sm:text-base font-medium ${content.contentChecklist.mainPoints ? 'text-green-700 dark:text-green-400' : ''}`}
                      >
                        {t("mainPoints")}
                      </label>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {t("mainPointsDescription") || "Poin-poin utama dan pembahasan konten"}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`flex items-start p-3 sm:p-5 rounded-lg border transition-colors ${content.contentChecklist.callToAction ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-muted/30 border-muted'}`}>
                    <div className="mr-3 sm:mr-4 pt-0.5">
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
                        className={`text-sm sm:text-base font-medium ${content.contentChecklist.callToAction ? 'text-green-700 dark:text-green-400' : ''}`}
                      >
                        {t("callToAction")}
                      </label>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {t("callToActionDescription") || "Ajakan untuk audiens melakukan tindakan tertentu"}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`flex items-start p-3 sm:p-5 rounded-lg border transition-colors ${content.contentChecklist.outro ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-muted/30 border-muted'}`}>
                    <div className="mr-3 sm:mr-4 pt-0.5">
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
                        className={`text-sm sm:text-base font-medium ${content.contentChecklist.outro ? 'text-green-700 dark:text-green-400' : ''}`}
                      >
                        {t("outro")}
                      </label>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {t("outroDescription") || "Penutup konten yang berkesan"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10">
                  <div className="text-xs sm:text-sm font-medium text-center">
                    {t("checklistCompletionStatus")}
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 sm:h-2.5 mt-2 sm:mt-3">
                    <div 
                      className="bg-primary h-1.5 sm:h-2.5 rounded-full" 
                      style={{ 
                        width: `${
                          ((content.contentChecklist.intro ? 1 : 0) +
                          (content.contentChecklist.mainPoints ? 1 : 0) +
                          (content.contentChecklist.callToAction ? 1 : 0) +
                          (content.contentChecklist.outro ? 1 : 0)) * 25
                        }%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Tab: Metrics */}
          {activeTab === 'metrics' && content.status === "Published" && content.metrics && (
            <div className="space-y-4 sm:space-y-6">
              <Card className="overflow-hidden border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 py-3 sm:py-5">
                  <CardTitle className="text-white text-center text-sm sm:text-lg">{t("performanceMetrics")}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
                    <div className="bg-gradient-to-b from-sky-50 to-sky-100 dark:from-sky-950/40 dark:to-sky-900/20 p-2 sm:p-5 rounded-xl text-center shadow-sm border border-sky-200 dark:border-sky-900/50">
                      <div className="flex justify-center mb-1 sm:mb-3">
                        <Eye className="h-5 w-5 sm:h-7 sm:w-7 text-sky-500" />
                      </div>
                      <p className="text-sky-700 dark:text-sky-400 text-xs sm:text-sm">{t("views")}</p>
                      <p className="text-xl sm:text-3xl font-bold text-sky-800 dark:text-sky-300 mt-1">{content.metrics.views || 0}</p>
                    </div>
                    
                    <div className="bg-gradient-to-b from-rose-50 to-rose-100 dark:from-rose-950/40 dark:to-rose-900/20 p-2 sm:p-5 rounded-xl text-center shadow-sm border border-rose-200 dark:border-rose-900/50">
                      <div className="flex justify-center mb-1 sm:mb-3">
                        <ThumbsUp className="h-5 w-5 sm:h-7 sm:w-7 text-rose-500" />
                      </div>
                      <p className="text-rose-700 dark:text-rose-400 text-xs sm:text-sm">{t("likes")}</p>
                      <p className="text-xl sm:text-3xl font-bold text-rose-800 dark:text-rose-300 mt-1">{content.metrics.likes || 0}</p>
                    </div>
                    
                    <div className="bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 p-2 sm:p-5 rounded-xl text-center shadow-sm border border-amber-200 dark:border-amber-900/50">
                      <div className="flex justify-center mb-1 sm:mb-3">
                        <MessageCircle className="h-5 w-5 sm:h-7 sm:w-7 text-amber-500" />
                      </div>
                      <p className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm">{t("comments")}</p>
                      <p className="text-xl sm:text-3xl font-bold text-amber-800 dark:text-amber-300 mt-1">{content.metrics.comments || 0}</p>
                    </div>
                    
                    <div className="bg-gradient-to-b from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/20 p-2 sm:p-5 rounded-xl text-center shadow-sm border border-emerald-200 dark:border-emerald-900/50">
                      <div className="flex justify-center mb-1 sm:mb-3">
                        <Share2 className="h-5 w-5 sm:h-7 sm:w-7 text-emerald-500" />
                      </div>
                      <p className="text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">{t("shares")}</p>
                      <p className="text-xl sm:text-3xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">{content.metrics.shares || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
                
              {/* Rating */}
              {content.metrics.rating && (
                <Card>
                  <CardHeader className="pb-2 p-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <CardTitle className="text-sm sm:text-base">{t("rating")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 sm:py-4 p-4">
                    <div className="flex items-center space-x-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 sm:h-8 sm:w-8 ${i < content.metrics.rating ? "fill-amber-500" : "text-muted"}`}
                        />
                      ))}
                      <span className="ml-2 sm:ml-3 text-base sm:text-xl font-medium">{content.metrics.rating}/5</span>
                    </div>
                  </CardContent>
                </Card>
              )}
                
              {/* Insights */}
              {content.metrics.insights && (
                <Card>
                  <CardHeader className="pb-2 p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <CardTitle className="text-sm sm:text-base">{t("insights")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="bg-muted/30 p-3 sm:p-5 rounded-lg border">
                      <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{content.metrics.insights}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex justify-end mt-4 sm:mt-8">
                <Button 
                  onClick={() => navigate(`/content/metrics/${content.id}`)} 
                  variant="outline"
                  className="flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center"
                  size="sm"
                >
                  <FileText className="h-4 w-4" />
                  {t("viewDetailedMetrics")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 