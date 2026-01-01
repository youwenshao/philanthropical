"use client";

import { useDonations } from "./useDonations";
import { useEffect, useState } from "react";
import { Donation } from "./useDonations";

export function useDonationFeed() {
  const { data, refetch } = useDonations({ limit: 50 });
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    if (data) {
      setDonations(data);
    }
  }, [data]);

  // Poll for new donations
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  return {
    donations,
    isLoading: !data,
    refetch,
  };
}



