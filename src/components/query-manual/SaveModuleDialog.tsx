
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { DashboardConfigDialog } from '@/components/dashboard-config/DashboardConfigDialog';
import { Settings, Eye } from 'lucide-react';

interface SaveModuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  moduleForm: { name: string; description: string };
  setModuleForm: (form: { name: string; description: string }) => void;
  onSave: (dashboardConfig?: any) => void;
  availableFields?: string[];
}

export const SaveModuleDialog = ({ 
  isOpen, 
  onClose, 
  moduleForm, 
  setModuleForm, 
  onSave, 
  availableFields = [] 
}: SaveModuleDialogProps) => {
  const [showDashboardConfig, setShowDashboardConfig] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState({ charts: [], kpis: [] });
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    onSave(dashboardConfig);
  };

  const handleDashboardConfigSave = (config: any) => {
    setDashboardConfig(config);
    setShowDashboardConfig(false);
  };

  const hasCharts = dashboardConfig.charts.length > 0;
  const hasKPIs = dashboardConfig.kpis.length > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Guardar Módulo y Configurar Dashboard</DialogTitle>
            <DialogDescription>
              Configura los detalles de tu módulo y personaliza su dashboard ejecutivo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Información básica del módulo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información del Módulo</h3>
              <div>
                <Label htmlFor="name">Nombre del módulo</Label>
                <Input
                  id="name"
                  value={moduleForm.name}
                  onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                  placeholder="Ej: Reporte de ventas"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Describe qué hace este módulo..."
                />
              </div>
            </div>
            
            {/* Configuración del Dashboard Ejecutivo */}
            <div className="border-t pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dashboard Ejecutivo</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Personaliza las visualizaciones que se mostrarán en el dashboard de este módulo
                </p>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <h4 className="font-medium">Configuración Visual</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Crea gráficos, KPIs y tablas personalizadas
                      </p>
                      {availableFields.length === 0 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Ejecuta primero una consulta para habilitar la configuración del dashboard
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowDashboardConfig(true)}
                      disabled={availableFields.length === 0}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {hasCharts || hasKPIs ? 'Editar Dashboard' : 'Configurar Dashboard'}
                    </Button>
                  </div>
                  
                  {(hasCharts || hasKPIs) && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            ✓ Dashboard configurado
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {dashboardConfig.charts.length} gráficos, {dashboardConfig.kpis.length} KPIs
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPreview(true)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Vista Previa
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {!hasCharts && !hasKPIs && availableFields.length > 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      Dashboard predeterminado (se puede configurar ahora)
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Guardar Módulo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DashboardConfigDialog
        isOpen={showDashboardConfig}
        onClose={() => setShowDashboardConfig(false)}
        config={dashboardConfig}
        onSave={handleDashboardConfigSave}
        availableFields={availableFields}
      />
      
      {/* Vista previa del dashboard */}
      {showPreview && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vista Previa del Dashboard</DialogTitle>
              <DialogDescription>
                Así se verá tu dashboard ejecutivo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {dashboardConfig.kpis.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Indicadores (KPIs)</h4>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {dashboardConfig.kpis.map((kpi: any) => (
                      <div key={kpi.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <h5 className="font-medium">{kpi.title}</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {kpi.aggregation} de {kpi.field}
                        </p>
                        <div className="text-2xl font-bold text-primary mt-2">
                          {kpi.aggregation === 'count' ? '1,234' : '₡1,234,567'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {dashboardConfig.charts.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Gráficos</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {dashboardConfig.charts.map((chart: any) => (
                      <div key={chart.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <h5 className="font-medium mb-2">{chart.title}</h5>
                        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {chart.type === 'pie' ? 'Gráfico de Pastel' : 
                             chart.type === 'bar' ? 'Gráfico de Barras' :
                             chart.type === 'line' ? 'Gráfico de Líneas' : 'Tabla'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
