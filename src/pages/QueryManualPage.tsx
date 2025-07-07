import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { databaseService } from '@/services/database';
import { moduleService, type PersistentModule } from '@/services/moduleService';
import { useToast } from '@/hooks/use-toast';

import { QueryEditor } from '@/components/query-manual/QueryEditor';
import { FilterPanel } from '@/components/query-manual/FilterPanel';
import { ModulesPanel } from '@/components/query-manual/ModulesPanel';
import { ResultsTable } from '@/components/query-manual/ResultsTable';
import { SaveModuleDialog } from '@/components/query-manual/SaveModuleDialog';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedModules, setSavedModules] = useState<PersistentModule[]>(moduleService.getAllModules());
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

  const [activeTab, setActiveTab] = useState<'query' | 'filters' | 'modules'>('query');

  useEffect(() => {
    if (location.state?.loadModule) {
      const module = location.state.loadModule as PersistentModule;
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
      moduleService.saveModule({
        name: moduleForm.name,
        description: moduleForm.description,
        query,
        filters
      });

      setSavedModules(moduleService.getAllModules());
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
    setFilters(module.filters || {});
    moduleService.updateModuleLastUsed(module.id);
    setSavedModules(moduleService.getAllModules());

    toast({
      title: "Módulo cargado",
      description: `Se cargó el módulo "${module.name}"`,
    });
  };

  const deleteModule = (moduleId: string) => {
    moduleService.deleteModule(moduleId);
    setSavedModules(moduleService.getAllModules());

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
            Ejecuta consultas SQL personalizadas y crea módulos reutilizables
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value: string) => setActiveTab(value as 'query' | 'filters' | 'modules')}
        className="space-y-4"
      >

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
