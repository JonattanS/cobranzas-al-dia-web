
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import HomePage from "./pages/HomePage";
import CuentasPorCobrarPage from "./pages/CuentasPorCobrarPage";
import CuentasPorPagarPage from "./pages/CuentasPorPagarPage";
import ClientesPage from "./pages/ClientesPage";
import ClienteDetailPage from "./pages/ClienteDetailPage";
import QueryManualPage from "./pages/QueryManualPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-muted/20">
            <AppSidebar />
            <main className="flex-1 flex flex-col">
              <header className="border-b bg-card/50 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 shadow-sm">
                <div className="flex h-16 items-center px-6">
                  <SidebarTrigger className="hover:bg-accent/80 transition-colors" />
                  <div className="ml-4">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      Nova Financial
                    </h2>
                    <p className="text-xs text-muted-foreground">Sistema de Gestión Financiera</p>
                  </div>
                </div>
              </header>
              <div className="flex-1 space-y-6 p-6 custom-scrollbar overflow-auto">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/cuentas-por-cobrar" element={<CuentasPorCobrarPage />} />
                  <Route path="/cuentas-por-pagar" element={<CuentasPorPagarPage />} />
                  <Route path="/clientes" element={<ClientesPage />} />
                  <Route path="/clientes/:nit" element={<ClienteDetailPage />} />
                  <Route path="/query-manual" element={<QueryManualPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
