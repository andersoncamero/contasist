import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/molecules/Toaster";
import { Toaster as Sonner } from "./components/atoms/Sonner";
import { TooltipProvider } from "./components/atoms/Tooltip";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import Clients from "./pages/Clients";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Expenses from "./pages/Expenses";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import AccountingJournal from "./pages/AccountingJournal";
import { Quotations } from "./pages/Quotations";
import { QuotationDetail } from "./pages/QuotationDetail";
import { QuotationNew } from "./pages/QuotationNew";
import { Settings } from "./pages/Settings";
import { BalanceSheet } from "./pages/BalanceSheet";
import { IncomeStatement } from "./pages/IncomeStatement";
import { AuxiliaryReport } from "./pages/AuxiliaryReport";
import { InventoryDashboard } from "./pages/InventoryDashboard";
import { InventoryMovementNew } from "./pages/InventoryMovementNew";
import { KardexReport } from "./pages/KardexReport";
import { ProtectedRoute } from "./components/organisms/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                //<ProtectedRoute>
                <Dashboard />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                //<ProtectedRoute>
                <Clients />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                //<ProtectedRoute>
                <Products />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                //<ProtectedRoute>
                <Suppliers />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                //<ProtectedRoute>
                <Expenses />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/accounting/chart"
              element={
                //<ProtectedRoute>
                <ChartOfAccounts />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/accounting/journal"
              element={
                //<ProtectedRoute>
                <AccountingJournal />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/quotations"
              element={
                //<ProtectedRoute>
                <Quotations />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/quotations/:id"
              element={
                //<ProtectedRoute>
                <QuotationDetail />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/quotations/new"
              element={
                //<ProtectedRoute>
                <QuotationNew />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/balance"
              element={
                //<ProtectedRoute>
                <BalanceSheet />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/reports/income-statement"
              element={
                //<ProtectedRoute>
                <IncomeStatement />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/reports/auxiliary"
              element={
                //<ProtectedRoute>
                <AuxiliaryReport />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                //<ProtectedRoute>
                <InventoryDashboard />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/inventory/movements/new"
              element={
                //<ProtectedRoute>
                <InventoryMovementNew />
                //</ProtectedRoute>
              }
            />
            <Route
              path="/inventory/kardex/:id"
              element={
                //<ProtectedRoute>
                <KardexReport />
                //</ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
