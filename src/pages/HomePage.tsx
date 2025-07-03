
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CreditCard, Plus, BarChart3, FileText, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DatabaseConfig } from '@/components/DatabaseConfig';
import { databaseService } from '@/services/database';

const HomePage = () => {
  const navigate = useNavigate();
  const [isDbConfigured, setIsDbConfigured] = useState(false);

  useEffect(() => {
    setIsDbConfigured(databaseService.isConfigured());
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
    }
  ];

  const handleFunctionClick = (func: typeof mainFunctions[0]) => {
    if (func.available) {
      navigate(func.route);
    }
  };

  const handleDatabaseConfigured = () => {
    setIsDbConfigured(true);
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
                      {func.id === 'cuentas-cobrar' && !isDbConfigured ? 'Configurar BD' : 'Próximamente'}
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
                   func.id === 'cuentas-cobrar' && !isDbConfigured ? 'Configurar BD primero' : 'En desarrollo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Placeholder para futuras funciones */}
        <Card className="border-dashed border-2 cursor-pointer transition-all hover:shadow-lg hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gray-200 text-gray-600">
                <Plus className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Próximas Funciones</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-4">
              Nuevas funcionalidades se agregarán próximamente
            </CardDescription>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">En planificación:</p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center space-x-2">
                  <FileText className="h-3 w-3 text-blue-500" />
                  <span>Reportes avanzados</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BarChart3 className="h-3 w-3 text-blue-500" />
                  <span>Análisis predictivo</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Users className="h-3 w-3 text-blue-500" />
                  <span>Gestión de usuarios</span>
                </li>
              </ul>
            </div>

            <div className="mt-4">
              <Button className="w-full" variant="outline" disabled>
                Próximamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
