
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserProvider } from "@/contexts/UserContext";
import { UserMenu } from "@/components/UserMenu";
import HomePage from "./pages/HomePage";
import CuentasPorCobrarPage from "./pages/CuentasPorCobrarPage";
import CuentasPorPagarPage from "./pages/CuentasPorPagarPage";
import ClientesPage from "./pages/ClientesPage";
import ClienteDetailPage from "./pages/ClienteDetailPage";
import QueryManualPage from "./pages/QueryManualPage";
import DynamicFunctionPage from "./pages/DynamicFunctionPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm sticky top-0 z-40">
                  <div className="flex h-16 items-center justify-between px-6">
                    <div className="flex items-center space-x-4">
                      <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />
                      <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Nova Financial
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Sistema de Gestión Financiera</p>
                      </div>
                    </div>
                    <UserMenu />
                  </div>
                </header>
                <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                  <div className="max-w-7xl mx-auto w-full">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/cuentas-por-cobrar" element={<CuentasPorCobrarPage />} />
                      <Route path="/cuentas-por-pagar" element={<CuentasPorPagarPage />} />
                      <Route path="/clientes" element={<ClientesPage />} />
                      <Route path="/clientes/:nit" element={<ClienteDetailPage />} />
                      <Route path="/query-manual" element={<QueryManualPage />} />
                      <Route path="/dynamic-function/:id" element={<DynamicFunctionPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
