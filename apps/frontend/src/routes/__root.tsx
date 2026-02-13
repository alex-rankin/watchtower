import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/70 bg-card">
        <div className="container mx-auto px-4 py-3">
          <Tabs
            value={currentPath === "/" ? "dashboard" : "news"}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="dashboard" asChild>
                <Link
                  to="/"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Dashboard
                </Link>
              </TabsTrigger>
              <TabsTrigger value="news" asChild>
                <Link
                  to="/news"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  News
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  );
}
