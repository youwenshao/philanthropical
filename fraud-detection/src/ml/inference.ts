/**
 * ML Inference API
 * Provides endpoints for ML model inference
 */

import { FeatureExtractor, TransactionFeatures, VerificationFeatures } from "./featureExtractor";

export interface MLModelConfig {
  modelVersion: string;
  modelEndpoint?: string;
  modelType: "transaction" | "verification" | "combined";
}

export interface MLInferenceResult {
  riskScore: number; // 0-100
  prediction: "fraud" | "legitimate" | "suspicious";
  confidence: number; // 0-1
  modelVersion: string;
  features: number[];
  explanation?: string;
}

export class MLInference {
  private modelConfig: MLModelConfig;

  constructor(config: MLModelConfig) {
    this.modelConfig = config;
  }

  /**
   * Run inference on transaction features
   */
  async predictTransaction(
    features: TransactionFeatures
  ): Promise<MLInferenceResult> {
    // Normalize features
    const normalizedFeatures = FeatureExtractor.normalizeFeatures(features);

    // In production, this would call an actual ML model endpoint
    // For now, return a placeholder result
    if (this.modelConfig.modelEndpoint) {
      try {
        const response = await fetch(this.modelConfig.modelEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            features: normalizedFeatures,
            modelVersion: this.modelConfig.modelVersion,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          return {
            riskScore: result.riskScore || 0,
            prediction: result.prediction || "legitimate",
            confidence: result.confidence || 0.5,
            modelVersion: this.modelConfig.modelVersion,
            features: normalizedFeatures,
            explanation: result.explanation,
          };
        }
      } catch (error) {
        console.error("ML inference error:", error);
      }
    }

    // Fallback: rule-based prediction
    return this.fallbackPrediction(features, normalizedFeatures);
  }

  /**
   * Run inference on verification features
   */
  async predictVerification(
    features: VerificationFeatures
  ): Promise<MLInferenceResult> {
    const normalizedFeatures = FeatureExtractor.normalizeFeatures(features);

    // Similar to transaction prediction
    if (this.modelConfig.modelEndpoint) {
      try {
        const response = await fetch(this.modelConfig.modelEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            features: normalizedFeatures,
            modelVersion: this.modelConfig.modelVersion,
            type: "verification",
          }),
        });

        if (response.ok) {
          const result = await response.json();
          return {
            riskScore: result.riskScore || 0,
            prediction: result.prediction || "legitimate",
            confidence: result.confidence || 0.5,
            modelVersion: this.modelConfig.modelVersion,
            features: normalizedFeatures,
            explanation: result.explanation,
          };
        }
      } catch (error) {
        console.error("ML inference error:", error);
      }
    }

    return this.fallbackPrediction(features, normalizedFeatures);
  }

  /**
   * Fallback prediction using simple heuristics
   */
  private fallbackPrediction(
    features: TransactionFeatures | VerificationFeatures,
    normalizedFeatures: number[]
  ): MLInferenceResult {
    // Simple heuristic-based risk scoring
    let riskScore = 0;

    if ("donorTotalDonations" in features) {
      const txFeatures = features as TransactionFeatures;

      // New donor with large amount
      if (txFeatures.donorTotalDonations === 0 && txFeatures.amount > 10000) {
        riskScore += 30;
      }

      // High frequency
      if (txFeatures.donationsInLast24h > 20) {
        riskScore += 25;
      }

      // Round number amounts
      if (txFeatures.isRoundNumber && txFeatures.amount > 1000) {
        riskScore += 15;
      }
    } else {
      const verFeatures = features as VerificationFeatures;

      // Missing geolocation
      if (!verFeatures.hasGeolocation) {
        riskScore += 30;
      }

      // Missing image metadata
      if (!verFeatures.hasImageMetadata) {
        riskScore += 25;
      }

      // Low verifier reputation
      if (verFeatures.verifierReputation < 100) {
        riskScore += 20;
      }
    }

    const prediction =
      riskScore >= 70 ? "fraud" : riskScore >= 40 ? "suspicious" : "legitimate";
    const confidence = Math.min(0.9, 0.5 + riskScore / 200);

    return {
      riskScore,
      prediction,
      confidence,
      modelVersion: this.modelConfig.modelVersion,
      features: normalizedFeatures,
      explanation: `Fallback prediction based on heuristics. Risk score: ${riskScore}`,
    };
  }

  /**
   * Batch inference for multiple transactions
   */
  async batchPredict(
    featuresList: (TransactionFeatures | VerificationFeatures)[]
  ): Promise<MLInferenceResult[]> {
    const results: MLInferenceResult[] = [];

    for (const features of featuresList) {
      if ("donorTotalDonations" in features) {
        results.push(await this.predictTransaction(features as TransactionFeatures));
      } else {
        results.push(await this.predictVerification(features as VerificationFeatures));
      }
    }

    return results;
  }
}


