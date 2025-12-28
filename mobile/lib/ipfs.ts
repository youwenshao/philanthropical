import { LocationData } from "@/hooks/useLocation";

const IPFS_API_URL = process.env.EXPO_PUBLIC_IPFS_API_URL || "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_JWT = process.env.EXPO_PUBLIC_PINATA_JWT || "";

export async function uploadToIPFS(
  imageUri: string,
  location: LocationData | null
): Promise<string> {
  try {
    // Create form data
    const formData = new FormData();
    
    // Add image file
    const filename = imageUri.split("/").pop() || "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("file", {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    // Add metadata
    const metadata = {
      name: filename,
      keyvalues: {
        ...(location && {
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          timestamp: new Date().toISOString(),
        }),
      },
    };

    formData.append("pinataMetadata", JSON.stringify(metadata));

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", pinataOptions);

    // Upload to Pinata
    const response = await fetch(IPFS_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`IPFS upload failed: ${error}`);
    }

    const data = await response.json();
    return data.IpfsHash;
  } catch (error: any) {
    console.error("IPFS upload error:", error);
    throw error;
  }
}

