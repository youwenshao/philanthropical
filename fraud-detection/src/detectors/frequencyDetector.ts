/**
 * Frequency Detector
 * Detects anomalies in donation frequency
 */

export interface FrequencyAnalysis {
  suspicious: boolean;
  riskScore: number; // 0-100
  anomaly: string;
  normalFrequency: number;
  actualFrequency: number;
}

export class FrequencyDetector {
  /**
   * Analyze donation frequency
   */
  static analyze(
    transactions: Array<{ timestamp: number; donorAddress: string }>,
    timeWindow: number = 3600 // 1 hour in seconds
  ): FrequencyAnalysis {
    if (transactions.length === 0) {
      return {
        suspicious: false,
        riskScore: 0,
        anomaly: "No transactions to analyze",
        normalFrequency: 0,
        actualFrequency: 0,
      };
    }

    // Group transactions by donor
    const donorFrequencies = new Map<string, number[]>();

    for (const tx of transactions) {
      const donor = tx.donorAddress.toLowerCase();
      if (!donorFrequencies.has(donor)) {
        donorFrequencies.set(donor, []);
      }
      donorFrequencies.get(donor)!.push(tx.timestamp);
    }

    // Calculate average frequency per donor
    let totalFrequency = 0;
    let donorCount = 0;

    for (const [donor, timestamps] of donorFrequencies) {
      if (timestamps.length < 2) continue;

      // Sort timestamps
      const sorted = timestamps.sort((a, b) => a - b);

      // Calculate intervals
      const intervals: number[] = [];
      for (let i = 1; i < sorted.length; i++) {
        intervals.push(sorted[i] - sorted[i - 1]);
      }

      // Average interval
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const frequency = timeWindow / avgInterval; // Transactions per time window

      totalFrequency += frequency;
      donorCount++;
    }

    const normalFrequency = donorCount > 0 ? totalFrequency / donorCount : 0;

    // Check for anomalies
    let maxFrequency = 0;
    let anomalousDonor = "";

    for (const [donor, timestamps] of donorFrequencies) {
      if (timestamps.length < 2) continue;

      const sorted = timestamps.sort((a, b) => a - b);
      const intervals: number[] = [];
      for (let i = 1; i < sorted.length; i++) {
        intervals.push(sorted[i] - sorted[i - 1]);
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const frequency = timeWindow / avgInterval;

      if (frequency > maxFrequency) {
        maxFrequency = frequency;
        anomalousDonor = donor;
      }
    }

    // Calculate risk score
    let riskScore = 0;
    let anomaly = "";

    if (normalFrequency > 0 && maxFrequency > normalFrequency * 5) {
      riskScore = Math.min(100, (maxFrequency / normalFrequency) * 10);
      anomaly = `Unusually high frequency: ${maxFrequency.toFixed(2)} transactions/hour (normal: ${normalFrequency.toFixed(2)})`;
    } else if (maxFrequency > 100) {
      riskScore = 70;
      anomaly = `Extremely high frequency: ${maxFrequency.toFixed(2)} transactions/hour`;
    }

    return {
      suspicious: riskScore >= 50,
      riskScore,
      anomaly: anomaly || "No frequency anomalies detected",
      normalFrequency,
      actualFrequency: maxFrequency,
    };
  }

  /**
   * Detect burst patterns (many transactions in short time)
   */
  static detectBurst(
    transactions: Array<{ timestamp: number }>,
    windowSeconds: number = 60,
    threshold: number = 10
  ): FrequencyAnalysis {
    if (transactions.length < threshold) {
      return {
        suspicious: false,
        riskScore: 0,
        anomaly: "Insufficient transactions for burst detection",
        normalFrequency: 0,
        actualFrequency: transactions.length,
      };
    }

    // Sort by timestamp
    const sorted = transactions.sort((a, b) => a.timestamp - b.timestamp);

    // Check for bursts
    for (let i = 0; i < sorted.length - threshold; i++) {
      const windowStart = sorted[i].timestamp;
      const windowEnd = windowStart + windowSeconds;

      const transactionsInWindow = sorted.filter(
        (tx) => tx.timestamp >= windowStart && tx.timestamp <= windowEnd
      ).length;

      if (transactionsInWindow >= threshold) {
        return {
          suspicious: true,
          riskScore: Math.min(100, transactionsInWindow * 10),
          anomaly: `Burst detected: ${transactionsInWindow} transactions in ${windowSeconds} seconds`,
          normalFrequency: threshold,
          actualFrequency: transactionsInWindow,
        };
      }
    }

    return {
      suspicious: false,
      riskScore: 0,
      anomaly: "No burst patterns detected",
      normalFrequency: threshold,
      actualFrequency: 0,
    };
  }
}


