/**
 * Fraud Detection Service
 * Main entry point for fraud detection service
 */

import express from "express";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { PatternDetector } from "./detectors/patternDetector";
import { AmountDetector } from "./detectors/amountDetector";
import { FrequencyDetector } from "./detectors/frequencyDetector";
import { GeographicDetector } from "./detectors/geographicDetector";
import { ImageDetector } from "./detectors/imageDetector";
import { FeatureExtractor, TransactionFeatures } from "./ml/featureExtractor";
import { MLInference, MLModelConfig } from "./ml/inference";
import { AlertGenerator } from "./alertGenerator";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const alertGenerator = new AlertGenerator(supabaseUrl, supabaseKey);

// ML Model configuration
const mlConfig: MLModelConfig = {
  modelVersion: process.env.ML_MODEL_VERSION || "v1.0.0",
  modelEndpoint: process.env.ML_MODEL_ENDPOINT,
  modelType: "transaction",
};

const mlInference = new MLInference(mlConfig);

/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "fraud-detection" });
});

/**
 * Detect fraud in a transaction
 */
app.post("/detect/transaction", async (req, res) => {
  try {
    const { transaction, donorHistory, charityHistory } = req.body;

    if (!transaction) {
      return res.status(400).json({ error: "Transaction data required" });
    }

    const results: any = {};

    // Pattern detection
    const patternAnalysis = PatternDetector.analyze(
      donorHistory || [],
      transaction
    );
    results.pattern = patternAnalysis;

    // Amount detection
    const amountAnalysis = AmountDetector.analyze(parseFloat(transaction.amount));
    results.amount = amountAnalysis;

    // Frequency detection
    const frequencyAnalysis = FrequencyDetector.analyze(donorHistory || []);
    results.frequency = frequencyAnalysis;

    // Calculate overall risk score
    const riskScores = [
      patternAnalysis.riskScore,
      amountAnalysis.riskScore,
      frequencyAnalysis.riskScore,
    ];
    const overallRiskScore = Math.max(...riskScores);

    // ML inference (if enabled)
    let mlResult = null;
    if (mlConfig.modelEndpoint) {
      const features = FeatureExtractor.extractTransactionFeatures(
        transaction,
        donorHistory || [],
        charityHistory || []
      );
      mlResult = await mlInference.predictTransaction(features);
      riskScores.push(mlResult.riskScore);
    }

    const finalRiskScore = Math.max(...riskScores);

    // Generate alert if suspicious
    if (finalRiskScore >= 50) {
      await alertGenerator.generateAndSave(
        "transaction_fraud",
        "transaction",
        transaction.transactionHash || transaction.id,
        finalRiskScore,
        `Suspicious transaction detected. Patterns: ${patternAnalysis.patterns.join(", ")}`,
        {
          patternAnalysis,
          amountAnalysis,
          frequencyAnalysis,
          mlResult,
        }
      );
    }

    // Save analysis result
    await supabase.from("fraud_analysis_results").insert({
      analysis_type: "transaction",
      entity_id: transaction.transactionHash || transaction.id,
      risk_score: finalRiskScore,
      features: {
        pattern: patternAnalysis,
        amount: amountAnalysis,
        frequency: frequencyAnalysis,
      },
      result: {
        overallRiskScore: finalRiskScore,
        mlResult,
        suspicious: finalRiskScore >= 50,
      },
    });

    res.json({
      suspicious: finalRiskScore >= 50,
      riskScore: finalRiskScore,
      analyses: results,
      mlResult,
    });
  } catch (error: any) {
    console.error("Transaction fraud detection error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

/**
 * Detect fraud in a verification
 */
app.post("/detect/verification", async (req, res) => {
  try {
    const { verification, imageBuffer, geolocation } = req.body;

    if (!verification) {
      return res.status(400).json({ error: "Verification data required" });
    }

    const results: any = {};

    // Geographic detection
    if (geolocation) {
      const geoAnalysis = GeographicDetector.validate(geolocation);
      results.geographic = geoAnalysis;
    } else {
      results.geographic = {
        suspicious: true,
        riskScore: 30,
        issues: ["Missing geolocation data"],
        validated: false,
      };
    }

    // Image detection
    if (imageBuffer) {
      try {
        const buffer = Buffer.from(imageBuffer, "base64");
        const imageAnalysis = await ImageDetector.analyze(buffer);
        results.image = imageAnalysis;
      } catch (error: any) {
        results.image = {
          suspicious: true,
          riskScore: 50,
          issues: [`Image analysis failed: ${error.message}`],
          metadata: null,
        };
      }
    } else {
      results.image = {
        suspicious: true,
        riskScore: 40,
        issues: ["Missing image data"],
        metadata: null,
      };
    }

    // Calculate overall risk score
    const riskScores = [
      results.geographic.riskScore,
      results.image.riskScore,
    ];
    const overallRiskScore = Math.max(...riskScores);

    // Generate alert if suspicious
    if (overallRiskScore >= 50) {
      await alertGenerator.generateAndSave(
        "verification_fraud",
        "verification",
        verification.verificationId?.toString() || verification.id,
        overallRiskScore,
        `Suspicious verification detected. Issues: ${[
          ...results.geographic.issues,
          ...results.image.issues,
        ].join(", ")}`,
        {
          geographic: results.geographic,
          image: results.image,
        }
      );
    }

    // Save analysis result
    await supabase.from("fraud_analysis_results").insert({
      analysis_type: "verification",
      entity_id: verification.verificationId?.toString() || verification.id,
      risk_score: overallRiskScore,
      features: {
        hasGeolocation: !!geolocation,
        hasImage: !!imageBuffer,
      },
      result: {
        overallRiskScore,
        suspicious: overallRiskScore >= 50,
      },
    });

    res.json({
      suspicious: overallRiskScore >= 50,
      riskScore: overallRiskScore,
      analyses: results,
    });
  } catch (error: any) {
    console.error("Verification fraud detection error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

/**
 * Batch detection endpoint
 */
app.post("/detect/batch", async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: "Transactions array required" });
    }

    const results = [];

    for (const transaction of transactions) {
      try {
        const response = await fetch(`${req.protocol}://${req.get("host")}/detect/transaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transaction }),
        });

        const result = await response.json();
        results.push(result);
      } catch (error: any) {
        results.push({ error: error.message });
      }
    }

    res.json({ results });
  } catch (error: any) {
    console.error("Batch detection error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Fraud detection service running on port ${PORT}`);
});


