import { useState } from "react";
import { FilterPanel } from "../components/FilterPanel";
import { NewsList } from "../components/NewsList";
import type { NewsFilters } from "../types";

export function NewsPage() {
  const [filters, setFilters] = useState<NewsFilters>({
    dateRange: "all",
    sortBy: "newest",
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">News Feed</h1>
        <p className="mt-2 text-muted-foreground">
          Stay informed with the latest market news and updates.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
        </aside>

        <main>
          <NewsList filters={filters} />
        </main>
      </div>
    </div>
  );
}
