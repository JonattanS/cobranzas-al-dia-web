import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserMenu } from "@/components/UserMenu";
import { useUser } from "@/contexts/UserContext";
import HomePage from "./pages/HomePage";
import CuentasPorCobrarPage from "./pages/CuentasPorCobrarPage";
import CuentasPorPagarPage from "./pages/CuentasPorPagarPage";
import ClientesPage from "./pages/ClientesPage";
import ClienteDetailPage from "./pages/ClienteDetailPage";
import QueryManualPage from "./pages/QueryManualPage";
import DynamicFunctionPage from "./pages/DynamicFunctionPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import { UserProvider } from "@/contexts/UserContext";
import ConsultaDocumentosPage from "./pages/ConsultaDocumentosPage";

const Demo = () => {
  const { user } = useUser();
  console.log("User actual:", user);

  // Ejemplo de uso condicional
  if (!user) {
    return <div>No hay usuario autenticado</div>;
  }

  return <div>Bienvenido, {user.usrnom || user.usrcod}</div>;
};

const queryClient = new QueryClient();

/**
 * Layout principal de la app, solo visible si el usuario está autenticado
 */
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();

  const renderRoleBanner = () => {
    if (user?.rolcod === "adm") {
      return <p className="text-sm text-green-600 font-semibold">Rol: Administrador</p>;
    }
    if (user?.rolcod === "teso") {
      return <p className="text-sm text-yellow-600 font-semibold">Rol: Tesorería</p>;
    }
    if (user?.rolcod === "conta") {
      return <p className="text-sm text-blue-600 font-semibold">Rol: Contabilidad</p>;
    }
  };

  return (
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
                    Nova Web
                  </h2>
                  
                </div>
              </div>
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
const AppRoutes = () => {
  const { login } = useUser();

  return (
    <Routes>
      
      <Route path="/login" element={<Login onLogin={login} />} />

    <Route
      path="/"
      element={
        <ProtectedRoute>
          <MainLayout>
            <HomePage />
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/cuentas-por-cobrar"
      element={
        <ProtectedRoute>
          <MainLayout>
            <CuentasPorCobrarPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/cuentas-por-pagar"
      element={
        <ProtectedRoute>
          <MainLayout>
            <CuentasPorPagarPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/ConsultaDocumentosPage"
      element={
        <ProtectedRoute>
          <MainLayout>
            <ConsultaDocumentosPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/clientes"
      element={
        <ProtectedRoute>
          <MainLayout>
            <ClientesPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/clientes/:nit"
      element={
        <ProtectedRoute>
          <MainLayout>
            <ClienteDetailPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/query-manual"
      element={
        <ProtectedRoute>
          <MainLayout>
            <QueryManualPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/dynamic-function/:id"
      element={
        <ProtectedRoute>
          <MainLayout>
            <DynamicFunctionPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />
    {/* NotFound también protegido */}
    <Route
      path="*"
      element={
        <ProtectedRoute>
          <MainLayout>
            <NotFound />
          </MainLayout>
        </ProtectedRoute>
      }
    />
  </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
