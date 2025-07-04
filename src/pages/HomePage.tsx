
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CreditCard, Plus, BarChart3, FileText, Database, Code, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DatabaseConfig } from '@/components/DatabaseConfig';
import { databaseService, type SavedModule } from '@/services/database';

const HomePage = () => {
  const navigate = useNavigate();
  const [isDbConfigured, setIsDbConfigured] = useState(false);
  const [savedModules, setSavedModules] = useState<SavedModule[]>([]);

  useEffect(() => {
    setIsDbConfigured(databaseService.isConfigured());
    setSavedModules(databaseService.getSavedModules());
  }, []);

  const mainFunctions = [
    {
      id: 'cuentas-cobrar',
      title: 'Cuentas por Cobrar',
      description: 'Gestión y consulta de clientes y documentos por cobrar',
      icon: Users,
      color: 'bg-blue-500',
      available: isDbConfigured,
      route: '/cuentas-por-cobrar',
      features: ['Dashboard ejecutivo', 'Lista de clientes', 'Detalle de documentos', 'Filtros avanzados']
    },
    {
      id: 'cuentas-pagar',
      title: 'Cuentas por Pagar',
      description: 'Gestión y consulta de proveedores y documentos por pagar',
      icon: CreditCard,
      color: 'bg-red-500',
      available: false,
      route: '/cuentas-por-pagar',
      features: ['Dashboard ejecutivo', 'Lista de proveedores', 'Detalle de documentos', 'Filtros avanzados']
    },
    {
      id: 'query-manual',
      title: 'Query Manual',
      description: 'Ejecuta consultas SQL personalizadas y crea módulos reutilizables',
      icon: Code,
      color: 'bg-purple-500',
      available: isDbConfigured,
      route: '/query-manual',
      features: ['Editor SQL', 'Filtros dinámicos', 'Exportar resultados', 'Guardar módulos']
    }
  ];

  const handleFunctionClick = (func: typeof mainFunctions[0]) => {
    if (func.available) {
      navigate(func.route);
    }
  };

  const handleModuleClick = (module: SavedModule) => {
    // Navegar al query manual con el módulo cargado
    navigate('/query-manual', { state: { loadModule: module } });
  };

  const handleDatabaseConfigured = () => {
    setIsDbConfigured(true);
    setSavedModules(databaseService.getSavedModules());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sistema de Gestión Financiera</h1>
        <p className="text-muted-foreground">
          Configura tu base de datos y accede a las herramientas de gestión
        </p>
      </div>

      {/* Configuración de Base de Datos */}
      <DatabaseConfig onConfigured={handleDatabaseConfigured} />

      {/* Funciones principales */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Funciones Principales</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mainFunctions.map((func) => (
            <Card 
              key={func.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                func.available ? 'hover:scale-105' : 'opacity-60'
              }`}
              onClick={() => handleFunctionClick(func)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${func.color} text-white`}>
                    <func.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{func.title}</CardTitle>
                    {!func.available && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        {(func.id === 'cuentas-cobrar' || func.id === 'query-manual') && !isDbConfigured ? 'Configurar BD' : 'Próximamente'}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-4">
                  {func.description}
                </CardDescription>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Funciones incluidas:</p>
                  <ul className="text-sm space-y-1">
                    {func.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <BarChart3 className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <Button 
                    className="w-full" 
                    disabled={!func.available}
                    variant={func.available ? "default" : "secondary"}
                  >
                    {func.available ? 'Acceder' : 
                     (func.id === 'cuentas-cobrar' || func.id === 'query-manual') && !isDbConfigured ? 'Configurar BD primero' : 'En desarrollo'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Módulos Guardados */}
      {savedModules.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Tus Módulos Personalizados</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedModules.map((module) => (
              <Card 
                key={module.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                onClick={() => handleModuleClick(module)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-green-500 text-white">
                      <FolderOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Módulo Personal
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-4">
                    {module.description || 'Módulo personalizado creado desde Query Manual'}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Creado: {new Date(module.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Último uso: {new Date(module.lastUsed).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-4">
                    <Button className="w-full">
                      Ejecutar Módulo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
