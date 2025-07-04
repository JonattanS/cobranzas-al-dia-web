
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Play, Trash2 } from 'lucide-react';
import { type SavedModule } from '@/services/database';

interface ModulesPanelProps {
  savedModules: SavedModule[];
  onLoadModule: (module: SavedModule) => void;
  onDeleteModule: (moduleId: string) => void;
}

export const ModulesPanel = ({ savedModules, onLoadModule, onDeleteModule }: ModulesPanelProps) => {
  return (
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
                      onClick={() => onLoadModule(module)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Cargar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => onDeleteModule(module.id)}
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
  );
};
