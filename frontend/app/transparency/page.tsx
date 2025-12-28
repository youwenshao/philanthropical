import { DonationFeed } from "@/components/transparency/DonationFeed";
import { CharityDirectory } from "@/components/transparency/CharityDirectory";
import { ImpactMetrics } from "@/components/transparency/ImpactMetrics";
import { DonationFlowChart } from "@/components/transparency/DonationFlowChart";

export default function TransparencyPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Transparency Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Real-time view of all donations and charity activities on-chain
        </p>
      </div>

      <ImpactMetrics />

      <div className="grid gap-6 md:grid-cols-2">
        <DonationFeed />
        <CharityDirectory />
      </div>

      <DonationFlowChart />
    </div>
  );
}

