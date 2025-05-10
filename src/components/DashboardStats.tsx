
import { useContent } from "@/context/ContentContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, AlertCircle, BarChart } from "lucide-react";
import { ContentStatus } from "@/types/content";
import { useLanguage } from "@/context/LanguageContext";

export function DashboardStats() {
  const { getContentStats } = useContent();
  const { t } = useLanguage();
  const stats = getContentStats();
  
  // Calculate total content count from status breakdown
  const totalContent = Object.values(stats.statusBreakdown || {}).reduce((sum, count) => sum + count, 0);
  
  // Default statuses if some are missing from the breakdown
  const defaultStatuses: ContentStatus[] = ["Idea", "Script", "Recorded", "Edited", "Ready to Publish", "Published"];

  // Display progress of content in each status
  const getProgressPercentage = (status: ContentStatus) => {
    const count = stats.statusBreakdown[status] || 0;
    return totalContent > 0 ? Math.round((count / totalContent) * 100) : 0;
  };
  
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {/* Active Content */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t("activeContent")}</CardTitle>
          <CardDescription>{t("itemsInProgress")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalActive}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {stats.totalActive > 0 
              ? t("contentItemsBeingWorkedOn")
              : t("noActiveContentItems")
            }
          </div>
        </CardContent>
      </Card>
      
      {/* Published This Week */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t("publishedThisWeek")}</CardTitle>
          <CardDescription>{t("last7Days")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.publishedThisWeek}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {stats.publishedThisWeek > 0 
              ? t("itemsPublishedCount", { count: stats.publishedThisWeek })
              : t("noContentPublishedThisWeek")
            }
          </div>
        </CardContent>
      </Card>
      
      {/* Best Performing Content */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t("bestPerformer")}</CardTitle>
          <CardDescription>{t("mostViewedContent")}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.bestPerforming ? (
            <>
              <div className="font-medium line-clamp-1">{stats.bestPerforming.title}</div>
              <div className="mt-1 flex items-center gap-2">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {stats.bestPerforming.metrics.views || 0} {t("views")}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t("platform")}: {stats.bestPerforming.platform}
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              {t("noPublishedContentYet")}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Unfinished Content */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t("unfinished")}</CardTitle>
          <CardDescription>{t("contentToComplete")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.unfinishedCount}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {stats.unfinishedCount > 0 
              ? t("itemsAwaitingCompletion", { count: stats.unfinishedCount })
              : t("allContentComplete")
            }
          </div>
        </CardContent>
      </Card>
      
      {/* Content Status Breakdown */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>{t("contentStatusBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {totalContent === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {t("noContentCreatedYet")}
            </div>
          ) : (
            defaultStatuses.map((status) => (
              <div key={status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{t(status.toLowerCase().replace(/ /g, ""))}</span>
                  <span>
                    {stats.statusBreakdown[status] || 0} ({getProgressPercentage(status)}%)
                  </span>
                </div>
                <Progress value={getProgressPercentage(status)} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
      
      {/* Reminders for unfinished content */}
      {stats.unfinishedCount > 0 && (
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{t("reminders")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.unfinishedCount > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("unfinishedContent")}</AlertTitle>
                <AlertDescription>
                  {t("unfinishedContentMessage")}
                </AlertDescription>
              </Alert>
            )}
            
            {(stats.statusBreakdown["Ready to Publish"] || 0) > 0 && (
              <Alert>
                <CalendarIcon className="h-4 w-4" />
                <AlertTitle>{t("readyToPublish")}</AlertTitle>
                <AlertDescription>
                  {t("readyToPublishMessage")}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
