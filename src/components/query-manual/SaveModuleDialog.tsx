
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Filter, FileText } from 'lucide-react';
import { FilterConfigDialog } from './FilterConfigDialog';

interface FilterConfig {
  columnName: string;
  enabled: boolean;
}

interface SaveModuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  moduleForm: { name: string; description: string };
  setModuleForm: (form: { name: string; description: string }) => void;
  onSave: (dashboardConfig?: any, dynamicFilterConfig?: FilterConfig[]) => void;
  availableFields: string[];
  filterConfig?: FilterConfig[];
  setFilterConfig?: (config: FilterConfig[]) => void;
}

export const SaveModuleDialog = ({ 
  isOpen, 
  onClose, 
  moduleForm, 
  setModuleForm, 
  onSave, 
  availableFields,
  filterConfig = [],
  setFilterConfig
}: SaveModuleDialogProps) => {
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'filters'>('basic');

  const handleSave = () => {
    onSave(undefined, filterConfig);
  };

  const enabledFiltersCount = filterConfig.filter(f => f.enabled).length;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Save className="h-5 w-5" />
              <span>Guardar como Módulo</span>
            </DialogTitle>
            <DialogDescription>
              Configura los detalles del módulo y los filtros dinámicos que estarán disponibles
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'basic' | 'filters')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Información Básica</span>
              </TabsTrigger>
              <TabsTrigger value="filters" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filtros ({enabledFiltersCount})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Módulo *</Label>
                <Input
                  id="name"
                  value={moduleForm.name}
                  onChange={(e) => setModuleForm({...moduleForm, name: e.target.value})}
                  placeholder="Ej: Movimientos por Tercero"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
                  placeholder="Describe qué hace este módulo y para qué se usa..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Filtros Dinámicos
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                    Selecciona qué columnas estarán disponibles como filtros en este módulo. 
                    Los usuarios podrán filtrar los resultados usando estos campos.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {enabledFiltersCount} filtros configurados
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowFilterDialog(true)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Configurar Filtros
                    </Button>
                  </div>
                </div>

                {enabledFiltersCount > 0 && (
                  <div className="space-y-2">
                    <Label>Filtros Seleccionados:</Label>
                    <div className="flex flex-wrap gap-2">
                      {filterConfig
                        .filter(f => f.enabled)
                        .map(filter => (
                          <div 
                            key={filter.columnName}
                            className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm"
                          >
                            {filter.columnName}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!moduleForm.name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Módulo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {setFilterConfig && (
        <FilterConfigDialog
          isOpen={showFilterDialog}
          onClose={() => setShowFilterDialog(false)}
          selectedFilters={filterConfig}
          onFiltersChange={setFilterConfig}
        />
      )}
    </>
  );
};
