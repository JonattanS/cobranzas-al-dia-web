
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
import ClienteDetailPage from "./pages/ClienteDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1 flex flex-col">
              <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center px-4">
                  <SidebarTrigger />
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold">Sistema de Gestión Financiera</h2>
                  </div>
                </div>
              </header>
              <div className="flex-1 space-y-4 p-4 pt-6">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/cuentas-por-cobrar" element={<CuentasPorCobrarPage />} />
                  <Route path="/cuentas-por-pagar" element={<CuentasPorPagarPage />} />
                  <Route path="/clientes/:nit" element={<ClienteDetailPage />} />
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
