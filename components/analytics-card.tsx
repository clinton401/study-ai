"use client"
import { QueryFunctionContext } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  BookOpen,
  Calendar,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import fetchData from "@/hooks/fetch-data";

interface DashboardStats {
  totalDocuments: number;
  totalSummaries: number;
  totalFlashcards: number;
  totalQuizzes: number;
  activeProjects: number;
  documentsThisMonth: number;
  changes: {
    documents: number;
    summaries: number;
    flashcards: number;
    quizzes: number;
    activeProjects: number;
  };
}

interface StatsErrorProps {
  onRetry: () => void;
  error?: Error | null;
}

type StatsQueryKey = ["stats"]
const fetchDashboardStats = async ({

  signal,
}: QueryFunctionContext<StatsQueryKey>): Promise<DashboardStats> => {
  const response = await fetch("/api/dashboard/stats", { signal });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || "Failed to fetch dashboard stats");
  }
  return response.json();
};

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatsError({ onRetry, error }: StatsErrorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="md:col-span-4">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-destructive mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            {error?.message || " Failed to load dashboard statistics"}
          </p>
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function AnalyticsCards() {


  const {
    data: stats,
    error,
    isLoading,
    refetch,
  } = fetchData<DashboardStats, StatsQueryKey>(["stats"], fetchDashboardStats, {
   
  });
  const formatChange = (change: number): string => {
    if (change > 0) return `+${change} from last month`;
    if (change < 0) return `${change} from last month`;
    return "No change from last month";
  };

  if (isLoading) {
    return <StatsSkeleton />;
  }

  if (error || !stats) {
    return <StatsError onRetry={() => refetch()} error={error } />;
  }


  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDocuments}</div>
          <p className="text-xs text-muted-foreground">
            {formatChange(stats.changes.documents)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeProjects}</div>
          <p className="text-xs text-muted-foreground">Last 30 days activity</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Summaries</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSummaries}</div>
          <p className="text-xs text-muted-foreground">
            {formatChange(stats.changes.summaries)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Flashcard Sets</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFlashcards}</div>
          <p className="text-xs text-muted-foreground">
            {formatChange(stats.changes.flashcards)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quiz Sets</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
          <p className="text-xs text-muted-foreground">
            {formatChange(stats.changes.quizzes)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.documentsThisMonth}</div>
          <p className="text-xs text-muted-foreground">Documents created</p>
        </CardContent>
      </Card>
    </div>
  );          
}            
