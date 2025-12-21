import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygonAmoy, polygon } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Philanthropical",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: [polygonAmoy, polygon],
  ssr: true,
});

