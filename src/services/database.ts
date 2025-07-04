
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

interface ConMovRecord {
  id: number;
  ter_nit: string;
  ter_raz: string;
  clc_cod: string;
  doc_num: number;
  doc_fec: string;
  cta_cod: string;
  cta_nom: string;
  mov_val: number;
  mov_val_ext: number;
  mov_obs: string;
  mov_det: string;
}

interface SavedModule {
  id: string;
  name: string;
  description: string;
  query: string;
  filters: any;
  createdAt: string;
  lastUsed: string;
}

class DatabaseService {
  private config: DatabaseConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    const savedConfig = localStorage.getItem('db_config');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
    }
  }

  saveConfig(config: DatabaseConfig) {
    this.config = config;
    localStorage.setItem('db_config', JSON.stringify(config));
  }

  getConfig(): DatabaseConfig | null {
    return this.config;
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  clearConfig() {
    this.config = null;
    localStorage.removeItem('db_config');
  }

  // Método para ejecutar queries personalizados - CONEXIÓN REAL
  async executeCustomQuery(query: string): Promise<any[]> {
    if (!this.isConfigured()) {
      throw new Error('Base de datos no configurada');
    }

    try {
      console.log('Ejecutando query en base de datos real:', query);
      console.log('Configuración DB:', this.config);

      // Aquí necesitarías un endpoint backend que maneje la conexión a PostgreSQL
      // Por ahora simularemos el comportamiento, pero deberías crear un backend
      const response = await fetch('/api/execute-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          config: this.config
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      return result.rows || [];
      
    } catch (error) {
      // Si la API no está disponible, mostramos un mensaje específico
      console.error('Error conectando con backend:', error);
      throw new Error('No se pudo conectar con el backend de base de datos. Necesitas configurar un servidor backend para ejecutar queries reales en PostgreSQL.');
    }
  }

  // Gestión de módulos guardados
  getSavedModules(): SavedModule[] {
    const saved = localStorage.getItem('saved_modules');
    return saved ? JSON.parse(saved) : [];
  }

  saveModule(module: Omit<SavedModule, 'id' | 'createdAt' | 'lastUsed'>): string {
    const modules = this.getSavedModules();
    const newModule: SavedModule = {
      ...module,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    modules.push(newModule);
    localStorage.setItem('saved_modules', JSON.stringify(modules));
    return newModule.id;
  }

  updateModuleLastUsed(moduleId: string) {
    const modules = this.getSavedModules();
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    if (moduleIndex !== -1) {
      modules[moduleIndex].lastUsed = new Date().toISOString();
      localStorage.setItem('saved_modules', JSON.stringify(modules));
    }
  }

  deleteModule(moduleId: string) {
    const modules = this.getSavedModules();
    const filtered = modules.filter(m => m.id !== moduleId);
    localStorage.setItem('saved_modules', JSON.stringify(filtered));
  }

  getModule(moduleId: string): SavedModule | null {
    const modules = this.getSavedModules();
    return modules.find(m => m.id === moduleId) || null;
  }

  // Simulación de consultas - En producción, estas llamarían a tu API backend
  async getClientes(): Promise<Array<{ter_nit: string, ter_raz: string, tot_val: number}>> {
    if (!this.isConfigured()) {
      throw new Error('Base de datos no configurada');
    }

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    // Aquí iría la llamada real a tu API backend
    console.log('Consultando clientes desde:', this.config);
    
    // Datos de ejemplo basados en tu estructura
    return [
      { ter_nit: '900123456', ter_raz: 'EMPRESA EJEMPLO S.A.S', tot_val: 15000000 },
      { ter_nit: '800987654', ter_raz: 'COMERCIAL DEMO LTDA', tot_val: 8500000 },
      { ter_nit: '700456789', ter_raz: 'INDUSTRIAS PRUEBA S.A.', tot_val: 22000000 }
    ];
  }

  async getDocumentosByCliente(ter_nit: string): Promise<ConMovRecord[]> {
    if (!this.isConfigured()) {
      throw new Error('Base de datos no configurada');
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Consultando documentos para cliente:', ter_nit, 'desde:', this.config);
    
    // Datos de ejemplo
    return [
      {
        id: 1,
        ter_nit,
        ter_raz: 'EMPRESA EJEMPLO S.A.S',
        clc_cod: 'FAC',
        doc_num: 1001,
        doc_fec: '2024-01-15',
        cta_cod: '13050501',
        cta_nom: 'CLIENTES NACIONALES',
        mov_val: 5000000,
        mov_val_ext: 5000000,
        mov_obs: 'Venta de mercancía',
        mov_det: 'Factura de venta productos varios'
      }
    ];
  }

  async getDashboardStats() {
    if (!this.isConfigured()) {
      throw new Error('Base de datos no configurada');
    }

    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log('Consultando estadísticas desde:', this.config);
    
    return {
      totalSaldo: 45500000,
      totalClientes: 156,
      documentosPendientes: 423,
      promedioSaldo: 291666
    };
  }
}

export const databaseService = new DatabaseService();
export type { DatabaseConfig, ConMovRecord, SavedModule };
