import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/metrics/web-vitals
 * Receives Core Web Vitals metrics from client
 */
export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();
    
    // Store web vitals (could be sent to analytics service or database)
    // For now, log in development
    if (process.env.NODE_ENV === "development") {
      console.log("Web Vital:", metric);
    }

    // In production, you might want to:
    // 1. Send to analytics service (Mixpanel, PostHog, etc.)
    // 2. Store in database for analysis
    // 3. Send alerts if metrics are poor

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to store web vital" },
      { status: 400 }
    );
  }
}

