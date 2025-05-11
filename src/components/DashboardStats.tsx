import { FC, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useContent } from '@/context/ContentContext';
import { ContentItem, ContentStatus } from '@/types/content';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const DashboardStats: FC = () => {
  const { contentItems, getContentStats } = useContent();
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (contentItems && contentItems.length > 0) {
      const calculatedStats = getContentStats();
      setStats(calculatedStats);
    }
  }, [contentItems, getContentStats]);

  // Helper function to get status color
  const getStatusColor = (status: ContentStatus) => {
    const statusColors: Record<ContentStatus, string> = {
      'Idea': '#6366f1',
      'Script': '#8b5cf6',
      'Recorded': '#ec4899',
      'Edited': '#f59e0b',
      'Ready to Publish': '#10b981',
      'Published': '#6b7280'
    };
    return statusColors[status] || '#6b7280';
  };

  // Data for the chart
  const chartData = stats ? Object.keys(stats.statusBreakdown).map(status => ({
    name: t(status.toLowerCase().replace(/ /g, "")),
    count: stats.statusBreakdown[status]
  })) : [];

  if (!contentItems || contentItems.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalActiveContent")}
            </CardTitle>
            <CardDescription>
              {t("trackedItems")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Find upcoming content
  const upcomingContent = contentItems
    .filter(item => item.publicationDate && new Date(item.publicationDate) > new Date())
    .sort((a, b) => {
      const dateA = a.publicationDate ? new Date(a.publicationDate) : new Date();
      const dateB = b.publicationDate ? new Date(b.publicationDate) : new Date();
      return dateA.getTime() - dateB.getTime();
    });

  // Get recently updated content
  const recentlyUpdated = [...contentItems]
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalActiveContent")}
            </CardTitle>
            <CardDescription>
              {t("trackedItems")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("publishedThisWeek")}
            </CardTitle>
            <CardDescription>
              {t("recentlyPublished")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedThisWeek}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("unfinishedContent")}
            </CardTitle>
            <CardDescription>
              {t("needsAttention")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unfinishedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("bestPerforming")}
            </CardTitle>
            <CardDescription>
              {t("byViews")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-md font-medium line-clamp-1">
              {stats.bestPerforming ? stats.bestPerforming.title : t("noData")}
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.bestPerforming ? 
                `${stats.bestPerforming.metrics.views || 0} ${t("views")}` : 
                t("noMetricsYet")}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("contentBreakdown")}</CardTitle>
            <CardDescription>
              {t("byStatus")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  horizontal={true}
                  vertical={false}
                />
                <Tooltip
                  formatter={(value) => [`${value} ${t("items")}`, ""]}
                  labelFormatter={(label) => t(label.toLowerCase())}
                />
                <Bar 
                  dataKey="count" 
                  fill="var(--primary)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("upcomingContent")}</CardTitle>
              <CardDescription>
                {t("scheduledForPublication")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingContent.length > 0 ? (
                <div className="space-y-4">
                  {upcomingContent.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center border-b pb-2">
                      <div className="mr-2">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.publicationDate && 
                            format(new Date(item.publicationDate), 'PPP')}
                        </div>
                      </div>
                      <div className="ml-2">
                        <div className={`rounded-full w-2 h-2 bg-[${getStatusColor(item.status)}]`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  {t("noUpcomingContent")}
                </div>
              )}
            </CardContent>
            <CardFooter>
              {t("totalUpcoming")}: {upcomingContent.length}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("recentlyUpdated")}</CardTitle>
              <CardDescription>
                {t("latestChanges")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentlyUpdated.length > 0 ? (
                <div className="space-y-4">
                  {recentlyUpdated.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center border-b pb-2">
                      <div className="mr-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getStatusColor(item.status) }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {t("lastUpdated")}: {format(new Date(item.updatedAt), 'PPP')}
                        </div>
                      </div>
                      <div className="ml-2 text-xs font-medium">
                        {t(item.status.toLowerCase().replace(/ /g, ""))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  {t("noContentYet")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
