/**
 * Image Detector
 * Validates image metadata and detects manipulation
 */

import sharp from "sharp";
import exifr from "exifr";

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  exif?: any;
  gps?: {
    latitude: number;
    longitude: number;
  };
  timestamp?: number;
}

export interface ImageAnalysis {
  suspicious: boolean;
  riskScore: number; // 0-100
  issues: string[];
  metadata: ImageMetadata | null;
}

export class ImageDetector {
  /**
   * Analyze image file
   */
  static async analyze(imageBuffer: Buffer): Promise<ImageAnalysis> {
    const issues: string[] = [];
    let riskScore = 0;
    let metadata: ImageMetadata | null = null;

    try {
      // Get image metadata using sharp
      const image = sharp(imageBuffer);
      const imageMetadata = await image.metadata();

      metadata = {
        width: imageMetadata.width || 0,
        height: imageMetadata.height || 0,
        format: imageMetadata.format || "unknown",
        size: imageBuffer.length,
      };

      // Check 1: Image dimensions
      if (metadata.width < 100 || metadata.height < 100) {
        issues.push("Image too small - potential low quality or manipulation");
        riskScore += 20;
      }

      if (metadata.width > 10000 || metadata.height > 10000) {
        issues.push("Image unusually large - potential manipulation");
        riskScore += 15;
      }

      // Check 2: Image format
      const validFormats = ["jpeg", "jpg", "png", "webp"];
      if (!validFormats.includes(metadata.format.toLowerCase())) {
        issues.push(`Unusual image format: ${metadata.format}`);
        riskScore += 10;
      }

      // Check 3: File size
      if (metadata.size < 1000) {
        issues.push("Image file too small - potential corruption");
        riskScore += 25;
      }

      if (metadata.size > 10 * 1024 * 1024) {
        issues.push("Image file too large (>10MB)");
        riskScore += 10;
      }

      // Extract EXIF data
      try {
        const exifData = await exifr.parse(imageBuffer, {
          gps: true,
          exif: true,
          ifd0: true,
        });

        if (exifData) {
          metadata.exif = exifData;

          // Check 4: GPS coordinates
          if (exifData.latitude && exifData.longitude) {
            metadata.gps = {
              latitude: exifData.latitude,
              longitude: exifData.longitude,
            };
          } else {
            issues.push("Missing GPS coordinates in image metadata");
            riskScore += 30;
          }

          // Check 5: Timestamp
          if (exifData.DateTimeOriginal || exifData.DateTime) {
            const dateStr = exifData.DateTimeOriginal || exifData.DateTime;
            metadata.timestamp = new Date(dateStr).getTime();
          } else {
            issues.push("Missing timestamp in image metadata");
            riskScore += 20;
          }

          // Check 6: Camera/device info
          if (!exifData.Make && !exifData.Model) {
            issues.push("Missing camera/device information - potential manipulation");
            riskScore += 15;
          }
        } else {
          issues.push("No EXIF data found - image may have been stripped");
          riskScore += 40;
        }
      } catch (exifError) {
        issues.push("Failed to extract EXIF data");
        riskScore += 30;
      }
    } catch (error: any) {
      issues.push(`Image analysis failed: ${error.message}`);
      riskScore = 100;
    }

    return {
      suspicious: riskScore >= 50,
      riskScore: Math.min(100, riskScore),
      issues,
      metadata,
    };
  }

  /**
   * Validate image has required metadata
   */
  static validateMetadata(metadata: ImageMetadata): ImageAnalysis {
    const issues: string[] = [];
    let riskScore = 0;

    if (!metadata.gps) {
      issues.push("Missing GPS coordinates");
      riskScore += 30;
    }

    if (!metadata.timestamp) {
      issues.push("Missing timestamp");
      riskScore += 20;
    }

    if (!metadata.exif) {
      issues.push("Missing EXIF data");
      riskScore += 40;
    }

    return {
      suspicious: riskScore >= 50,
      riskScore,
      issues,
      metadata,
    };
  }

  /**
   * Check image similarity (perceptual hashing would be implemented here)
   */
  static async checkSimilarity(
    image1Buffer: Buffer,
    image2Buffer: Buffer
  ): Promise<{ similar: boolean; similarity: number }> {
    // Placeholder for perceptual hashing implementation
    // In production, use libraries like `sharp` with pHash or `jimp` with perceptual hash
    return {
      similar: false,
      similarity: 0,
    };
  }
}


