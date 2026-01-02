import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rateLimit";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    await limiter.check(request, 30, "CACHE_TOKEN");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase.from("charities").select("*");

    if (status) {
      query = query.eq("verification_status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Transform snake_case to camelCase for frontend
    const transformedData = (data || []).map((charity: any) => ({
      address: charity.address,
      name: charity.name,
      description: charity.description,
      registrationNumber: charity.registration_number,
      reputationScore: charity.reputation_score,
      verificationStatus: charity.verification_status,
      createdAt: charity.created_at,
      verifiedAt: charity.verified_at,
      verifiedBy: charity.verified_by,
      challengePeriodEnd: charity.challenge_period_end,
    }));

    return NextResponse.json(transformedData);
  } catch (error: any) {
    console.error("Charities API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await limiter.check(request, 10, "CACHE_TOKEN");

    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { address, name, description, registrationNumber } = body;

    if (!address || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.from("charities").insert({
      address,
      name,
      description,
      registration_number: registrationNumber,
      verification_status: "pending",
      reputation_score: 100,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Charities API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}



