import { createFileRoute } from "@tanstack/react-router";
import { MajorsWidget } from "@/markets/components/MajorsWidget";
import { NewsTapeWidget } from "@/news/components/NewsTapeWidget";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-10">
      <MajorsWidget />
      <NewsTapeWidget />
    </div>
  );
}
