/**
 * Pattern Detector
 * Analyzes transaction patterns for suspicious behavior
 */

export interface TransactionPattern {
  donorAddress: string;
  charityAddress: string;
  amount: string;
  timestamp: number;
  transactionHash: string;
}

export interface PatternAnalysis {
  suspicious: boolean;
  riskScore: number; // 0-100
  patterns: string[];
  description: string;
}

export class PatternDetector {
  /**
   * Analyze transaction patterns
   */
  static analyze(
    transactions: TransactionPattern[],
    currentTransaction: TransactionPattern
  ): PatternAnalysis {
    const patterns: string[] = [];
    let riskScore = 0;

    // Pattern 1: Rapid successive donations to same charity
    const recentDonations = transactions.filter(
      (tx) =>
        tx.donorAddress.toLowerCase() === currentTransaction.donorAddress.toLowerCase() &&
        tx.charityAddress.toLowerCase() === currentTransaction.charityAddress.toLowerCase() &&
        currentTransaction.timestamp - tx.timestamp < 3600 // Within 1 hour
    );

    if (recentDonations.length >= 5) {
      patterns.push("rapid_successive_donations");
      riskScore += 30;
    }

    // Pattern 2: Round number amounts (potential test transactions)
    const amount = parseFloat(currentTransaction.amount);
    if (amount % 1000 === 0 && amount >= 10000) {
      patterns.push("round_number_amount");
      riskScore += 10;
    }

    // Pattern 3: Same donor, multiple charities in short time
    const multiCharityDonations = transactions.filter(
      (tx) =>
        tx.donorAddress.toLowerCase() === currentTransaction.donorAddress.toLowerCase() &&
        currentTransaction.timestamp - tx.timestamp < 3600
    );

    const uniqueCharities = new Set(
      multiCharityDonations.map((tx) => tx.charityAddress.toLowerCase())
    );

    if (uniqueCharities.size >= 10) {
      patterns.push("multi_charity_rapid");
      riskScore += 25;
    }

    // Pattern 4: Unusual amount distribution
    const amounts = transactions.map((tx) => parseFloat(tx.amount));
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sq, n) => sq + Math.pow(n - avgAmount, 2), 0) / amounts.length
    );

    if (Math.abs(amount - avgAmount) > 3 * stdDev) {
      patterns.push("unusual_amount");
      riskScore += 15;
    }

    // Pattern 5: New donor, large amount
    const donorHistory = transactions.filter(
      (tx) => tx.donorAddress.toLowerCase() === currentTransaction.donorAddress.toLowerCase()
    );

    if (donorHistory.length === 0 && amount > 100000) {
      patterns.push("new_donor_large_amount");
      riskScore += 20;
    }

    return {
      suspicious: riskScore >= 50,
      riskScore: Math.min(100, riskScore),
      patterns,
      description: patterns.length > 0
        ? `Detected patterns: ${patterns.join(", ")}`
        : "No suspicious patterns detected",
    };
  }
}


