import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

// Public Storefront Pages
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CombosPage from "./pages/CombosPage";
import ComboDetailPage from "./pages/ComboDetailPage";
import CMSDynamicPage from "./pages/CMSDynamicPage";

// Admin Panel Pages
import AdminLogin from "./pages/admin/AdminLogin";
import DashboardView from "./pages/admin/DashboardView";
import ProductsView from "./pages/admin/ProductsView";
import CategoriesView from "./pages/admin/CategoriesView";
import BrandsView from "./pages/admin/BrandsView";
import OrdersView from "./pages/admin/OrdersView";
import CustomersView from "./pages/admin/CustomersView";
import MarketingView from "./pages/admin/MarketingView";
import HomepageBuilderView from "./pages/admin/HomepageBuilderView";
import HeaderNavView from "./pages/admin/HeaderNavView";
import CMSPagesView from "./pages/admin/CMSPagesView";
import MediaLibraryView from "./pages/admin/MediaLibraryView";
import ActivityLogsView from "./pages/admin/ActivityLogsView";
import SettingsView from "./pages/admin/SettingsView";
import AdminUsersView from "./pages/admin/AdminUsersView";
import ReportsView from "./pages/admin/ReportsView";

function Router() {
  return (
    <Switch>
      {/* Public Storefront Routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/category/:id"} component={CategoryPage} />
      <Route path={"/product/:id"} component={ProductDetailPage} />
      <Route path={"/cart"} component={CartPage} />
      <Route path={"/combos"} component={CombosPage} />
      <Route path={"/combo/:id"} component={ComboDetailPage} />
      <Route path={"/page/:slug"} component={CMSDynamicPage} />

      {/* Admin Authentication */}
      <Route path={"/admin/login"} component={AdminLogin} />

      {/* Protected Admin Routes */}
      <Route path={"/admin"}>
        {() => <ProtectedAdminRoute component={DashboardView} />}
      </Route>
      <Route path={"/admin/dashboard"}>
        {() => <ProtectedAdminRoute component={DashboardView} />}
      </Route>
      <Route path={"/admin/products"}>
        {() => <ProtectedAdminRoute component={ProductsView} />}
      </Route>
      <Route path={"/admin/categories"}>
        {() => <ProtectedAdminRoute component={CategoriesView} />}
      </Route>
      <Route path={"/admin/brands"}>
        {() => <ProtectedAdminRoute component={BrandsView} />}
      </Route>
      <Route path={"/admin/orders"}>
        {() => <ProtectedAdminRoute component={OrdersView} />}
      </Route>
      <Route path={"/admin/customers"}>
        {() => <ProtectedAdminRoute component={CustomersView} />}
      </Route>
      <Route path={"/admin/marketing"}>
        {() => <ProtectedAdminRoute component={MarketingView} />}
      </Route>
      <Route path={"/admin/flash-sale"}>
        {() => <ProtectedAdminRoute component={MarketingView} />}
      </Route>
      <Route path={"/admin/coupons"}>
        {() => <ProtectedAdminRoute component={MarketingView} />}
      </Route>
      <Route path={"/admin/sliders"}>
        {() => <ProtectedAdminRoute component={MarketingView} />}
      </Route>
      <Route path={"/admin/homepage"}>
        {() => <ProtectedAdminRoute component={HomepageBuilderView} />}
      </Route>
      <Route path={"/admin/header-nav"}>
        {() => <ProtectedAdminRoute component={HeaderNavView} />}
      </Route>
      <Route path={"/admin/pages"}>
        {() => <ProtectedAdminRoute component={CMSPagesView} />}
      </Route>
      <Route path={"/admin/media"}>
        {() => <ProtectedAdminRoute component={MediaLibraryView} />}
      </Route>
      <Route path={"/admin/settings"}>
        {() => <ProtectedAdminRoute component={SettingsView} />}
      </Route>
      <Route path={"/admin/shipping-payment"}>
        {() => <ProtectedAdminRoute component={SettingsView} />}
      </Route>
      <Route path={"/admin/seo"}>
        {() => <ProtectedAdminRoute component={SettingsView} />}
      </Route>
      <Route path={"/admin/users"}>
        {() => <ProtectedAdminRoute component={AdminUsersView} />}
      </Route>
      <Route path={"/admin/activity-logs"}>
        {() => <ProtectedAdminRoute component={ActivityLogsView} />}
      </Route>
      <Route path={"/admin/logs"}>
        {() => <ProtectedAdminRoute component={ActivityLogsView} />}
      </Route>
      <Route path={"/admin/reports"}>
        {() => <ProtectedAdminRoute component={ReportsView} />}
      </Route>

      {/* Fallback routes */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster position="top-right" richColors />
            <Router />
          </TooltipProvider>
        </AdminAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
