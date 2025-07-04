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

  // Método para ejecutar queries personalizados
  async executeCustomQuery(query: string): Promise<any[]> {
    if (!this.isConfigured()) {
      throw new Error('Base de datos no configurada');
    }

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // Aquí iría la llamada real a tu API backend
    console.log('Ejecutando query personalizado:', query);
    console.log('Configuración DB:', this.config);
    
    // Por ahora retornamos datos de ejemplo
    // En producción, aquí harías la llamada HTTP a tu backend
    return [
      {
        id: 1,
        ter_nit: '900123456',
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
export type { DatabaseConfig, ConMovRecord };
