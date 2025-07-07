
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Play, Trash2, Zap, Shield } from 'lucide-react';
import { moduleService, type PersistentModule } from '@/services/moduleService';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ModulesPanelProps {
  savedModules: PersistentModule[];
  onLoadModule: (module: PersistentModule) => void;
  onDeleteModule: (moduleId: string) => void;
  onModulePromoted?: () => void;
}

export const ModulesPanel = ({ savedModules, onLoadModule, onDeleteModule, onModulePromoted }: ModulesPanelProps) => {
  const { canCreateMainFunctions } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePromoteToMainFunction = (module: PersistentModule) => {
    if (!canCreateMainFunctions()) {
      toast({
        title: "Permisos insuficientes",
        description: "Solo los administradores pueden crear funciones principales",
        variant: "destructive",
      });
      return;
    }

    console.log('Promoviendo módulo a función principal:', module.name);
    
    const success = moduleService.promoteToMainFunction(module.id);
    if (success) {
      toast({
        title: "Función principal creada",
        description: `${module.name} ahora es una función principal y aparecerá en el menú lateral`,
      });
      
      // Notificar al componente padre para actualizar la lista
      if (onModulePromoted) {
        onModulePromoted();
      }
      
      // Navegar a la nueva función principal
      navigate(`/dynamic-function/${module.id}`);
    } else {
      toast({
        title: "Error",
        description: "No se pudo crear la función principal",
        variant: "destructive",
      });
    }
  };

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
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No tienes módulos guardados aún. Crea tu primer módulo desde el editor SQL.
          </div>
        ) : (
          <div className="space-y-4">
            {savedModules.map((module) => (
              <div key={module.id} className="border rounded-lg p-4 space-y-2 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{module.name}</h3>
                      {module.isMainFunction && (
                        <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>Función Principal</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{module.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
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
                    
                    {!module.isMainFunction && canCreateMainFunctions() && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePromoteToMainFunction(module)}
                        className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300"
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Grabar como Función Principal
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => onDeleteModule(module.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-xs font-mono">
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
