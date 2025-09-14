"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Trash2, Eye, Phone, Mail } from "lucide-react";
import Link from "next/link";

interface Buyer {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  status: string;
  updatedAt: string;
}

interface BuyersTableProps {
  buyers: Buyer[];
}

const statusColors = {
  NEW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  QUALIFIED:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  CONTACTED:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  VISITED:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  NEGOTIATION:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  CONVERTED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  DROPPED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const formatBudget = (min?: number, max?: number) => {
  if (!min && !max) return "Not specified";
  if (min && max)
    return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
  if (min) return `₹${(min / 100000).toFixed(1)}L+`;
  if (max) return `Up to ₹${(max / 100000).toFixed(1)}L`;
  return "Not specified";
};

const formatEnumValue = (value: string) => {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

export function BuyersTable({ buyers }: BuyersTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/buyers/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete buyer");
      }

      router.refresh();
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting buyer:", error);
      // You could add a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  if (buyers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Eye className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No leads found</h3>
        <p className="text-muted-foreground mb-4">
          No buyer leads match your current filters. Try adjusting your search
          criteria.
        </p>
        <Button asChild>
          <Link href="/buyers/new">Create Your First Lead</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buyers.map((buyer) => (
              <TableRow key={buyer.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/buyers/${buyer.id}`}
                    className="hover:underline"
                  >
                    {buyer.fullName}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="w-3 h-3" />
                      {buyer.phone}
                    </div>
                    {buyer.email && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {buyer.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatEnumValue(buyer.city)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {formatEnumValue(buyer.propertyType)}
                    </div>
                    {buyer.bhk && (
                      <div className="text-xs text-muted-foreground">
                        {formatEnumValue(buyer.bhk)} BHK
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {formatEnumValue(buyer.purpose)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {formatEnumValue(buyer.timeline)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`text-xs ${
                      statusColors[buyer.status as keyof typeof statusColors]
                    }`}
                  >
                    {formatEnumValue(buyer.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(buyer.updatedAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/buyers/${buyer.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/buyers/${buyer.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Lead
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(buyer.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be
              undone and will permanently remove all associated data including
              history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Lead"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
