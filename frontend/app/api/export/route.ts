import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "csv";
    const type = searchParams.get("type") || "donations";

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let data: any[] = [];
    let filename = "";

    switch (type) {
      case "donations":
        const { data: donations } = await supabase
          .from("donation_events")
          .select("*")
          .eq("processed", true)
          .order("created_at", { ascending: false })
          .limit(10000);
        data = donations || [];
        filename = "donations";
        break;
      case "charities":
        const { data: charities } = await supabase
          .from("charities")
          .select("*")
          .order("created_at", { ascending: false });
        data = charities || [];
        filename = "charities";
        break;
      case "verifications":
        const { data: verifications } = await supabase
          .from("verification_submissions")
          .select("*")
          .order("submitted_at", { ascending: false })
          .limit(10000);
        data = verifications || [];
        filename = "verifications";
        break;
      default:
        return NextResponse.json(
          { error: "Invalid export type" },
          { status: 400 }
        );
    }

    if (format === "csv") {
      return exportAsCSV(data, filename);
    } else if (format === "json") {
      return exportAsJSON(data, filename);
    } else {
      return NextResponse.json(
        { error: "Unsupported format" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

function exportAsCSV(data: any[], filename: string): NextResponse {
  if (data.length === 0) {
    return new NextResponse("No data to export", { status: 400 });
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? "";
        })
        .join(",")
    ),
  ];

  const csv = csvRows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}-${Date.now()}.csv"`,
    },
  });
}

function exportAsJSON(data: any[], filename: string): NextResponse {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}-${Date.now()}.json"`,
    },
  });
}

