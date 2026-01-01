import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Request validation schema
const DonationQuerySchema = z.object({
  donor: z.string().optional(),
  charity: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).optional().default(100),
  offset: z.coerce.number().min(0).optional().default(0),
  sortBy: z.enum(["created_at", "amount"]).optional().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const searchParams = request.nextUrl.searchParams;

    // Validate query parameters
    const queryParams = {
      donor: searchParams.get("donor") || undefined,
      charity: searchParams.get("charity") || undefined,
      limit: searchParams.get("limit") || "100",
      offset: searchParams.get("offset") || "0",
      sortBy: searchParams.get("sortBy") || "created_at",
      sortOrder: searchParams.get("sortOrder") || "desc",
    };

    const validatedParams = DonationQuerySchema.parse(queryParams);

    // Build query
    let query = supabase
      .from("donation_events")
      .select("*", { count: "exact" })
      .eq("processed", true)
      .order(validatedParams.sortBy, { ascending: validatedParams.sortOrder === "asc" })
      .range(validatedParams.offset, validatedParams.offset + validatedParams.limit - 1);

    if (validatedParams.donor) {
      query = query.eq("donor_address", validatedParams.donor);
    }

    if (validatedParams.charity) {
      query = query.eq("charity_address", validatedParams.charity);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Add cache headers
    const response = NextResponse.json({
      data: data || [],
      pagination: {
        total: count || 0,
        limit: validatedParams.limit,
        offset: validatedParams.offset,
        hasMore: (count || 0) > validatedParams.offset + validatedParams.limit,
      },
    });

    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    response.headers.set("X-API-Version", "2.0");

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Donations API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

