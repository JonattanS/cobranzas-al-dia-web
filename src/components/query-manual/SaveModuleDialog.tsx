
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface SaveModuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  moduleForm: { name: string; description: string };
  setModuleForm: (form: { name: string; description: string }) => void;
  onSave: () => void;
}

export const SaveModuleDialog = ({ 
  isOpen, 
  onClose, 
  moduleForm, 
  setModuleForm, 
  onSave 
}: SaveModuleDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Módulo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
