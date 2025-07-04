
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { databaseService, type SavedModule } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

import { QueryEditor } from '@/components/query-manual/QueryEditor';
import { FilterPanel } from '@/components/query-manual/FilterPanel';
import { ModulesPanel } from '@/components/query-manual/ModulesPanel';
import { ResultsTable } from '@/components/query-manual/ResultsTable';
import { SaveModuleDialog } from '@/components/query-manual/SaveModuleDialog';

const QueryManualPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  
  const [query, setQuery] = useState(`SELECT
  ter_nit,
  ter_raz,
  SUM(mov_val) AS saldo_por_cobrar
FROM
  public.con_mov
WHERE
  anf_cla = 1
  AND anf_cre = 1
GROUP BY
  ter_nit, ter_raz
ORDER BY
  ter_raz;`);
  
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedModules, setSavedModules] = useState<SavedModule[]>(databaseService.getSavedModules());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [moduleForm, setModuleForm] = useState({ name: '', description: '' });
  
  const [filters, setFilters] = useState({
    ter_nit: '',
    fecha_desde: '',
    fecha_hasta: '',
    clc_cod: '',
    min_valor: '',
    max_valor: ''
  });

  useEffect(() => {
    if (location.state?.loadModule) {
      const module = location.state.loadModule as SavedModule;
      loadModule(module);
      navigate('/query-manual', { replace: true });
    }
  }, [location.state, navigate]);

  const executeQuery = async () => {
    if (!databaseService.isConfigured()) {
      setError('Base de datos no configurada');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await databaseService.executeCustomQuery(query);
      setResults(result);
      
      toast({
        title: "Query ejecutado",
        description: `Se obtuvieron ${result.length} registros`,
      });
      
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      
      toast({
        title: "Error ejecutando query",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveAsModule = () => {
    if (!moduleForm.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del módulo es requerido",
        variant: "destructive",
      });
      return;
    }

    try {
      databaseService.saveModule({
        name: moduleForm.name,
        description: moduleForm.description,
        query,
        filters
      });

      setSavedModules(databaseService.getSavedModules());
      setShowSaveDialog(false);
      setModuleForm({ name: '', description: '' });

      toast({
        title: "Módulo guardado",
        description: `El módulo "${moduleForm.name}" se guardó correctamente`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo guardar el módulo",
        variant: "destructive",
      });
    }
  };

  const loadModule = (module: SavedModule) => {
    setQuery(module.query);
    setFilters(module.filters || {});
    databaseService.updateModuleLastUsed(module.id);
    setSavedModules(databaseService.getSavedModules());
    
    toast({
      title: "Módulo cargado",
      description: `Se cargó el módulo "${module.name}"`,
    });
  };

  const deleteModule = (moduleId: string) => {
    databaseService.deleteModule(moduleId);
    setSavedModules(databaseService.getSavedModules());
    
    toast({
      title: "Módulo eliminado",
      description: "El módulo se eliminó correctamente",
    });
  };

  const applyFilters = () => {
    let filteredQuery = query;
    const conditions = [];
    
    if (filters.ter_nit) {
      conditions.push(`ter_nit LIKE '%${filters.ter_nit}%'`);
    }
    
    if (filters.fecha_desde) {
      conditions.push(`doc_fec >= '${filters.fecha_desde}'`);
    }
    
    if (filters.fecha_hasta) {
      conditions.push(`doc_fec <= '${filters.fecha_hasta}'`);
    }
    
    if (filters.clc_cod) {
      conditions.push(`clc_cod = '${filters.clc_cod}'`);
    }
    
    if (filters.min_valor) {
      conditions.push(`ABS(mov_val) >= ${filters.min_valor}`);
    }
    
    if (filters.max_valor) {
      conditions.push(`ABS(mov_val) <= ${filters.max_valor}`);
    }
    
    if (conditions.length > 0) {
      if (filteredQuery.toUpperCase().includes('WHERE')) {
        filteredQuery += ` AND ${conditions.join(' AND ')}`;
      } else {
        filteredQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
    }
    
    setQuery(filteredQuery);
    
    toast({
      title: "Filtros aplicados",
      description: "Se aplicaron los filtros al query",
    });
  };

  const exportResults = () => {
    if (results.length === 0) return;
    
    const csv = [
      Object.keys(results[0]).join(','),
      ...results.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: "Datos exportados",
      description: "Los resultados se exportaron a CSV",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Query Manual</h1>
          <p className="text-muted-foreground">
            Ejecuta consultas SQL personalizadas y crea módulos reutilizables
          </p>
        </div>
      </div>

      <Tabs defaultValue="query" className="space-y-4">
        <TabsList>
          <TabsTrigger value="query">Editor SQL</TabsTrigger>
          <TabsTrigger value="filters">Filtros Dinámicos</TabsTrigger>
          <TabsTrigger value="modules">Módulos Guardados ({savedModules.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="query" className="space-y-4">
          <QueryEditor
            query={query}
            setQuery={setQuery}
            executeQuery={executeQuery}
            isLoading={isLoading}
            error={error}
            onSaveModule={() => setShowSaveDialog(true)}
            onExportResults={exportResults}
            hasResults={results.length > 0}
            resultsCount={results.length}
          />
          
          <ResultsTable results={results} />
        </TabsContent>
        
        <TabsContent value="filters">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onApplyFilters={applyFilters}
          />
        </TabsContent>

        <TabsContent value="modules">
          <ModulesPanel
            savedModules={savedModules}
            onLoadModule={loadModule}
            onDeleteModule={deleteModule}
          />
        </TabsContent>
      </Tabs>

      <SaveModuleDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        moduleForm={moduleForm}
        setModuleForm={setModuleForm}
        onSave={saveAsModule}
      />
    </div>
  );
};

export default QueryManualPage;
