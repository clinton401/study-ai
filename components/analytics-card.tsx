"use client";

import { QueryFunctionContext } from "@tanstack/react-query";
import {
  FileText,
  BookOpen,
  Calendar,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  FileQuestion,
  LayoutDashboard,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import fetchData from "@/hooks/fetch-data";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

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

type StatsQueryKey = ["stats"];

// ─── Fetcher ──────────────────────────────────────────────────────────────────

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

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  meta,
  positive,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  meta: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
          <Icon className="h-3.5 w-3.5 text-background" />
        </div>
      </div>
      <div className="text-3xl font-bold tracking-tight tabular-nums">
        {value.toLocaleString()}
      </div>
      <p
        className={cn(
          "text-xs",
          positive === true
            ? "text-green-600 dark:text-green-400"
            : positive === false
            ? "text-destructive"
            : "text-muted-foreground"
        )}
      >
        {meta}
      </p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card shadow-sm p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────

function StatsError({
  onRetry,
  error,
}: {
  onRetry: () => void;
  error?: Error | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-8 flex flex-col items-center justify-center gap-3 text-center">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-muted-foreground">
        {error?.message || "Failed to load dashboard statistics"}
      </p>
      <Button onClick={onRetry} variant="outline" size="sm" className="rounded-xl gap-1.5">
        <RefreshCw className="h-3.5 w-3.5" />
        Try Again
      </Button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalyticsCards() {
  const { data: stats, error, isLoading, refetch } = fetchData<
    DashboardStats,
    StatsQueryKey
  >(["stats"], fetchDashboardStats);

  const formatChange = (change: number): { text: string; positive?: boolean } => {
    if (change > 0) return { text: `+${change} from last month`, positive: true };
    if (change < 0) return { text: `${change} from last month`, positive: false };
    return { text: "No change from last month" };
  };

  if (isLoading) return <StatsSkeleton />;
  if (error || !stats) return <StatsError onRetry={() => refetch()} error={error} />;

  const cards = [
    {
      icon: FileText,
      label: "Documents",
      value: stats.totalDocuments,
      ...formatChange(stats.changes.documents),
    },
    {
      icon: TrendingUp,
      label: "Active Projects",
      value: stats.activeProjects,
      text: "Last 30 days activity",
    },
    {
      icon: BookOpen,
      label: "Summaries",
      value: stats.totalSummaries,
      ...formatChange(stats.changes.summaries),
    },
    {
      icon: LayoutDashboard,
      label: "Flashcard Sets",
      value: stats.totalFlashcards,
      ...formatChange(stats.changes.flashcards),
    },
    {
      icon: FileQuestion,
      label: "Quiz Sets",
      value: stats.totalQuizzes,
      ...formatChange(stats.changes.quizzes),
    },
    {
      icon: Calendar,
      label: "This Month",
      value: stats.documentsThisMonth,
      text: "Documents created",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} meta={ card.text} />
      ))}
    </div>
  );
}