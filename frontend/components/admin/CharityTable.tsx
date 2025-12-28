"use client";

import { Charity } from "@/hooks/useCharities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Address } from "viem";

interface CharityTableProps {
  charities: Charity[];
}

export function CharityTable({ charities }: CharityTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "suspended":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reputation</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {charities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No charities registered yet
              </TableCell>
            </TableRow>
          ) : (
            charities.map((charity) => (
              <TableRow key={charity.address}>
                <TableCell className="font-medium">{charity.name}</TableCell>
                <TableCell>
                  <code className="text-xs">{charity.address.slice(0, 10)}...</code>
                </TableCell>
                <TableCell>{getStatusBadge(charity.verificationStatus)}</TableCell>
                <TableCell>{charity.reputationScore}/1000</TableCell>
                <TableCell>
                  {new Date(charity.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Link href={`/admin/charities/${charity.address}`}>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

