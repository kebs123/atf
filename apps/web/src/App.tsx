import { ThemeProvider } from "@/lib/theme";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Verify from "./pages/Verify";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ManufacturerHome from "./pages/app/ManufacturerHome";
import Products from "./pages/app/Products";
import ProductDetail from "./pages/app/ProductDetail";
import BatchDetail from "./pages/app/BatchDetail";
import Alerts from "./pages/app/Alerts";
import Shipments from "./pages/app/Shipments";
import AdminHome from "./pages/admin/AdminHome";
import Companies from "./pages/admin/Companies";
import Flags from "./pages/admin/Flags";
import Verifications from "./pages/admin/Verifications";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import { RequireAuth } from "./components/auth/RequireAuth";

const App = () => (
  <ThemeProvider>
  <TooltipProvider>
    <Toaster />
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/app"
          element={
            <RequireAuth role="manufacturer">
              <ManufacturerHome />
            </RequireAuth>
          }
        />
        <Route
          path="/app/products"
          element={
            <RequireAuth role="manufacturer">
              <Products />
            </RequireAuth>
          }
        />
        <Route
          path="/app/products/:id"
          element={
            <RequireAuth role="manufacturer">
              <ProductDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/app/batches/:id"
          element={
            <RequireAuth role="manufacturer">
              <BatchDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/app/alerts"
          element={
            <RequireAuth role="manufacturer">
              <Alerts />
            </RequireAuth>
          }
        />
        <Route
          path="/app/shipments"
          element={
            <RequireAuth role="manufacturer">
              <Shipments />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminHome />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <RequireAuth role="admin">
              <Companies />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/flags"
          element={
            <RequireAuth role="admin">
              <Flags />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <RequireAuth role="admin">
              <Verifications />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
  </ThemeProvider>
);

export default App;
