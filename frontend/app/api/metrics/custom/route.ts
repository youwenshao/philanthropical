import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/metrics/custom
 * Receives custom performance metrics from client
 */
export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();
    
    // Store custom metrics (could be sent to analytics service or database)
    // For now, log in development
    if (process.env.NODE_ENV === "development") {
      console.log("Custom metric:", metric);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to store custom metric" },
      { status: 400 }
    );
  }
}

