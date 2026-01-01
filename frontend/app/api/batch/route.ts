import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BatchRequestSchema = z.object({
  requests: z.array(
    z.object({
      endpoint: z.string(),
      method: z.enum(["GET", "POST"]).default("GET"),
      params: z.record(z.any()).optional(),
      body: z.any().optional(),
    })
  ).min(1).max(10), // Limit to 10 requests per batch
});

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const validated = BatchRequestSchema.parse(body);

    const supabase = createClient(supabaseUrl, supabaseKey);
    const results = await Promise.allSettled(
      validated.requests.map(async (req) => {
        try {
          // Handle different endpoints
          if (req.endpoint === "donations") {
            const query = supabase
              .from("donation_events")
              .select("*")
              .eq("processed", true)
              .limit(req.params?.limit || 100);

            if (req.params?.donor) {
              query.eq("donor_address", req.params.donor);
            }
            if (req.params?.charity) {
              query.eq("charity_address", req.params.charity);
            }

            const { data, error } = await query;
            if (error) throw error;
            return { success: true, data };
          }

          if (req.endpoint === "charities") {
            const { data, error } = await supabase
              .from("charities")
              .select("*")
              .limit(req.params?.limit || 100);

            if (error) throw error;
            return { success: true, data };
          }

          if (req.endpoint === "verifications") {
            const query = supabase
              .from("verification_submissions")
              .select("*")
              .limit(req.params?.limit || 100);

            if (req.params?.charity) {
              query.eq("charity_address", req.params.charity);
            }

            const { data, error } = await query;
            if (error) throw error;
            return { success: true, data };
          }

          throw new Error(`Unknown endpoint: ${req.endpoint}`);
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    const responses = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason?.message || "Request failed",
        };
      }
    });

    return NextResponse.json({
      results: responses,
      total: responses.length,
      successful: responses.filter((r) => r.success).length,
      failed: responses.filter((r) => !r.success).length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Batch API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

