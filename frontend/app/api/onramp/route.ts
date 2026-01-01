import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

// Rate limit: 10 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per interval
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    await limiter.check(request, 10, "CACHE_TOKEN");

    const body = await request.json();
    const { provider, transactionId, action } = body;

    if (!provider || !transactionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case "getStatus": {
        if (provider === "ramp") {
          const response = await fetch(
            `https://api.ramp.network/api/host/transactions/${transactionId}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.RAMP_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch Ramp transaction status");
          }

          const data = await response.json();
          return NextResponse.json({ status: data.status, data });
        } else if (provider === "moonpay") {
          const response = await fetch(
            `https://api.moonpay.com/v1/transactions/${transactionId}?apiKey=${process.env.MOONPAY_API_KEY}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch MoonPay transaction status");
          }

          const data = await response.json();
          return NextResponse.json({ status: data.status, data });
        }
        break;
      }

      case "webhook": {
        // Verify webhook signature and process
        // This would be called by Ramp/MoonPay webhooks
        // Implementation depends on webhook verification requirements
        return NextResponse.json({ received: true });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  } catch (error: any) {
    console.error("On-ramp API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await limiter.check(request, 10, "CACHE_TOKEN");

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider");
    const transactionId = searchParams.get("transactionId");

    if (!provider || !transactionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get transaction status
    if (provider === "ramp") {
      const response = await fetch(
        `https://api.ramp.network/api/host/transactions/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.RAMP_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Ramp transaction status");
      }

      const data = await response.json();
      return NextResponse.json({ status: data.status, data });
    } else if (provider === "moonpay") {
      const response = await fetch(
        `https://api.moonpay.com/v1/transactions/${transactionId}?apiKey=${process.env.MOONPAY_API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch MoonPay transaction status");
      }

      const data = await response.json();
      return NextResponse.json({ status: data.status, data });
    }

    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  } catch (error: any) {
    console.error("On-ramp API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}



