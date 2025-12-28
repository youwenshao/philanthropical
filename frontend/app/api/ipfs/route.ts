import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  try {
    await limiter.check(request, 20, "CACHE_TOKEN");

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to Pinata
    const pinataFormData = new FormData();
    pinataFormData.append("file", file);

    const pinataMetadata = JSON.stringify({
      name: file.name,
    });
    pinataFormData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    pinataFormData.append("pinataOptions", pinataOptions);

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: pinataFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinata upload failed: ${error}`);
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    return NextResponse.json({
      hash: ipfsHash,
      url: ipfsUrl,
    });
  } catch (error: any) {
    console.error("IPFS API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

