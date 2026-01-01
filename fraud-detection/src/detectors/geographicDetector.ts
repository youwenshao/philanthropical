/**
 * Geographic Detector
 * Validates geolocation data for verification submissions
 */

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GeographicAnalysis {
  suspicious: boolean;
  riskScore: number; // 0-100
  issues: string[];
  validated: boolean;
}

export class GeographicDetector {
  /**
   * Validate geolocation coordinates
   */
  static validate(location: Location): GeographicAnalysis {
    const issues: string[] = [];
    let riskScore = 0;

    // Check 1: Valid latitude range (-90 to 90)
    if (location.latitude < -90 || location.latitude > 90) {
      issues.push("Invalid latitude");
      riskScore += 50;
    }

    // Check 2: Valid longitude range (-180 to 180)
    if (location.longitude < -180 || location.longitude > 180) {
      issues.push("Invalid longitude");
      riskScore += 50;
    }

    // Check 3: Accuracy threshold (if provided)
    if (location.accuracy !== undefined && location.accuracy > 1000) {
      issues.push("Low accuracy GPS reading (>1000m)");
      riskScore += 20;
    }

    // Check 4: Zero coordinates (0, 0) - often indicates missing data
    if (location.latitude === 0 && location.longitude === 0) {
      issues.push("Zero coordinates - likely missing geolocation data");
      riskScore += 40;
    }

    return {
      suspicious: riskScore >= 50,
      riskScore: Math.min(100, riskScore),
      issues,
      validated: issues.length === 0,
    };
  }

  /**
   * Check proximity between two locations (Haversine formula)
   */
  static calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (loc1.latitude * Math.PI) / 180;
    const φ2 = (loc2.latitude * Math.PI) / 180;
    const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Check if location is within expected range of charity
   */
  static checkProximity(
    verificationLocation: Location,
    charityLocation: Location,
    expectedRadius: number = 50000 // 50km default
  ): GeographicAnalysis {
    const distance = this.calculateDistance(verificationLocation, charityLocation);
    const issues: string[] = [];
    let riskScore = 0;

    if (distance > expectedRadius) {
      issues.push(
        `Verification location is ${(distance / 1000).toFixed(2)}km from charity location (expected within ${(expectedRadius / 1000).toFixed(2)}km)`
      );
      riskScore = Math.min(100, (distance / expectedRadius) * 50);
    }

    return {
      suspicious: riskScore >= 50,
      riskScore,
      issues,
      validated: issues.length === 0,
    };
  }

  /**
   * Detect location spoofing (impossible travel speeds)
   */
  static detectImpossibleTravel(
    locations: Array<Location & { timestamp: number }>
  ): GeographicAnalysis {
    if (locations.length < 2) {
      return {
        suspicious: false,
        riskScore: 0,
        issues: [],
        validated: true,
      };
    }

    const sorted = locations.sort((a, b) => a.timestamp - b.timestamp);
    const issues: string[] = [];
    let maxSpeed = 0;

    for (let i = 1; i < sorted.length; i++) {
      const distance = this.calculateDistance(sorted[i - 1], sorted[i]);
      const timeDiff = sorted[i].timestamp - sorted[i - 1].timestamp;

      if (timeDiff <= 0) continue;

      // Calculate speed in m/s, convert to km/h
      const speed = (distance / timeDiff) * 3.6; // km/h

      // Maximum realistic speed (considering air travel: ~1000 km/h)
      if (speed > 1200) {
        issues.push(
          `Impossible travel detected: ${speed.toFixed(2)} km/h between locations`
        );
        maxSpeed = Math.max(maxSpeed, speed);
      }
    }

    const riskScore = maxSpeed > 1200 ? Math.min(100, (maxSpeed / 1200) * 50) : 0;

    return {
      suspicious: riskScore >= 50,
      riskScore,
      issues,
      validated: issues.length === 0,
    };
  }
}


