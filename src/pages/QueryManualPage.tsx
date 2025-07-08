import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { databaseService } from '@/services/database';
import { moduleService, type PersistentModule } from '@/services/moduleService';
import { schemaService, type QueryConfiguration } from '@/services/schemaService';
import { useToast } from '@/hooks/use-toast';

import { QueryEditor } from '@/components/query-manual/QueryEditor';
import { FilterPanel } from '@/components/query-manual/FilterPanel';
import { ModulesPanel } from '@/components/query-manual/ModulesPanel';
import { ResultsTable } from '@/components/query-manual/ResultsTable';
import { SaveModuleDialog } from '@/components/query-manual/SaveModuleDialog';
import { QueryBuilder } from '@/components/query-builder/QueryBuilder';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const QueryManualPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [queryConfig, setQueryConfig] = useState<QueryConfiguration>({
    selectedFields: [],
    conditions: [],
    orderBy: [],
    groupBy: []
  });

  const [results, setResults] = useState<any[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedModules, setSavedModules] = useState<PersistentModule[]>([]);
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

  const [activeTab, setActiveTab] = useState<'visual' | 'sql' | 'filters' | 'modules'>('visual');

  // Obtener campos disponibles de la tabla
  const availableFields = schemaService.getTableColumns().map(col => col.name);

  const updateModules = () => {
    setSavedModules(moduleService.getAllModules().filter(m => !m.isMainFunction));
  };

  useEffect(() => {
    updateModules();
  }, []);

  useEffect(() => {
    if (location.state?.loadModule) {
      const module = location.state.loadModule as PersistentModule;
      loadModule(module);
      navigate('/query-manual', { replace: true });
    }
  }, [location.state, navigate]);

  const handleQueryGenerated = (sql: string, config: QueryConfiguration) => {
    setQuery(sql);
    setQueryConfig(config);
  };

  const executeQuery = async () => {
    if (!databaseService.isConfigured()) {
      setError('Base de datos no configurada');
      return;
    }

    if (!query.trim()) {
      setError('No hay consulta para ejecutar');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await databaseService.executeCustomQuery(query);
      setResults(result);
      setFilteredResults(result);
      setActiveTab('filters');

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
      description: `Se filtraron ${filtered.length} registros`,
    });
  };

  const saveAsModule = (dashboardConfig?: any) => {
    if (!moduleForm.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del módulo es requerido",
        variant: "destructive",
      });
      return;
    }

    try {
      moduleService.saveModule({
        name: moduleForm.name,
        description: moduleForm.description,
        query,
        filters: queryConfig,
        folderId: 'default-folder',
        dashboardConfig: dashboardConfig || { charts: [], kpis: [] }
      });

      updateModules();
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

  const loadModule = (module: PersistentModule) => {
    setQuery(module.query);
    
    // Si el módulo tiene configuración de query builder, cargarla
    if (module.filters && typeof module.filters === 'object' && 'selectedFields' in module.filters) {
      setQueryConfig(module.filters as QueryConfiguration);
    } else {
      // Configuración legacy de filtros
      const moduleFilters = module.filters || {};
      const safeFilters = {
        ter_nit: (moduleFilters.ter_nit as string) || '',
        fecha_desde: (moduleFilters.fecha_desde as string) || '',
        fecha_hasta: (moduleFilters.fecha_hasta as string) || '',
        clc_cod: (moduleFilters.clc_cod as string) || '',
        min_valor: (moduleFilters.min_valor as string) || '',
        max_valor: (moduleFilters.max_valor as string) || ''
      };
      setFilters(safeFilters);
    }
    
    moduleService.updateModuleLastUsed(module.id);
    updateModules();

    toast({
      title: "Módulo cargado",
      description: `Se cargó el módulo "${module.name}"`,
    });
  };

  const deleteModule = (moduleId: string) => {
    const module = savedModules.find(m => m.id === moduleId);
    if (module?.isMainFunction) {
      toast({
        title: "Error",
        description: "No se puede eliminar una función principal desde aquí",
        variant: "destructive",
      });
      return;
    }

    moduleService.deleteModule(moduleId);
    updateModules();

    toast({
      title: "Módulo eliminado",
      description: "El módulo se eliminó correctamente",
    });
  };

  const exportResults = () => {
    if (filteredResults.length === 0) return;

    const csv = [
      Object.keys(filteredResults[0]).join(','),
      ...filteredResults.map(row => Object.values(row).join(','))
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

  const exportPDF = () => {
    if (filteredResults.length === 0) return;

    const doc = new jsPDF();
    const columns = Object.keys(filteredResults[0]);
    const rows = filteredResults.map(row => columns.map(col => row[col] ?? ''));

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      margin: { horizontal: 10 },
      styles: { fontSize: 8 }
    });

    doc.save(`query_results_${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: "Datos exportados",
      description: "Los resultados se exportaron a PDF",
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
          <p className="text-slate-600 dark:text-slate-400">
            Construye consultas visualmente o ejecuta SQL personalizado
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value: string) => setActiveTab(value as 'visual' | 'sql' | 'filters' | 'modules')}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="visual">Constructor Visual</TabsTrigger>
          <TabsTrigger value="sql">Editor SQL</TabsTrigger>
          <TabsTrigger value="filters">Filtros y Resultados</TabsTrigger>
          <TabsTrigger value="modules">Módulos Guardados ({savedModules.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          <QueryBuilder
            onQueryGenerated={handleQueryGenerated}
            initialConfig={queryConfig}
          />
          <div className="flex gap-2">
            <Button onClick={executeQuery} disabled={isLoading || !query.trim()}>
              {isLoading ? 'Ejecutando...' : 'Ejecutar Consulta'}
            </Button>
            <Button variant="outline" disabled={!query.trim()} onClick={() => setShowSaveDialog(true)}>
              Guardar como Módulo
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="sql" className="space-y-4">
          <QueryEditor
            query={query}
            setQuery={setQuery}
            executeQuery={executeQuery}
            isLoading={isLoading}
            error={error}
            onSaveModule={() => setShowSaveDialog(true)}
            hasResults={results.length > 0}
            resultsCount={results.length}
          />
        </TabsContent>

        <TabsContent value="filters">
          <div className="flex gap-2 mb-4">
            <Button onClick={exportResults} disabled={filteredResults.length === 0}>
              Exportar CSV
            </Button>
            <Button onClick={exportPDF} disabled={filteredResults.length === 0}>
              Exportar PDF
            </Button>
          </div>
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onApplyFilters={applyFilters}
          />
          <ResultsTable results={filteredResults} />
        </TabsContent>

        <TabsContent value="modules">
          <ModulesPanel
            savedModules={savedModules}
            onLoadModule={loadModule}
            onDeleteModule={deleteModule}
            onModulesUpdate={updateModules}
          />
        </TabsContent>
      </Tabs>

      <SaveModuleDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        moduleForm={moduleForm}
        setModuleForm={setModuleForm}
        onSave={saveAsModule}
        availableFields={availableFields}
      />
    </div>
  );
};

export default QueryManualPage;
