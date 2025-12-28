import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygonAmoy, polygon } from "wagmi/chains";

// Configure wagmi with Polygon Amoy as the first chain (default)
export const config = getDefaultConfig({
  appName: "Philanthropical",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: [polygonAmoy, polygon], // polygonAmoy is first, so it's the default
  ssr: true,
});

