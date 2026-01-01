import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * GET /api/metrics
 * Returns application metrics
 */
export async function GET(request: NextRequest) {
  try {
    const metrics: Record<string, any> = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    // Get database metrics if available
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Get counts from materialized views if available
        const [donations, charities, verifications] = await Promise.all([
          supabase.from("donation_events").select("id", { count: "exact", head: true }),
          supabase.from("charities").select("id", { count: "exact", head: true }),
          supabase.from("verification_submissions").select("id", { count: "exact", head: true }),
        ]);

        metrics.database = {
          donations: donations.count || 0,
          charities: charities.count || 0,
          verifications: verifications.count || 0,
        };
      } catch (error) {
        metrics.database = { error: "Failed to fetch database metrics" };
      }
    }

    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/metrics
 * Accepts custom metrics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Store metrics (could be sent to analytics service or database)
    // For now, just log in development
    if (process.env.NODE_ENV === "development") {
      console.log("Custom metric:", body);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to store metric" },
      { status: 400 }
    );
  }
}

