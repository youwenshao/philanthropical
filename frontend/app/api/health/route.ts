import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    environment: process.env.NODE_ENV,
    checks: {
      database: "unknown",
      api: "ok",
    },
  };

  // Check database connection
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from("charities").select("count").limit(1);
      
      if (error) {
        health.checks.database = "unhealthy";
        health.status = "degraded";
      } else {
        health.checks.database = "healthy";
      }
    } catch (error) {
      health.checks.database = "unhealthy";
      health.status = "degraded";
    }
  } else {
    health.checks.database = "not_configured";
  }

  const statusCode = health.status === "healthy" ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}

