
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CreditCard, Plus, BarChart3, FileText, Database, Code, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DatabaseConfig } from '@/components/DatabaseConfig';
import { databaseService } from '@/services/database';
import { moduleService, type PersistentModule } from '@/services/moduleService';

const HomePage = () => {
  const navigate = useNavigate();
  const [isDbConfigured, setIsDbConfigured] = useState(false);
  const [savedModules, setSavedModules] = useState<PersistentModule[]>([]);

  useEffect(() => {
    setIsDbConfigured(databaseService.isConfigured());
    setSavedModules(moduleService.getAllModules().filter(m => !m.isMainFunction));
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

  const handleModuleClick = (module: PersistentModule) => {
    navigate('/query-manual', { state: { loadModule: module } });
  };

  const handleDatabaseConfigured = () => {
    setIsDbConfigured(true);
    setSavedModules(moduleService.getAllModules().filter(m => !m.isMainFunction));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Sistema Financiero Nova
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
          Configura tu base de datos y accede a las herramientas de gestión financiera
        </p>
      </div>

      {/* Configuración de Base de Datos */}
      <DatabaseConfig onConfigured={handleDatabaseConfigured} />

      {/* Funciones principales */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">Funciones Principales</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mainFunctions.map((func) => (
            <Card 
              key={func.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm ${
                func.available ? 'hover:scale-105 hover:-translate-y-1' : 'opacity-60'
              }`}
              onClick={() => handleFunctionClick(func)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${func.color} text-white shadow-lg`}>
                    <func.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-800 dark:text-slate-200">{func.title}</CardTitle>
                    {!func.available && (
                      <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-1 rounded-full">
                        {(func.id === 'cuentas-cobrar' || func.id === 'query-manual') && !isDbConfigured ? 'Configurar BD' : 'Próximamente'}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-4 text-slate-600 dark:text-slate-400">
                  {func.description}
                </CardDescription>
                
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Funciones incluidas:</p>
                  <ul className="text-sm space-y-2">
                    {func.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <BarChart3 className="h-3 w-3 text-emerald-500" />
                        <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <Button 
                    className="w-full shadow-lg transition-all duration-200" 
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
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">Tus Módulos Personalizados</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedModules.map((module) => (
              <Card 
                key={module.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 hover:-translate-y-1 border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20"
                onClick={() => handleModuleClick(module)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-lg">
                      <FolderOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-800 dark:text-slate-200">{module.name}</CardTitle>
                      <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-2 py-1 rounded-full">
                        Módulo Personal
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-4 text-slate-600 dark:text-slate-400">
                    {module.description || 'Módulo personalizado creado desde Query Manual'}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Creado: {new Date(module.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Último uso: {new Date(module.lastUsed).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-6">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg transition-all duration-200">
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
