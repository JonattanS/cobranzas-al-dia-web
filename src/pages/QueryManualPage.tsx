import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Play, Download, History, Filter, Save, Trash2, FolderOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { databaseService, type SavedModule } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

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
  }, [location.state, navigate, loadModule]);

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
      const moduleId = databaseService.saveModule({
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
    
    // Agregar filtros dinámicos al query
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
      // Buscar WHERE en el query y agregar condiciones
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Editor de Consultas SQL</span>
              </CardTitle>
              <CardDescription>
                Escribe tu consulta SQL para la tabla public.con_mov
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query">Consulta SQL</Label>
                <Textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SELECT * FROM public.con_mov WHERE..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button onClick={executeQuery} disabled={isLoading || !query.trim()}>
                  <Play className="h-4 w-4 mr-2" />
                  {isLoading ? 'Ejecutando...' : 'Ejecutar Query'}
                </Button>
                
                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={!query.trim()}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar como Módulo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Guardar Query como Módulo</DialogTitle>
                      <DialogDescription>
                        Crea un módulo reutilizable con este query y filtros
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="module-name">Nombre del Módulo</Label>
                        <Input
                          id="module-name"
                          value={moduleForm.name}
                          onChange={(e) => setModuleForm({...moduleForm, name: e.target.value})}
                          placeholder="Ej: Cuentas por Cobrar Detallado"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="module-description">Descripción</Label>
                        <Textarea
                          id="module-description"
                          value={moduleForm.description}
                          onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
                          placeholder="Describe qué hace este módulo..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={saveAsModule}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Módulo
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {results.length > 0 && (
                  <Button variant="outline" onClick={exportResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados ({results.length} registros)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(results[0]).map((key) => (
                          <th key={key} className="border border-gray-300 px-4 py-2 text-left font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                              {value?.toString() || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtros Dinámicos</span>
              </CardTitle>
              <CardDescription>
                Configura filtros que se aplicarán automáticamente a tu consulta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ter_nit">NIT Tercero</Label>
                  <Input
                    id="ter_nit"
                    value={filters.ter_nit}
                    onChange={(e) => setFilters({...filters, ter_nit: e.target.value})}
                    placeholder="900123456"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clc_cod">Código Clase</Label>
                  <Input
                    id="clc_cod"
                    value={filters.clc_cod}
                    onChange={(e) => setFilters({...filters, clc_cod: e.target.value})}
                    placeholder="FAC, REC, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fecha_desde">Fecha Desde</Label>
                  <Input
                    id="fecha_desde"
                    type="date"
                    value={filters.fecha_desde}
                    onChange={(e) => setFilters({...filters, fecha_desde: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fecha_hasta">Fecha Hasta</Label>
                  <Input
                    id="fecha_hasta"
                    type="date"
                    value={filters.fecha_hasta}
                    onChange={(e) => setFilters({...filters, fecha_hasta: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="min_valor">Valor Mínimo</Label>
                  <Input
                    id="min_valor"
                    type="number"
                    value={filters.min_valor}
                    onChange={(e) => setFilters({...filters, min_valor: e.target.value})}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_valor">Valor Máximo</Label>
                  <Input
                    id="max_valor"
                    type="number"
                    value={filters.max_valor}
                    onChange={(e) => setFilters({...filters, max_valor: e.target.value})}
                    placeholder="1000000"
                  />
                </div>
              </div>
              
              <Button onClick={applyFilters} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros al Query
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FolderOpen className="h-5 w-5" />
                <span>Módulos Guardados</span>
              </CardTitle>
              <CardDescription>
                Gestiona tus consultas guardadas como módulos reutilizables
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedModules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tienes módulos guardados aún. Crea tu primer módulo desde el editor SQL.
                </div>
              ) : (
                <div className="space-y-4">
                  {savedModules.map((module) => (
                    <div key={module.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{module.name}</h3>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Creado: {new Date(module.createdAt).toLocaleDateString()} | 
                            Último uso: {new Date(module.lastUsed).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => loadModule(module)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Cargar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => deleteModule(module.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        {module.query.substring(0, 100)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QueryManualPage;
