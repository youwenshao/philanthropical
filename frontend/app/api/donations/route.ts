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
    const donor = searchParams.get("donor");
    const charity = searchParams.get("charity");
    const limit = parseInt(searchParams.get("limit") || "100");

    let query = supabase.from("donation_events").select("*");

    if (donor) {
      query = query.eq("donor_address", donor);
    }

    if (charity) {
      query = query.eq("charity_address", charity);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Donations API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await limiter.check(request, 10, "CACHE_TOKEN");

    // This endpoint is typically called by the indexer service
    // For direct donations, they go through the blockchain
    const body = await request.json();
    const {
      donationId,
      donorAddress,
      charityAddress,
      amount,
      tokenAddress,
      receiptTokenId,
      transactionHash,
      blockNumber,
    } = body;

    if (
      !donationId ||
      !donorAddress ||
      !charityAddress ||
      !amount ||
      !transactionHash
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.from("donation_events").insert({
      donation_id: donationId,
      donor_address: donorAddress,
      charity_address: charityAddress,
      amount: amount.toString(),
      token_address: tokenAddress,
      receipt_token_id: receiptTokenId,
      transaction_hash: transactionHash,
      block_number: blockNumber,
      processed: false,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Donations API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}



