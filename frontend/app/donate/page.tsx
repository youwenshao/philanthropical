import { DonationForm } from "@/components/donation/DonationForm";

export default function DonatePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Make a Donation</h1>
        <p className="text-muted-foreground">
          Support verified charities with transparent, on-chain donations
        </p>
      </div>
      <DonationForm />
    </div>
  );
}

