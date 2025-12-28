"use client";

import { useState } from "react";
import { useCharities } from "@/hooks/useCharities";
import { CharityTable } from "@/components/admin/CharityTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function CharitiesPage() {
  const { data: charities, isLoading } = useCharities();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Charity Management</h2>
          <p className="text-muted-foreground">Manage charity registrations and verifications</p>
        </div>
        <Link href="/admin/charities/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Register Charity
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading charities...</div>
      ) : (
        <CharityTable charities={charities || []} />
      )}
    </div>
  );
}

