
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { DashboardConfigDialog } from '@/components/dashboard-config/DashboardConfigDialog';
import { Settings } from 'lucide-react';
import { schemaService } from '@/services/schemaService';

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

  const handleSave = () => {
    onSave(dashboardConfig);
  };

  const handleDashboardConfigSave = (config: any) => {
    setDashboardConfig(config);
    setShowDashboardConfig(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guardar Módulo</DialogTitle>
            <DialogDescription>
              Configura los detalles de tu módulo personalizado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Dashboard del Módulo</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Configura los gráficos y KPIs que se mostrarán
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowDashboardConfig(true)}
                  disabled={availableFields.length === 0}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
              {dashboardConfig.charts.length > 0 || dashboardConfig.kpis.length > 0 ? (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  ✓ Dashboard configurado ({dashboardConfig.charts.length} gráficos, {dashboardConfig.kpis.length} KPIs)
                </p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                  Dashboard predeterminado (se puede configurar después)
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
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
        availableFields={availableFields.length > 0 ? availableFields : schemaService.getTableColumns().map(col => col.name)}
      />
    </>
  );
};
