import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    // Get total donations
    const { count: totalDonations } = await supabase
      .from("donation_events")
      .select("id", { count: "exact", head: true })
      .eq("processed", true);

    // Get total amount (sum of all donations)
    const { data: donationsData } = await supabase
      .from("donation_events")
      .select("amount")
      .eq("processed", true);

    const totalAmount = donationsData?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

    // Get active charities
    const { count: activeCharities } = await supabase
      .from("charities")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "approved");

    // Get verification rate
    const { data: verifications } = await supabase
      .from("verification_submissions")
      .select("verification_result");

    const verifiedCount = verifications?.filter((v) => v.verification_result === "verified").length || 0;
    const totalVerifications = verifications?.length || 0;
    const verificationRate = totalVerifications > 0 ? (verifiedCount / totalVerifications) * 100 : 0;

    // Get donations over time (from materialized view if available, otherwise calculate)
    const { data: donationsOverTime } = await supabase
      .from("donation_analytics_mv")
      .select("*")
      .order("date", { ascending: true })
      .limit(30);

    // Get charity performance (from materialized view if available)
    const { data: charityPerformance } = await supabase
      .from("charity_performance_mv")
      .select("*")
      .order("total_received", { ascending: false })
      .limit(10);

    // Get verification status distribution
    const { data: verificationStatusData } = await supabase
      .from("verification_submissions")
      .select("verification_result");

    const verificationStatus = [
      { status: "verified", count: verificationStatusData?.filter((v) => v.verification_result === "verified").length || 0 },
      { status: "pending", count: verificationStatusData?.filter((v) => v.verification_result === "pending").length || 0 },
      { status: "rejected", count: verificationStatusData?.filter((v) => v.verification_result === "rejected").length || 0 },
      { status: "disputed", count: verificationStatusData?.filter((v) => v.verification_result === "disputed").length || 0 },
    ];

    // Get fraud alerts by severity
    const { data: fraudAlertsData } = await supabase
      .from("fraud_alerts")
      .select("severity");

    const fraudAlerts = [
      { severity: "critical", count: fraudAlertsData?.filter((f) => f.severity === "critical").length || 0 },
      { severity: "high", count: fraudAlertsData?.filter((f) => f.severity === "high").length || 0 },
      { severity: "medium", count: fraudAlertsData?.filter((f) => f.severity === "medium").length || 0 },
      { severity: "low", count: fraudAlertsData?.filter((f) => f.severity === "low").length || 0 },
    ];

    return NextResponse.json({
      totalDonations: totalDonations || 0,
      totalAmount,
      activeCharities: activeCharities || 0,
      verificationRate: Math.round(verificationRate * 100) / 100,
      donationsOverTime: donationsOverTime || [],
      charityPerformance: charityPerformance || [],
      verificationStatus,
      fraudAlerts,
      // Placeholder for change calculations (would need historical data)
      donationsChange: 0,
      amountChange: 0,
      charitiesChange: 0,
      verificationRateChange: 0,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

