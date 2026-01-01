/**
 * Amount Detector
 * Monitors donation amounts for suspicious thresholds
 */

export interface AmountAnalysis {
  suspicious: boolean;
  riskScore: number; // 0-100
  reason: string;
  threshold: number;
}

export interface AmountRule {
  minAmount: number;
  maxAmount: number;
  riskScore: number;
  reason: string;
}

export class AmountDetector {
  private static defaultRules: AmountRule[] = [
    {
      minAmount: 0,
      maxAmount: 100,
      riskScore: 0,
      reason: "Normal amount range",
    },
    {
      minAmount: 100000,
      maxAmount: 500000,
      riskScore: 30,
      reason: "Large amount - requires additional verification",
    },
    {
      minAmount: 500000,
      maxAmount: Infinity,
      riskScore: 70,
      reason: "Very large amount - high risk",
    },
  ];

  /**
   * Analyze donation amount
   */
  static analyze(amount: number, customRules?: AmountRule[]): AmountAnalysis {
    const rules = customRules || this.defaultRules;
    const amountStr = amount.toString();

    // Check for suspicious patterns
    // Pattern 1: Exact round numbers (1000, 10000, etc.)
    if (amount % 1000 === 0 && amount >= 10000) {
      return {
        suspicious: true,
        riskScore: 20,
        reason: "Round number amount - potential test transaction",
        threshold: amount,
      };
    }

    // Pattern 2: Very small amounts (potential spam)
    if (amount < 1) {
      return {
        suspicious: true,
        riskScore: 15,
        reason: "Very small amount - potential spam",
        threshold: amount,
      };
    }

    // Pattern 3: Check against rules
    for (const rule of rules) {
      if (amount >= rule.minAmount && amount <= rule.maxAmount) {
        return {
          suspicious: rule.riskScore >= 50,
          riskScore: rule.riskScore,
          reason: rule.reason,
          threshold: rule.maxAmount,
        };
      }
    }

    return {
      suspicious: false,
      riskScore: 0,
      reason: "Amount within normal range",
      threshold: 0,
    };
  }

  /**
   * Check if amount exceeds daily limit
   */
  static checkDailyLimit(
    amount: number,
    dailyTotal: number,
    limit: number = 1000000
  ): AmountAnalysis {
    const newTotal = dailyTotal + amount;

    if (newTotal > limit) {
      return {
        suspicious: true,
        riskScore: 80,
        reason: `Daily limit exceeded: ${newTotal} > ${limit}`,
        threshold: limit,
      };
    }

    return {
      suspicious: false,
      riskScore: 0,
      reason: "Within daily limit",
      threshold: limit,
    };
  }
}


