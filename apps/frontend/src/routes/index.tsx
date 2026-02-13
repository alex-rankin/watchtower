import { createFileRoute } from "@tanstack/react-router";
import { PnlCalculator } from "@/components/PnlCalculator";
import { NewsTapeWidget } from "@/news/components/NewsTapeWidget";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Trading Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor your positions and stay informed with the latest market
            news.
          </p>
        </div>
        <PnlCalculator />
        <NewsTapeWidget />
      </div>
    </div>
  );
}
