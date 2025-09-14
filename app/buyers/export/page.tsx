"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClientHeader } from "@/components/layout/client-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  const handleExport = async () => {
    setIsExporting(true);
    setError("");

    try {
      // Pass current filters to export
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/buyers/export?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to export leads");
      }

      // Download the file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        response.headers
          .get("Content-Disposition")
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || "leads.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export leads");
    } finally {
      setIsExporting(false);
    }
  };

  // Get active filters for display
  const activeFilters = {
    search: searchParams.get("search"),
    city: searchParams.get("city"),
    propertyType: searchParams.get("propertyType"),
    status: searchParams.get("status"),
    timeline: searchParams.get("timeline"),
  };

  const hasFilters = Object.values(activeFilters).some(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" asChild>
              <Link href="/buyers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leads
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Export Leads</h1>
              <p className="text-muted-foreground mt-2">
                Download your buyer leads as a CSV file
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Export Configuration
              </CardTitle>
              <CardDescription>
                Export leads based on your current filters and search criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Active Filters Display */}
              <div>
                <h4 className="font-medium mb-3">Current Filters</h4>
                {hasFilters ? (
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.search && (
                      <Badge variant="secondary">
                        Search: {activeFilters.search}
                      </Badge>
                    )}
                    {activeFilters.city && (
                      <Badge variant="secondary">
                        City: {activeFilters.city}
                      </Badge>
                    )}
                    {activeFilters.propertyType && (
                      <Badge variant="secondary">
                        Property: {activeFilters.propertyType}
                      </Badge>
                    )}
                    {activeFilters.status && (
                      <Badge variant="secondary">
                        Status: {activeFilters.status}
                      </Badge>
                    )}
                    {activeFilters.timeline && (
                      <Badge variant="secondary">
                        Timeline: {activeFilters.timeline}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline">
                    No filters applied - exporting all leads
                  </Badge>
                )}
              </div>

              {/* Export Information */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Export Details</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• CSV format with all lead information</li>
                  <li>
                    • Includes personal details, property requirements, and lead
                    status
                  </li>
                  <li>
                    • Compatible with Excel, Google Sheets, and other
                    spreadsheet applications
                  </li>
                  <li>• Only exports leads you own</li>
                  <li>• Respects current search and filter settings</li>
                </ul>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Export Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing Export...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download CSV
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button variant="outline" asChild>
                    <Link href="/buyers">Cancel</Link>
                  </Button>
                </div>
              </div>

              {/* CSV Format Information */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">CSV Columns</h4>
                <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1">
                  <span>• fullName</span>
                  <span>• email</span>
                  <span>• phone</span>
                  <span>• city</span>
                  <span>• propertyType</span>
                  <span>• bhk</span>
                  <span>• purpose</span>
                  <span>• budgetMin</span>
                  <span>• budgetMax</span>
                  <span>• timeline</span>
                  <span>• source</span>
                  <span>• status</span>
                  <span>• notes</span>
                  <span>• tags</span>
                  <span>• createdAt</span>
                  <span>• updatedAt</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
