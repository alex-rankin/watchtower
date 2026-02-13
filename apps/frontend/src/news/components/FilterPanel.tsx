import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { feeds } from "../feeds";
import type { NewsFilters } from "../types";

interface FilterPanelProps {
  filters: NewsFilters;
  onFiltersChange: (filters: NewsFilters) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || "");

  // Extract unique values from feeds
  const allIndustries = Array.from(
    new Set(feeds.flatMap((f) => f.industries || [])),
  ).sort();
  const allSources = Array.from(new Set(feeds.map((f) => f.name))).sort();
  const allLeanings = Array.from(
    new Set(feeds.map((f) => f.leaning).filter(Boolean)),
  ).sort() as string[];

  const updateFilter = <K extends keyof NewsFilters>(
    key: K,
    value: NewsFilters[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (
    key: "industries" | "sources" | "leanings",
    value: string,
  ) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(
      key,
      (updated.length > 0 ? updated : undefined) as NewsFilters[typeof key],
    );
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateFilter("searchQuery", value || undefined);
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="flex flex-wrap gap-2">
            {(["24h", "7d", "30d", "all"] as const).map((range) => (
              <Button
                key={range}
                variant={filters.dateRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter("dateRange", range)}
              >
                {range === "all" ? "All Time" : range.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Industries</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {filters.industries && filters.industries.length > 0
                  ? `${filters.industries.length} selected`
                  : "Select industries"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search industries..." />
                <CommandList>
                  <CommandEmpty>No industries found.</CommandEmpty>
                  <CommandGroup>
                    {allIndustries.map((industry) => (
                      <CommandItem
                        key={industry}
                        onSelect={() =>
                          toggleArrayFilter("industries", industry)
                        }
                      >
                        <Checkbox
                          checked={
                            filters.industries?.includes(industry) ?? false
                          }
                          onCheckedChange={() =>
                            toggleArrayFilter("industries", industry)
                          }
                          className="mr-2"
                        />
                        {industry}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {filters.industries && filters.industries.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {filters.industries.map((industry) => (
                <Badge
                  key={industry}
                  variant="secondary"
                  className="cursor-pointer text-xs hover:bg-secondary/80"
                  onClick={() => toggleArrayFilter("industries", industry)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleArrayFilter("industries", industry);
                    }
                  }}
                >
                  {industry} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Sources</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {filters.sources && filters.sources.length > 0
                  ? `${filters.sources.length} selected`
                  : "Select sources"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search sources..." />
                <CommandList>
                  <CommandEmpty>No sources found.</CommandEmpty>
                  <CommandGroup>
                    {allSources.map((source) => (
                      <CommandItem
                        key={source}
                        onSelect={() => toggleArrayFilter("sources", source)}
                      >
                        <Checkbox
                          checked={filters.sources?.includes(source) ?? false}
                          onCheckedChange={() =>
                            toggleArrayFilter("sources", source)
                          }
                          className="mr-2"
                        />
                        {source}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {filters.sources && filters.sources.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {filters.sources.map((source) => (
                <Badge
                  key={source}
                  variant="secondary"
                  className="cursor-pointer text-xs hover:bg-secondary/80"
                  onClick={() => toggleArrayFilter("sources", source)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleArrayFilter("sources", source);
                    }
                  }}
                >
                  {source} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Leaning</Label>
          <div className="flex flex-wrap gap-2">
            {allLeanings.map((leaning) => (
              <Button
                key={leaning}
                variant={
                  filters.leanings?.includes(
                    leaning as
                      | "left"
                      | "center"
                      | "right"
                  )
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => toggleArrayFilter("leanings", leaning)}
              >
                {leaning}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Sort By</Label>
          <div className="flex gap-2">
            <Button
              variant={filters.sortBy === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter("sortBy", "newest")}
            >
              Newest
            </Button>
            <Button
              variant={filters.sortBy === "source" ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter("sortBy", "source")}
            >
              Source
            </Button>
          </div>
        </div>

        {(filters.industries?.length ||
          filters.sources?.length ||
          filters.leanings?.length ||
          filters.dateRange !== "all" ||
          filters.searchQuery) && (
          <>
            <Separator />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearchQuery("");
                onFiltersChange({
                  searchQuery: undefined,
                  dateRange: "all",
                  industries: undefined,
                  sources: undefined,
                  leanings: undefined,
                  sortBy: "newest",
                });
              }}
            >
              Clear All Filters
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
