"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/analytics/ExportButton";
import { MetricsCard } from "@/components/analytics/MetricsCard";
import { Chart } from "@/components/analytics/Chart";
import { Download } from "lucide-react";

async function fetchAnalytics(dateRange?: { start: string; end: string }) {
  const params = new URLSearchParams();
  if (dateRange) {
    params.append("start", dateRange.start);
    params.append("end", dateRange.end);
  }

  const response = await fetch(`/api/analytics?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }
  return response.json();
}

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetchAnalytics(),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Analytics</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time metrics and insights</p>
        </div>
        <div className="flex gap-2">
          <ExportButton />
          <Button variant="outline" size="icon" aria-label="Refresh">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Donations"
          value={data?.totalDonations || 0}
          change={data?.donationsChange || 0}
          description="All time"
        />
        <MetricsCard
          title="Total Amount"
          value={`$${data?.totalAmount?.toLocaleString() || "0"}`}
          change={data?.amountChange || 0}
          description="USD equivalent"
        />
        <MetricsCard
          title="Active Charities"
          value={data?.activeCharities || 0}
          change={data?.charitiesChange || 0}
          description="Verified charities"
        />
        <MetricsCard
          title="Verification Rate"
          value={`${data?.verificationRate || 0}%`}
          change={data?.verificationRateChange || 0}
          description="Success rate"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Donations Over Time</CardTitle>
            <CardDescription>Daily donation volume</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              type="line"
              data={data?.donationsOverTime || []}
              xKey="date"
              yKey="amount"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Charity Performance</CardTitle>
            <CardDescription>Top charities by donations</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              type="bar"
              data={data?.charityPerformance || []}
              xKey="name"
              yKey="amount"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>Distribution of verification results</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              type="pie"
              data={data?.verificationStatus || []}
              xKey="status"
              yKey="count"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fraud Detection</CardTitle>
            <CardDescription>Alerts by severity</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              type="bar"
              data={data?.fraudAlerts || []}
              xKey="severity"
              yKey="count"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

