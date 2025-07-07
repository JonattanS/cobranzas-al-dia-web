
// Servicio para gestionar módulos persistentes en el código fuente
export interface PersistentModule {
  id: string;
  name: string;
  description: string;
  query: string;
  filters: Record<string, any>;
  createdAt: string;
  lastUsed: string;
  isMainFunction?: boolean;
  dashboardConfig?: {
    charts: any[];
    kpis: any[];
  };
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
    lastUsed: '2025-01-07T00:00:00.000Z'
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
    lastUsed: '2025-01-07T00:00:00.000Z'
  }
];

class ModuleService {
  private modules: PersistentModule[] = [...PERSISTENT_MODULES];

  getAllModules(): PersistentModule[] {
    return this.modules;
  }

  getModuleById(id: string): PersistentModule | undefined {
    return this.modules.find(m => m.id === id);
  }

  saveModule(module: Omit<PersistentModule, 'id' | 'createdAt' | 'lastUsed'>): PersistentModule {
    const newModule: PersistentModule = {
      ...module,
      id: `module-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    this.modules.push(newModule);
    return newModule;
  }

  updateModuleLastUsed(id: string): void {
    const module = this.modules.find(m => m.id === id);
    if (module) {
      module.lastUsed = new Date().toISOString();
    }
  }

  promoteToMainFunction(id: string): boolean {
    const module = this.modules.find(m => m.id === id);
    if (module) {
      module.isMainFunction = true;
      return true;
    }
    return false;
  }

  getMainFunctions(): PersistentModule[] {
    return this.modules.filter(m => m.isMainFunction);
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
}

export const moduleService = new ModuleService();
