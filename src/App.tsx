import { PnlCalculator } from "./components/PnlCalculator";

function App() {
  return (
    <main className="flex min-h-screen items-start justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-6xl">
        <PnlCalculator />
      </div>
    </main>
  );
}

export default App;
