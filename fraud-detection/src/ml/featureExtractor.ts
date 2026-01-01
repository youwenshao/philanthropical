/**
 * Feature Extractor
 * Extracts features from transactions and verifications for ML models
 */

export interface TransactionFeatures {
  // Donor features
  donorTotalDonations: number;
  donorTotalAmount: number;
  donorAvgAmount: number;
  donorDaysActive: number;
  donorUniqueCharities: number;

  // Transaction features
  amount: number;
  amountLog: number;
  isRoundNumber: boolean;
  timeOfDay: number;
  dayOfWeek: number;

  // Charity features
  charityTotalDonations: number;
  charityTotalAmount: number;
  charityAvgDonation: number;
  charityDaysActive: number;
  charityReputationScore: number;

  // Temporal features
  hoursSinceLastDonation: number;
  donationsInLast24h: number;
  donationsInLast7d: number;
  donationsInLast30d: number;

  // Network features
  donorNetworkSize: number;
  charityNetworkSize: number;
}

export interface VerificationFeatures {
  // Verification features
  verificationId: number;
  evidenceHash: string;
  hasGeolocation: boolean;
  hasImageMetadata: boolean;
  imageSize: number;
  imageWidth: number;
  imageHeight: number;

  // Verifier features
  verifierReputation: number;
  verifierTotalVerifications: number;
  verifierSuccessRate: number;

  // Temporal features
  hoursSinceSubmission: number;
  verificationCount: number;
}

export class FeatureExtractor {
  /**
   * Extract features from transaction data
   */
  static extractTransactionFeatures(
    transaction: {
      donorAddress: string;
      charityAddress: string;
      amount: string;
      timestamp: number;
    },
    donorHistory: Array<{ amount: string; timestamp: number; charityAddress: string }>,
    charityHistory: Array<{ amount: string; timestamp: number; donorAddress: string }>
  ): TransactionFeatures {
    const amount = parseFloat(transaction.amount);
    const donorDonations = donorHistory.length;
    const donorTotal = donorHistory.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const donorAvg = donorDonations > 0 ? donorTotal / donorDonations : 0;
    const uniqueCharities = new Set(donorHistory.map((tx) => tx.charityAddress.toLowerCase())).size;

    const charityDonations = charityHistory.length;
    const charityTotal = charityHistory.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const charityAvg = charityDonations > 0 ? charityTotal / charityDonations : 0;

    // Calculate time-based features
    const now = transaction.timestamp;
    const lastDonation = donorHistory.length > 0
      ? Math.max(...donorHistory.map((tx) => tx.timestamp))
      : now;
    const hoursSinceLast = (now - lastDonation) / 3600;

    const last24h = now - 24 * 3600;
    const last7d = now - 7 * 24 * 3600;
    const last30d = now - 30 * 24 * 3600;

    const donations24h = donorHistory.filter((tx) => tx.timestamp >= last24h).length;
    const donations7d = donorHistory.filter((tx) => tx.timestamp >= last7d).length;
    const donations30d = donorHistory.filter((tx) => tx.timestamp >= last30d).length;

    // Calculate days active
    const firstDonation = donorHistory.length > 0
      ? Math.min(...donorHistory.map((tx) => tx.timestamp))
      : now;
    const daysActive = (now - firstDonation) / (24 * 3600);

    // Time features
    const date = new Date(transaction.timestamp * 1000);
    const timeOfDay = date.getHours();
    const dayOfWeek = date.getDay();

    return {
      // Donor features
      donorTotalDonations: donorDonations,
      donorTotalAmount: donorTotal,
      donorAvgAmount: donorAvg,
      donorDaysActive: Math.max(1, daysActive),
      donorUniqueCharities: uniqueCharities,

      // Transaction features
      amount,
      amountLog: Math.log10(amount + 1),
      isRoundNumber: amount % 1000 === 0,
      timeOfDay,
      dayOfWeek,

      // Charity features
      charityTotalDonations: charityDonations,
      charityTotalAmount: charityTotal,
      charityAvgDonation: charityAvg,
      charityDaysActive: daysActive,
      charityReputationScore: 100, // Default, should be fetched from contract

      // Temporal features
      hoursSinceLastDonation: hoursSinceLast,
      donationsInLast24h: donations24h,
      donationsInLast7d: donations7d,
      donationsInLast30d: donations30d,

      // Network features (placeholder)
      donorNetworkSize: uniqueCharities,
      charityNetworkSize: new Set(charityHistory.map((tx) => tx.donorAddress.toLowerCase())).size,
    };
  }

  /**
   * Extract features from verification data
   */
  static extractVerificationFeatures(
    verification: {
      verificationId: number;
      evidenceHash: string;
      geolocation?: { latitude: number; longitude: number };
      imageMetadata?: {
        width: number;
        height: number;
        size: number;
        gps?: { latitude: number; longitude: number };
      };
      verifierReputation?: number;
      verifierTotalVerifications?: number;
      verifierSuccessRate?: number;
      submittedAt: number;
    }
  ): VerificationFeatures {
    return {
      verificationId: verification.verificationId,
      evidenceHash: verification.evidenceHash,
      hasGeolocation: !!verification.geolocation,
      hasImageMetadata: !!verification.imageMetadata,
      imageSize: verification.imageMetadata?.size || 0,
      imageWidth: verification.imageMetadata?.width || 0,
      imageHeight: verification.imageMetadata?.height || 0,
      verifierReputation: verification.verifierReputation || 0,
      verifierTotalVerifications: verification.verifierTotalVerifications || 0,
      verifierSuccessRate: verification.verifierSuccessRate || 0,
      hoursSinceSubmission: (Date.now() / 1000 - verification.submittedAt) / 3600,
      verificationCount: 1,
    };
  }

  /**
   * Normalize features for ML model input
   */
  static normalizeFeatures(features: TransactionFeatures | VerificationFeatures): number[] {
    // Convert features object to array of normalized values
    // This is a simplified version - in production, use proper normalization
    const values = Object.values(features).filter((v) => typeof v === "number") as number[];

    // Min-max normalization (placeholder - should use actual min/max from training data)
    return values.map((v) => {
      // Simple normalization - in production, use proper scaling
      if (v === 0) return 0;
      return Math.min(1, Math.max(0, v / 1000000)); // Arbitrary scaling
    });
  }
}


