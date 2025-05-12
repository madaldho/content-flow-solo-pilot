import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  BarChart3, 
  Save, 
  Calendar, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Percent
} from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ContentItem } from "@/types/content";
import { getPlatformIcon, getPlatformColor, getPlatformBgColor, getPlatformTextColor } from "@/lib/platform-utils";

interface MetricsPlatform {
  name: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saved: number;
  engagement_rate: number;
}

interface MetricsHistory {
  date: string;
  platforms: MetricsPlatform[];
}

export default function ContentMetricsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getContentById, updateContentItem } = useContent();
  const { t } = useLanguage();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [metrics, setMetrics] = useState<{
    platforms: MetricsPlatform[];
    insights: string;
    history?: MetricsHistory[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch content data
  useEffect(() => {
    if (id) {
      const contentData = getContentById(id);
      if (contentData) {
        setContent(contentData);
        
        // Initialize metrics from content data
        if (contentData.metrics) {
          // Pastikan ada struktur platforms yang benar
          let platformsData: MetricsPlatform[] = [];
          
          // Gunakan platforms dari metrics jika tersedia
          if (Array.isArray(contentData.metrics.platforms) && contentData.metrics.platforms.length > 0) {
            platformsData = contentData.metrics.platforms;
          } 
          // Jika tidak ada, buat dari data platforms di contentItem
          else if (Array.isArray(contentData.platforms) && contentData.platforms.length > 0) {
            platformsData = contentData.platforms.map(platform => ({
              name: platform,
              views: 0,
              likes: 0,
              comments: 0,
              shares: 0,
              saved: 0,
              engagement_rate: 0
            }));
          }
          // Fallback ke platform tunggal jika tidak ada opsi lain
          else {
            platformsData = [{
              name: contentData.platform,
              views: contentData.metrics.views || 0,
              likes: contentData.metrics.likes || 0,
              comments: contentData.metrics.comments || 0,
              shares: contentData.metrics.shares || 0,
              saved: 0,
              engagement_rate: 0
            }];
          }
          
          const metricsData = {
            platforms: platformsData,
            insights: contentData.metrics.insights || "",
            history: Array.isArray(contentData.metrics.history) ? contentData.metrics.history : []
          };
          
          setMetrics(metricsData);
        } else {
          // Default metrics structure if none exists
          let defaultPlatforms: MetricsPlatform[] = [];
          
          // Gunakan platforms dari content jika tersedia
          if (Array.isArray(contentData.platforms) && contentData.platforms.length > 0) {
            defaultPlatforms = contentData.platforms.map(platform => ({
              name: platform,
              views: 0,
              likes: 0,
              comments: 0,
              shares: 0,
              saved: 0,
              engagement_rate: 0
            }));
          } else {
            defaultPlatforms = [{
              name: contentData.platform,
              views: 0,
              likes: 0,
              comments: 0,
              shares: 0,
              saved: 0,
              engagement_rate: 0
            }];
          }
          
          setMetrics({
            platforms: defaultPlatforms,
            insights: ""
          });
        }
      } else {
        toast.error(t("contentNotFound"));
        navigate("/content-board");
      }
    }
  }, [id, getContentById, navigate, t]);

  // Function to handle metrics update
  const handleMetricsChange = (platformIndex: number, field: keyof MetricsPlatform, value: any) => {
    if (!metrics) return;
    
    const updatedPlatforms = [...metrics.platforms];
    
    if (field === 'engagement_rate') {
      // Don't allow manual update of engagement rate
      return;
    }
    
    // Update the specified field
    updatedPlatforms[platformIndex] = {
      ...updatedPlatforms[platformIndex],
      [field]: typeof value === 'number' ? value : parseInt(value) || 0
    };
    
    // Recalculate engagement rate
    const platform = updatedPlatforms[platformIndex];
    const totalInteractions = platform.likes + platform.comments + platform.shares + platform.saved;
    const engagementRate = platform.views > 0 
      ? parseFloat(((totalInteractions / platform.views) * 100).toFixed(2))
      : 0;
    
    updatedPlatforms[platformIndex].engagement_rate = engagementRate;
    
    setMetrics({
      ...metrics,
      platforms: updatedPlatforms
    });
  };

  // Function to handle insights change
  const handleInsightsChange = (value: string) => {
    if (metrics) {
      setMetrics({
        ...metrics,
        insights: value
      });
    }
  };

  // Function to add a new platform
  const handleAddPlatform = () => {
    if (!metrics) return;
    
    setMetrics({
      ...metrics,
      platforms: [
        ...metrics.platforms,
        {
          name: "",
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          saved: 0,
          engagement_rate: 0
        }
      ]
    });
  };

  // Function to save metrics
  const handleSaveMetrics = async () => {
    if (!content || !metrics || !id) return;
    
    setIsLoading(true);
    
    try {
      // Validasi data metrics
      if (!Array.isArray(metrics.platforms) || metrics.platforms.length === 0) {
        throw new Error("Platform metrics data is invalid");
      }
      
      // Pastikan setiap platform memiliki nama
      const validatedPlatforms = metrics.platforms.map(platform => {
        return {
          ...platform,
          name: platform.name || content.platform
        };
      });
      
      // Create a history entry if it doesn't exist
      let history = Array.isArray(metrics.history) ? metrics.history : [];
      
      // Add current metrics to history
      const now = new Date();
      history = [
        {
          date: format(now, "yyyy-MM-dd"),
          platforms: validatedPlatforms
        },
        ...history
      ];
      
      // Update content with new metrics
      const updatedMetrics = {
        platforms: validatedPlatforms,
        insights: metrics.insights || "",
        history
      };
      
      await updateContentItem(id, { metrics: updatedMetrics });
      
      // Update local state
      setMetrics(updatedMetrics);
      setEditMode(false);
      
      toast.success(t("metricsUpdated"));
    } catch (error) {
      console.error("Error saving metrics:", error);
      toast.error(t("errorSavingMetrics"));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Generate chart data from metrics history
  const generateChartData = () => {
    if (!metrics?.history || !Array.isArray(metrics.history) || 
        metrics.history.length === 0 || !metrics?.platforms || 
        !Array.isArray(metrics.platforms) || metrics.platforms.length === 0) {
      return [];
    }
    
    try {
      // Sort history by date (oldest first)
      const sortedHistory = [...metrics.history].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateA.getTime() - dateB.getTime();
      });
      
      return sortedHistory.map(entry => {
        const data: any = {
          date: formatDate(entry.date)
        };
        
        // Add metrics for each platform if available
        if (entry.platforms && Array.isArray(entry.platforms)) {
          entry.platforms.forEach(platform => {
            if (platform && platform.name) {
              data[`${platform.name}_views`] = platform.views || 0;
              data[`${platform.name}_engagement`] = platform.engagement_rate || 0;
            }
          });
        }
        
        return data;
      });
    } catch (error) {
      console.error("Error generating chart data:", error);
      return [];
    }
  };

  if (!content || !metrics) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
        <Header />
        <main className="flex-1 container py-8 px-4">
          <div className="flex items-center justify-center h-full">
            <p>{t("loading")}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <main className="flex-1 container py-4 md:py-6 space-y-4 md:space-y-6 px-3 md:px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glassmorphism p-3 md:p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-medium">{content.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                {Array.isArray(content.platforms) && content.platforms.length > 0 ? (
                  content.platforms.map((platform, index) => (
                    <Badge 
                      key={index} 
                      className="flex items-center gap-1"
                      style={{
                        backgroundColor: getPlatformBgColor(platform),
                        color: getPlatformColor(platform),
                        border: `1px solid ${getPlatformColor(platform)}30`
                      }}
                    >
                      <span>{getPlatformIcon(platform)}</span>
                      {platform}
                    </Badge>
                  ))
                ) : (
                  <Badge 
                    className="flex items-center gap-1"
                    style={{
                      backgroundColor: getPlatformBgColor(content.platform),
                      color: getPlatformColor(content.platform),
                      border: `1px solid ${getPlatformColor(content.platform)}30`
                    }}
                  >
                    <span>{getPlatformIcon(content.platform)}</span>
                    {content.platform}
                  </Badge>
                )}
                <span>•</span>
                <span>{formatDate(content.publicationDate || content.updatedAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setEditMode(false)}
                >
                  {t("cancel")}
                </Button>
                <Button 
                  onClick={handleSaveMetrics} 
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t("saveMetrics")}
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setEditMode(true)}
              >
                {t("editMetrics")}
              </Button>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Column - Metrics Form */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t("contentMetrics")}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {metrics.platforms && metrics.platforms.length > 0 ? (
                  <>
                    {metrics.platforms.map((platform, index) => (
                      <div key={index} className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <h3 
                            className="text-lg font-medium flex items-center gap-2" 
                            style={{ color: getPlatformColor(platform.name) }}
                          >
                            <span 
                              className="w-8 h-8 flex items-center justify-center rounded-full" 
                              style={{ 
                                backgroundColor: getPlatformBgColor(platform.name),
                                border: `1px solid ${getPlatformColor(platform.name)}30`
                              }}
                            >
                              {getPlatformIcon(platform.name)}
                            </span>
                            {platform.name || t("platform")}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className="flex items-center gap-1"
                            style={{
                              borderColor: `${getPlatformColor(platform.name)}30`
                            }}
                          >
                            <Percent className="h-3.5 w-3.5" />
                            {platform.engagement_rate}%
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1 flex items-center">
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              {t("views")}
                            </p>
                            {editMode ? (
                              <Input 
                                type="number" 
                                value={platform.views} 
                                onChange={(e) => handleMetricsChange(index, 'views', e.target.value)}
                                className="h-8 text-sm"
                              />
                            ) : (
                              <p>{platform.views}</p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground mb-1 flex items-center">
                              <Heart className="h-3.5 w-3.5 mr-1" />
                              {t("likes")}
                            </p>
                            {editMode ? (
                              <Input 
                                type="number" 
                                value={platform.likes} 
                                onChange={(e) => handleMetricsChange(index, 'likes', e.target.value)}
                                className="h-8 text-sm"
                              />
                            ) : (
                              <p>{platform.likes}</p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground mb-1 flex items-center">
                              <MessageCircle className="h-3.5 w-3.5 mr-1" />
                              {t("comments")}
                            </p>
                            {editMode ? (
                              <Input 
                                type="number" 
                                value={platform.comments} 
                                onChange={(e) => handleMetricsChange(index, 'comments', e.target.value)}
                                className="h-8 text-sm"
                              />
                            ) : (
                              <p>{platform.comments}</p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground mb-1 flex items-center">
                              <Share2 className="h-3.5 w-3.5 mr-1" />
                              {t("shares")}
                            </p>
                            {editMode ? (
                              <Input 
                                type="number" 
                                value={platform.shares} 
                                onChange={(e) => handleMetricsChange(index, 'shares', e.target.value)}
                                className="h-8 text-sm"
                              />
                            ) : (
                              <p>{platform.shares}</p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground mb-1 flex items-center">
                              <Bookmark className="h-3.5 w-3.5 mr-1" />
                              {t("saved")}
                            </p>
                            {editMode ? (
                              <Input 
                                type="number" 
                                value={platform.saved} 
                                onChange={(e) => handleMetricsChange(index, 'saved', e.target.value)}
                                className="h-8 text-sm"
                              />
                            ) : (
                              <p>{platform.saved}</p>
                            )}
                          </div>
                        </div>
                        
                        {index < metrics.platforms.length - 1 && <Separator className="my-4" />}
                      </div>
                    ))}
                    
                    {editMode && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddPlatform}
                        className="mt-2"
                      >
                        {t("addPlatform")}
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    <p>{t("noMetricsData")}</p>
                    {editMode && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddPlatform}
                        className="mt-2"
                      >
                        {t("addPlatform")}
                      </Button>
                    )}
                  </div>
                )}
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">{t("insights")}</h3>
                  {editMode ? (
                    <Textarea 
                      value={metrics.insights || ""}
                      onChange={(e) => handleInsightsChange(e.target.value)}
                      placeholder={t("enterInsights")}
                      className="min-h-[120px]"
                    />
                  ) : (
                    <div className="p-3 border rounded-md min-h-[60px] whitespace-pre-wrap">
                      {metrics.insights || t("noInsightsYet")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Charts */}
            {metrics.history && metrics.history.length > 1 && metrics.platforms && metrics.platforms.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t("performanceOverTime")}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={generateChartData()}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {metrics.platforms.map((platform) => (
                          <Line
                            key={`${platform.name}_views`}
                            type="monotone"
                            dataKey={`${platform.name}_views`}
                            name={`${platform.name} ${t("views")}`}
                            stroke={getPlatformColor(platform.name)}
                            activeDot={{ r: 8 }}
                          />
                        ))}
                        {metrics.platforms.map((platform) => (
                          <Line
                            key={`${platform.name}_engagement`}
                            type="monotone"
                            dataKey={`${platform.name}_engagement`}
                            name={`${platform.name} ${t("engagementRate")} (%)`}
                            stroke={`${getPlatformColor(platform.name)}80`}
                            strokeDasharray="5 5"
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Right Column - History */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t("metricsHistory")}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {metrics.history && Array.isArray(metrics.history) && metrics.history.length > 0 ? (
                  <div className="space-y-4">
                    {metrics.history.map((entry, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <p className="font-medium mb-2">{formatDate(entry.date || '')}</p>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("platform")}</TableHead>
                              <TableHead>{t("views")}</TableHead>
                              <TableHead>{t("engagementRate")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {entry.platforms && Array.isArray(entry.platforms) ? (
                              entry.platforms.map((platform, platformIndex) => (
                                <TableRow key={platformIndex}>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <span 
                                        className="w-6 h-6 flex items-center justify-center rounded-full"
                                        style={{ 
                                          backgroundColor: getPlatformBgColor(platform?.name || "Other"),
                                          color: getPlatformColor(platform?.name || "Other")
                                        }}
                                      >
                                        {getPlatformIcon(platform?.name || "Other")}
                                      </span>
                                      <span>{platform?.name || t("platform")}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{platform?.views || 0}</TableCell>
                                  <TableCell>{platform?.engagement_rate || 0}%</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                  {t("noPlatformData")}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    {t("noMetricsHistory")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 