
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BarChart, PieChart, TrendingUp, Table, Plus, X, Save } from 'lucide-react';
import { schemaService } from '@/services/schemaService';

interface ChartConfig {
  id: string;
  type: 'pie' | 'bar' | 'line' | 'kpi' | 'table';
  title: string;
  field: string;
  aggregation?: 'count' | 'sum' | 'avg' | 'max' | 'min';
  limit?: number;
  groupBy?: string;
}

interface DashboardConfig {
  charts: ChartConfig[];
  kpis: ChartConfig[];
}

interface DashboardConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: DashboardConfig;
  onSave: (config: DashboardConfig) => void;
  availableFields: string[];
}

export const DashboardConfigDialog = ({
  isOpen,
  onClose,
  config,
  onSave,
  availableFields
}: DashboardConfigDialogProps) => {
  const [currentConfig, setCurrentConfig] = useState<DashboardConfig>(config);
  const columns = schemaService.getTableColumns();

  useEffect(() => {
    setCurrentConfig(config);
  }, [config]);

  const addChart = () => {
    const newChart: ChartConfig = {
      id: `chart-${Date.now()}`,
      type: 'bar',
      title: 'Nueva Gráfica',
      field: '',
      aggregation: 'count'
    };
    
    setCurrentConfig(prev => ({
      ...prev,
      charts: [...prev.charts, newChart]
    }));
  };

  const addKPI = () => {
    const newKPI: ChartConfig = {
      id: `kpi-${Date.now()}`,
      type: 'kpi',
      title: 'Nuevo KPI',
      field: '',
      aggregation: 'count'
    };
    
    setCurrentConfig(prev => ({
      ...prev,
      kpis: [...prev.kpis, newKPI]
    }));
  };

  const updateChart = (id: string, updates: Partial<ChartConfig>) => {
    setCurrentConfig(prev => ({
      ...prev,
      charts: prev.charts.map(chart => 
        chart.id === id ? { ...chart, ...updates } : chart
      )
    }));
  };

  const updateKPI = (id: string, updates: Partial<ChartConfig>) => {
    setCurrentConfig(prev => ({
      ...prev,
      kpis: prev.kpis.map(kpi => 
        kpi.id === id ? { ...kpi, ...updates } : kpi
      )
    }));
  };

  const removeChart = (id: string) => {
    setCurrentConfig(prev => ({
      ...prev,
      charts: prev.charts.filter(chart => chart.id !== id)
    }));
  };

  const removeKPI = (id: string) => {
    setCurrentConfig(prev => ({
      ...prev,
      kpis: prev.kpis.filter(kpi => kpi.id !== id)
    }));
  };

  const handleSave = () => {
    onSave(currentConfig);
    onClose();
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'pie': return <PieChart className="h-4 w-4" />;
      case 'bar': return <BarChart className="h-4 w-4" />;
      case 'line': return <TrendingUp className="h-4 w-4" />;
      case 'table': return <Table className="h-4 w-4" />;
      default: return <BarChart className="h-4 w-4" />;
    }
  };

  const getColumnType = (fieldName: string) => {
    const column = columns.find(col => col.name === fieldName);
    return column ? (column.isNumeric ? 'numeric' : column.isDate ? 'date' : 'text') : 'text';
  };

  const getAvailableAggregations = (fieldName: string) => {
    const columnType = getColumnType(fieldName);
    if (columnType === 'numeric') {
      return [
        { value: 'count', label: 'Contar' },
        { value: 'sum', label: 'Sumar' },
        { value: 'avg', label: 'Promedio' },
        { value: 'max', label: 'Máximo' },
        { value: 'min', label: 'Mínimo' }
      ];
    }
    return [{ value: 'count', label: 'Contar' }];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Dashboard</DialogTitle>
          <DialogDescription>
            Personaliza los gráficos y KPIs que se mostrarán en el dashboard de este módulo
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charts">Gráficos ({currentConfig.charts.length})</TabsTrigger>
            <TabsTrigger value="kpis">KPIs ({currentConfig.kpis.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Gráficos</h3>
              <Button onClick={addChart}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Gráfico
              </Button>
            </div>

            <div className="grid gap-4">
              {currentConfig.charts.map((chart) => (
                <Card key={chart.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getChartIcon(chart.type)}
                        <CardTitle className="text-base">{chart.title || 'Sin título'}</CardTitle>
                        <Badge variant="outline">{chart.type}</Badge>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => removeChart(chart.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={chart.title}
                        onChange={(e) => updateChart(chart.id, { title: e.target.value })}
                        placeholder="Título del gráfico"
                      />
                    </div>

                    <div>
                      <Label>Tipo de Gráfico</Label>
                      <Select value={chart.type} onValueChange={(value) => updateChart(chart.id, { type: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Barras</SelectItem>
                          <SelectItem value="pie">Pastel</SelectItem>
                          <SelectItem value="line">Líneas</SelectItem>
                          <SelectItem value="table">Tabla</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Campo Principal</Label>
                      <Select value={chart.field} onValueChange={(value) => updateChart(chart.id, { field: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar campo" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map(field => (
                            <SelectItem key={field} value={field}>
                              {field}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Agregación</Label>
                      <Select 
                        value={chart.aggregation} 
                        onValueChange={(value) => updateChart(chart.id, { aggregation: value as any })}
                        disabled={!chart.field}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de agregación" />
                        </SelectTrigger>
                        <SelectContent>
                          {chart.field && getAvailableAggregations(chart.field).map(agg => (
                            <SelectItem key={agg.value} value={agg.value}>
                              {agg.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {(chart.type === 'bar' || chart.type === 'pie') && (
                      <div>
                        <Label>Agrupar por</Label>
                        <Select value={chart.groupBy || ''} onValueChange={(value) => updateChart(chart.id, { groupBy: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Campo de agrupación" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFields.filter(field => field !== chart.field).map(field => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label>Límite de Registros</Label>
                      <Input
                        type="number"
                        value={chart.limit || ''}
                        onChange={(e) => updateChart(chart.id, { limit: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="Ej: 10"
                        min="1"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {currentConfig.charts.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <BarChart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">
                      Sin gráficos configurados
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                      Agrega gráficos para visualizar tus datos
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="kpis" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">KPIs</h3>
              <Button onClick={addKPI}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar KPI
              </Button>
            </div>

            <div className="grid gap-4">
              {currentConfig.kpis.map((kpi) => (
                <Card key={kpi.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <CardTitle className="text-base">{kpi.title || 'Sin título'}</CardTitle>
                        <Badge variant="outline">KPI</Badge>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => removeKPI(kpi.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Título del KPI</Label>
                      <Input
                        value={kpi.title}
                        onChange={(e) => updateKPI(kpi.id, { title: e.target.value })}
                        placeholder="Título del KPI"
                      />
                    </div>

                    <div>
                      <Label>Campo</Label>
                      <Select value={kpi.field} onValueChange={(value) => updateKPI(kpi.id, { field: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar campo" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map(field => (
                            <SelectItem key={field} value={field}>
                              {field}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Cálculo</Label>
                      <Select 
                        value={kpi.aggregation} 
                        onValueChange={(value) => updateKPI(kpi.id, { aggregation: value as any })}
                        disabled={!kpi.field}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de cálculo" />
                        </SelectTrigger>
                        <SelectContent>
                          {kpi.field && getAvailableAggregations(kpi.field).map(agg => (
                            <SelectItem key={agg.value} value={agg.value}>
                              {agg.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {currentConfig.kpis.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">
                      Sin KPIs configurados
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                      Agrega KPIs para mostrar métricas importantes
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
