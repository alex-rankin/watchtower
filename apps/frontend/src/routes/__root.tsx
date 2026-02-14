import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createRootRoute({
  component: RootComponent,
});

const PATH_TO_TAB: Record<string, string> = {
  "/": "dashboard",
  "/news": "news",
  "/pnl": "pnl",
};

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/news", label: "News" },
  { to: "/pnl", label: "PNL" },
] as const;

function RootComponent() {
  const location = useLocation();
  const activeTab = PATH_TO_TAB[location.pathname] ?? "dashboard";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-card">
        <nav className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            {/* Desktop: tabs */}
            <div className="hidden md:block">
              <Tabs value={activeTab} className="w-auto">
                <TabsList>
                  {navItems.map(({ to, label }) => (
                    <TabsTrigger key={to} value={PATH_TO_TAB[to]} asChild>
                      <Link
                        to={to}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        {label}
                      </Link>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            {/* Mobile: hamburger toggles to X, opens menu below header */}
            <ThemeToggle />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative md:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              <Menu
                className="h-5 w-5 transition-opacity duration-200"
                aria-hidden
                style={{ opacity: mobileMenuOpen ? 0 : 1 }}
              />
              <X
                className="absolute inset-0 m-auto h-5 w-5 transition-opacity duration-200"
                aria-hidden
                style={{ opacity: mobileMenuOpen ? 1 : 0 }}
              />
            </Button>
          </div>
        </nav>
        {/* Mobile menu: slides down from header */}
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out md:hidden"
          style={{ gridTemplateRows: mobileMenuOpen ? "1fr" : "0fr" }}
          aria-hidden={!mobileMenuOpen}
        >
          <nav
            className="overflow-hidden border-t border-border/70 bg-card"
            aria-label="Navigation menu"
          >
            <div className="container mx-auto flex flex-col px-4 py-2">
              {navItems.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === to
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  );
}
