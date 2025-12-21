import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygonMumbai, polygon } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Philanthropical",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: [polygonMumbai, polygon],
  ssr: true,
});

