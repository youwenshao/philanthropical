"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface FraudReport {
  id: string;
  alertType: string;
  charityAddress: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  resolved: boolean;
  createdAt: string;
}

interface FraudReportsProps {
  reports: FraudReport[];
}

export function FraudReports({ reports }: FraudReportsProps) {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return <Badge variant="destructive" className="bg-orange-500">High</Badge>;
      case "medium":
        return <Badge variant="default" className="bg-yellow-500">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Fraud Reports
        </CardTitle>
        <CardDescription>Recent fraud alerts and reports</CardDescription>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="text-muted-foreground">No fraud reports</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(report.severity)}
                    <span className="font-medium">{report.alertType}</span>
                  </div>
                  {report.resolved && (
                    <Badge variant="outline" className="bg-green-50">
                      Resolved
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{report.description}</p>
                <p className="text-xs text-muted-foreground">
                  Charity: {report.charityAddress.slice(0, 10)}...
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}



