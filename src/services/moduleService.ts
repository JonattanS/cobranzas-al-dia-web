
// Servicio para gestionar módulos persistentes en el código fuente
export interface PersistentModule {
  id: string;
  name: string;
  description: string;
  query: string;
  filters: Record<string, any>;
  createdAt: string;
  lastUsed: string;
  usageCount: number;
  isMainFunction?: boolean;
  folderId?: string;
  dashboardConfig?: {
    charts: any[];
    kpis: any[];
  };
}

export interface ModuleFolder {
  id: string;
  name: string;
  createdAt: string;
  parentId?: string;
}

// Módulos hardcodeados en el sistema - estos persisten entre reinicios
const PERSISTENT_MODULES: PersistentModule[] = [
  {
    id: 'cuentas-cobrar-detallado',
    name: 'Cuentas por Cobrar Detallado',
    description: 'Consulta detallada de cuentas por cobrar con filtros avanzados',
    query: `SELECT 
      ter_nit,
      ter_raz,
      doc_fec,
      doc_num,
      mov_val,
      clc_cod
    FROM public.con_mov 
    WHERE anf_cla = 1 AND anf_cre = 1 
    ORDER BY doc_fec DESC`,
    filters: {},
    createdAt: '2025-01-07T00:00:00.000Z',
    lastUsed: '2025-01-07T00:00:00.000Z',
    usageCount: 5,
    isMainFunction: true
  },
  {
    id: 'resumen-terceros',
    name: 'Resumen por Terceros',
    description: 'Agrupación de saldos por tercero',
    query: `SELECT
      ter_nit,
      ter_raz,
      SUM(mov_val) AS saldo_total,
      COUNT(*) AS num_documentos
    FROM public.con_mov
    WHERE anf_cla = 1 AND anf_cre = 1
    GROUP BY ter_nit, ter_raz
    HAVING SUM(mov_val) > 0
    ORDER BY saldo_total DESC`,
    filters: {},
    createdAt: '2025-01-07T00:00:00.000Z',
    lastUsed: '2025-01-07T00:00:00.000Z',
    usageCount: 3,
    isMainFunction: true
  }
];

const DEFAULT_FOLDERS: ModuleFolder[] = [
  {
    id: 'default-folder',
    name: 'General',
    createdAt: '2025-01-07T00:00:00.000Z'
  }
];

class ModuleService {
  private modules: PersistentModule[] = [...PERSISTENT_MODULES];
  private folders: ModuleFolder[] = [...DEFAULT_FOLDERS];

  getAllModules(): PersistentModule[] {
    return this.modules;
  }

  getModuleById(id: string): PersistentModule | undefined {
    return this.modules.find(m => m.id === id);
  }

  saveModule(module: Omit<PersistentModule, 'id' | 'createdAt' | 'lastUsed' | 'usageCount'>): PersistentModule {
    const newModule: PersistentModule = {
      ...module,
      id: `module-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      usageCount: 0,
      folderId: module.folderId || 'default-folder'
    };
    
    this.modules.push(newModule);
    return newModule;
  }

  updateModuleLastUsed(id: string): void {
    const module = this.modules.find(m => m.id === id);
    if (module) {
      module.lastUsed = new Date().toISOString();
      module.usageCount = (module.usageCount || 0) + 1;
    }
  }

  promoteToMainFunction(id: string, folderId?: string): boolean {
    const module = this.modules.find(m => m.id === id);
    if (module) {
      module.isMainFunction = true;
      if (folderId) {
        module.folderId = folderId;
      }
      return true;
    }
    return false;
  }

  getMainFunctions(): PersistentModule[] {
    return this.modules.filter(m => m.isMainFunction);
  }

  getMostUsedMainFunctions(limit: number = 6): PersistentModule[] {
    return this.modules
      .filter(m => m.isMainFunction)
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, limit);
  }

  deleteModule(id: string): boolean {
    const index = this.modules.findIndex(m => m.id === id);
    if (index !== -1) {
      this.modules.splice(index, 1);
      return true;
    }
    return false;
  }

  updateDashboardConfig(id: string, dashboardConfig: PersistentModule['dashboardConfig']): boolean {
    const module = this.modules.find(m => m.id === id);
    if (module) {
      module.dashboardConfig = dashboardConfig;
      return true;
    }
    return false;
  }

  // Folder management
  getAllFolders(): ModuleFolder[] {
    return this.folders;
  }

  createFolder(name: string, parentId?: string): ModuleFolder {
    const newFolder: ModuleFolder = {
      id: `folder-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      parentId
    };
    
    this.folders.push(newFolder);
    return newFolder;
  }

  deleteFolder(id: string): boolean {
    const index = this.folders.findIndex(f => f.id === id);
    if (index !== -1) {
      // Move modules from deleted folder to default folder
      this.modules.forEach(module => {
        if (module.folderId === id) {
          module.folderId = 'default-folder';
        }
      });
      
      this.folders.splice(index, 1);
      return true;
    }
    return false;
  }

  getModulesByFolder(folderId: string): PersistentModule[] {
    return this.modules.filter(m => m.folderId === folderId);
  }

  moveModule(moduleId: string, folderId: string): boolean {
    const module = this.modules.find(m => m.id === moduleId);
    if (module) {
      module.folderId = folderId;
      return true;
    }
    return false;
  }
}

export const moduleService = new ModuleService();
