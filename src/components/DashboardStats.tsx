
import { useContent } from "@/context/ContentContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, AlertCircle, BarChart } from "lucide-react";
import { ContentStatus } from "@/types/content";

export function DashboardStats() {
  const { getContentStats } = useContent();
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
          <CardTitle className="text-lg">Active Content</CardTitle>
          <CardDescription>Items in progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalActive}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {stats.totalActive > 0 
              ? "Content items being worked on" 
              : "No active content items"
            }
          </div>
        </CardContent>
      </Card>
      
      {/* Published This Week */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Published This Week</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.publishedThisWeek}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {stats.publishedThisWeek > 0 
              ? `${stats.publishedThisWeek} item${stats.publishedThisWeek > 1 ? 's' : ''} published` 
              : "No content published this week"
            }
          </div>
        </CardContent>
      </Card>
      
      {/* Best Performing Content */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Best Performer</CardTitle>
          <CardDescription>Most viewed content</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.bestPerforming ? (
            <>
              <div className="font-medium line-clamp-1">{stats.bestPerforming.title}</div>
              <div className="mt-1 flex items-center gap-2">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {stats.bestPerforming.metrics.views || 0} views
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Platform: {stats.bestPerforming.platform}
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              No published content yet
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Unfinished Content */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Unfinished</CardTitle>
          <CardDescription>Content to complete</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.unfinishedCount}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {stats.unfinishedCount > 0 
              ? `${stats.unfinishedCount} item${stats.unfinishedCount > 1 ? 's' : ''} awaiting completion` 
              : "All content is complete"
            }
          </div>
        </CardContent>
      </Card>
      
      {/* Content Status Breakdown */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Content Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {totalContent === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No content created yet. Start by adding your first content idea!
            </div>
          ) : (
            defaultStatuses.map((status) => (
              <div key={status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{status}</span>
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
              <span>Reminders</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.unfinishedCount > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Unfinished Content</AlertTitle>
                <AlertDescription>
                  You have {stats.unfinishedCount} unfinished content item{stats.unfinishedCount > 1 ? 's' : ''}.
                  Check your content board to continue working on them.
                </AlertDescription>
              </Alert>
            )}
            
            {(stats.statusBreakdown["Ready to Publish"] || 0) > 0 && (
              <Alert>
                <CalendarIcon className="h-4 w-4" />
                <AlertTitle>Ready to Publish</AlertTitle>
                <AlertDescription>
                  You have {stats.statusBreakdown["Ready to Publish"]} item{(stats.statusBreakdown["Ready to Publish"] || 0) > 1 ? 's' : ''} ready to publish.
                  Check your calendar to schedule them.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
