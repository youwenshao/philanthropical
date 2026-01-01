/**
 * Alert Generator
 * Generates fraud alerts based on detection results
 */

import { createClient } from "@supabase/supabase-js";

export interface Alert {
  alertType: string;
  entityType: "transaction" | "verification" | "charity" | "donor";
  entityId: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  riskScore: number;
  metadata: Record<string, any>;
}

export class AlertGenerator {
  private supabase: ReturnType<typeof createClient>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Generate alert from risk score
   */
  static generateAlert(
    alertType: string,
    entityType: Alert["entityType"],
    entityId: string,
    riskScore: number,
    description: string,
    metadata: Record<string, any> = {}
  ): Alert {
    let severity: Alert["severity"];

    if (riskScore >= 80) {
      severity = "critical";
    } else if (riskScore >= 60) {
      severity = "high";
    } else if (riskScore >= 40) {
      severity = "medium";
    } else {
      severity = "low";
    }

    return {
      alertType,
      entityType,
      entityId,
      severity,
      description,
      riskScore,
      metadata,
    };
  }

  /**
   * Save alert to database
   */
  async saveAlert(alert: Alert): Promise<void> {
    try {
      const { error } = await this.supabase.from("fraud_alerts").insert({
        alert_type: alert.alertType,
        charity_address:
          alert.entityType === "charity" ? alert.entityId : null,
        donation_id:
          alert.entityType === "transaction" ? parseInt(alert.entityId) : null,
        severity: alert.severity,
        description: alert.description,
        resolved: false,
      });

      if (error) {
        console.error("Error saving alert:", error);
        throw error;
      }
    } catch (error) {
      console.error("Failed to save alert:", error);
      throw error;
    }
  }

  /**
   * Generate and save alert
   */
  async generateAndSave(
    alertType: string,
    entityType: Alert["entityType"],
    entityId: string,
    riskScore: number,
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<Alert> {
    const alert = AlertGenerator.generateAlert(
      alertType,
      entityType,
      entityId,
      riskScore,
      description,
      metadata
    );

    await this.saveAlert(alert);

    return alert;
  }

  /**
   * Aggregate multiple alerts into a single alert
   */
  static aggregateAlerts(alerts: Alert[]): Alert | null {
    if (alerts.length === 0) return null;

    // Find highest severity
    const severities = ["low", "medium", "high", "critical"] as const;
    const maxSeverity = alerts.reduce((max, alert) => {
      const maxIdx = severities.indexOf(max);
      const alertIdx = severities.indexOf(alert.severity);
      return alertIdx > maxIdx ? alert.severity : max;
    }, alerts[0].severity);

    // Calculate average risk score
    const avgRiskScore =
      alerts.reduce((sum, alert) => sum + alert.riskScore, 0) / alerts.length;

    // Combine descriptions
    const descriptions = alerts.map((a) => a.description).join("; ");

    return {
      alertType: "aggregated",
      entityType: alerts[0].entityType,
      entityId: alerts[0].entityId,
      severity: maxSeverity,
      description: `Multiple alerts: ${descriptions}`,
      riskScore: avgRiskScore,
      metadata: {
        alertCount: alerts.length,
        alerts: alerts.map((a) => ({
          type: a.alertType,
          severity: a.severity,
          riskScore: a.riskScore,
        })),
      },
    };
  }
}


