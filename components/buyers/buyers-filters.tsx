"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export function BuyersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "All cities");
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || "All types"
  );
  const [status, setStatus] = useState(
    searchParams.get("status") || "All statuses"
  );
  const [timeline, setTimeline] = useState(
    searchParams.get("timeline") || "All timelines"
  );

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    // Reset to page 1 when search changes
    params.delete("page");

    router.push(`/buyers?${params.toString()}`);
  }, [debouncedSearch, router, searchParams]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    params.delete("page");

    router.push(`/buyers?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setSearch("");
    setCity("All cities");
    setPropertyType("All types");
    setStatus("All statuses");
    setTimeline("All timelines");
    router.push("/buyers");
  };

  const activeFiltersCount = [
    city,
    propertyType,
    status,
    timeline,
    search,
  ].filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select
              value={city}
              onValueChange={(value) => {
                setCity(value);
                updateFilter("city", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All cities">All cities</SelectItem>
                <SelectItem value="CHANDIGARH">Chandigarh</SelectItem>
                <SelectItem value="MOHALI">Mohali</SelectItem>
                <SelectItem value="ZIRAKPUR">Zirakpur</SelectItem>
                <SelectItem value="PANCHKULA">Panchkula</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type</Label>
            <Select
              value={propertyType}
              onValueChange={(value) => {
                setPropertyType(value);
                updateFilter("propertyType", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All types">All types</SelectItem>
                <SelectItem value="APARTMENT">Apartment</SelectItem>
                <SelectItem value="VILLA">Villa</SelectItem>
                <SelectItem value="PLOT">Plot</SelectItem>
                <SelectItem value="OFFICE">Office</SelectItem>
                <SelectItem value="RETAIL">Retail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                updateFilter("status", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All statuses">All statuses</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="VISITED">Visited</SelectItem>
                <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                <SelectItem value="CONVERTED">Converted</SelectItem>
                <SelectItem value="DROPPED">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline</Label>
            <Select
              value={timeline}
              onValueChange={(value) => {
                setTimeline(value);
                updateFilter("timeline", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All timelines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All timelines">All timelines</SelectItem>
                <SelectItem value="ZERO_TO_THREE_MONTHS">0-3 months</SelectItem>
                <SelectItem value="THREE_TO_SIX_MONTHS">3-6 months</SelectItem>
                <SelectItem value="MORE_THAN_SIX_MONTHS">6+ months</SelectItem>
                <SelectItem value="EXPLORING">Just exploring</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
