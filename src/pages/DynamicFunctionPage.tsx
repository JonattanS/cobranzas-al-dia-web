
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { moduleService, type PersistentModule } from '@/services/moduleService';
import { FilterPanel } from '@/components/query-manual/FilterPanel';
import { ResultsTable } from '@/components/query-manual/ResultsTable';
import { databaseService } from '@/services/database';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DynamicFunctionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [module, setModule] = useState<PersistentModule | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    ter_nit: '',
    fecha_desde: '',
    fecha_hasta: '',
    clc_cod: '',
    min_valor: '',
    max_valor: ''
  });

  useEffect(() => {
    if (id) {
      const foundModule = moduleService.getModuleById(id);
      if (foundModule) {
        setModule(foundModule);
        setFilters(foundModule.filters || filters);
        executeQuery(foundModule);
        moduleService.updateModuleLastUsed(id);
      } else {
        toast({
          title: "Módulo no encontrado",
          description: "El módulo solicitado no existe",
          variant: "destructive",
        });
        navigate('/');
      }
    }
  }, [id, navigate, toast]);

  const executeQuery = async (moduleToExecute: PersistentModule) => {
    if (!databaseService.isConfigured()) {
      toast({
        title: "Base de datos no configurada",
        description: "Configura la conexión a la base de datos primero",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await databaseService.executeCustomQuery(moduleToExecute.query);
      setResults(result);
      setFilteredResults(result);

      toast({
        title: "Consulta ejecutada",
        description: `Se obtuvieron ${result.length} registros`,
      });
    } catch (err) {
      const errorMessage = (err as Error).message;
      toast({
        title: "Error ejecutando consulta",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = results;

    if (filters.ter_nit) {
      filtered = filtered.filter(r => r.ter_nit?.toString().includes(filters.ter_nit));
    }
    if (filters.fecha_desde) {
      filtered = filtered.filter(r => r.doc_fec >= filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      filtered = filtered.filter(r => r.doc_fec <= filters.fecha_hasta);
    }
    if (filters.clc_cod) {
      filtered = filtered.filter(r => r.clc_cod === filters.clc_cod);
    }
    if (filters.min_valor) {
      filtered = filtered.filter(r => Math.abs(r.mov_val) >= Number(filters.min_valor));
    }
    if (filters.max_valor) {
      filtered = filtered.filter(r => Math.abs(r.mov_val) <= Number(filters.max_valor));
    }

    setFilteredResults(filtered);

    toast({
      title: "Filtros aplicados",
      description: `Se encontraron ${filtered.length} registros`,
    });
  };

  if (!module) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Cargando módulo...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{module.name}</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {module.description}
          </p>
        </div>
      </div>

      {/* Dashboard Ejecutivo Placeholder */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Dashboard Ejecutivo</span>
          </CardTitle>
          <CardDescription>
            Vista de KPIs y gráficos para {module.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Dashboard ejecutivo disponible próximamente.
            Los datos se cargarán automáticamente desde la consulta.
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Ejecutando consulta...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onApplyFilters={applyFilters}
          />
          <ResultsTable results={filteredResults} />
        </div>
      )}
    </div>
  );
};

export default DynamicFunctionPage;
