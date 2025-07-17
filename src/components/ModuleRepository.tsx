
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FolderOpen, 
  Folder, 
  Plus, 
  Search, 
  Zap, 
  Database, 
  Play, 
  Trash2, 
  Shield,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { moduleService, type PersistentModule, type ModuleFolder } from '@/services/moduleService';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ModuleRepositoryProps {
  onClose: () => void;
}

export const ModuleRepository = ({ onClose }: ModuleRepositoryProps) => {
  const [modules, setModules] = useState<PersistentModule[]>([]);
  const [folders, setFolders] = useState<ModuleFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [moduleToPromote, setModuleToPromote] = useState<PersistentModule | null>(null);
  const [selectedFolderForPromotion, setSelectedFolderForPromotion] = useState<string>('');
  
  const { canCreateMainFunctions, canDeleteMainFunctions } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setModules(moduleService.getAllModules());
    setFolders(moduleService.getAllFolders());
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || module.folderId === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      moduleService.createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowCreateFolder(false);
      loadData();
      toast({
        title: "Carpeta creada",
        description: `La carpeta "${newFolderName}" se creó correctamente`,
      });
    }
  };

  const handlePromoteModule = (module: PersistentModule) => {
    if (!canCreateMainFunctions()) {
      toast({
        title: "Permisos insuficientes",
        description: "Solo los administradores pueden crear funciones principales",
        variant: "destructive",
      });
      return;
    }

    setModuleToPromote(module);
    setSelectedFolderForPromotion(module.folderId || 'default-folder');
    setShowPromoteDialog(true);
  };

  const confirmPromoteModule = () => {
    if (!moduleToPromote) return;

    const success = moduleService.promoteToMainFunction(moduleToPromote.id, selectedFolderForPromotion);
    if (success) {
      setShowPromoteDialog(false);
      setModuleToPromote(null);
      loadData();
      
      toast({
        title: "Función principal creada",
        description: `${moduleToPromote.name} ahora es una función principal`,
      });
      
      setTimeout(() => {
        navigate(`/dynamic-function/${moduleToPromote.id}`);
      }, 500);
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module?.isMainFunction && !canDeleteMainFunctions()) {
      toast({
        title: "Permisos insuficientes",
        description: "Solo los administradores pueden eliminar funciones principales",
        variant: "destructive",
      });
      return;
    }

    moduleService.deleteModule(moduleId);
    loadData();
    toast({
      title: "Módulo eliminado",
      description: "El módulo se eliminó correctamente",
    });
  };

  const handleModuleClick = (module: PersistentModule) => {
    moduleService.updateModuleLastUsed(module.id);
    
    if (module.isMainFunction) {
      navigate(`/dynamic-function/${module.id}`);
    } else {
      navigate('/query-manual', { state: { loadModule: module } });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              Portafolios 
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Gestiona todos tus módulos y funciones principales
            </p>
          </div>
        </div>
      </div>

      {/* Controles de filtrado y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar módulos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar carpeta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las carpetas</SelectItem>
              {folders.map(folder => (
                <SelectItem key={folder.id} value={folder.id}>
                  <div className="flex items-center space-x-2">
                    <Folder className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear Carpeta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Carpeta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nombre de la carpeta"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateFolder}>
                    Crear
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de módulos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredModules.map((module) => (
          <Card key={module.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    module.isMainFunction 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {module.isMainFunction ? <Zap className="h-4 w-4" /> : <Database className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={module.isMainFunction ? "default" : "secondary"}>
                        {module.isMainFunction ? 'Función Principal' : 'Módulo Personal'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm mb-4">
                {module.description || 'Sin descripción'}
              </CardDescription>
              
              <div className="space-y-2 text-xs text-slate-500">
                <p>Carpeta: {folders.find(f => f.id === module.folderId)?.name || 'General'}</p>
                <p>Usos: {module.usageCount || 0}</p>
                <p>Último uso: {new Date(module.lastUsed).toLocaleDateString()}</p>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleModuleClick(module)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Ejecutar
                </Button>
                
                {!module.isMainFunction && canCreateMainFunctions() && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handlePromoteModule(module)}
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleDeleteModule(module.id)}
                  disabled={module.isMainFunction && !canDeleteMainFunctions()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">
            No se encontraron módulos
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer módulo desde Query Manual'}
          </p>
        </div>
      )}

      {/* Dialog para promover módulo */}
      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Función Principal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ¿En qué carpeta deseas guardar la función principal "{moduleToPromote?.name}"?
            </p>
            
            <Select value={selectedFolderForPromotion} onValueChange={setSelectedFolderForPromotion}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar carpeta" />
              </SelectTrigger>
              <SelectContent>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center space-x-2">
                      <Folder className="h-4 w-4" />
                      <span>{folder.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPromoteDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmPromoteModule}>
                Crear Función Principal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
