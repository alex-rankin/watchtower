import { createFileRoute } from "@tanstack/react-router";
import { PnlCalculator } from "@/components/PnlCalculator";

export const Route = createFileRoute("/pnl")({
  component: PnlPage,
});

function PnlPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <PnlCalculator />
    </div>
  );
}
