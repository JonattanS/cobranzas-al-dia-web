
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Play, Download, History, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { databaseService } from '@/services/database';

const QueryManualPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(`SELECT 
  ter_nit,
  ter_raz,
  clc_cod,
  doc_num,
  doc_fec,
  cta_cod,
  cta_nom,
  mov_val,
  mov_val_ext,
  mov_obs,
  mov_det
FROM public.con_mov 
WHERE doc_fec >= '2024-01-01'
ORDER BY doc_fec DESC
LIMIT 100;`);
  
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    ter_nit: '',
    fecha_desde: '',
    fecha_hasta: '',
    clc_cod: '',
    min_valor: '',
    max_valor: ''
  });

  const executeQuery = async () => {
    if (!databaseService.isConfigured()) {
      setError('Base de datos no configurada');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Simular ejecución de query - En producción aquí harías la llamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Ejecutando query:', query);
      console.log('Con configuración:', databaseService.getConfig());
      
      // Datos de ejemplo basados en tu estructura real
      const mockResults = [
        {
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
        },
        {
          ter_nit: '800987654',
          ter_raz: 'COMERCIAL DEMO LTDA',
          clc_cod: 'REC',
          doc_num: 2001,
          doc_fec: '2024-01-20',
          cta_cod: '11100505',
          cta_nom: 'BANCOS',
          mov_val: -3000000,
          mov_val_ext: -3000000,
          mov_obs: 'Pago recibido',
          mov_det: 'Recibo de caja por pago factura'
        }
      ];
      
      setResults(mockResults);
    } catch (err) {
      setError('Error ejecutando la consulta: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredQuery = query;
    
    // Agregar filtros dinámicos al query
    const conditions = [];
    
    if (filters.ter_nit) {
      conditions.push(`ter_nit LIKE '%${filters.ter_nit}%'`);
    }
    
    if (filters.fecha_desde) {
      conditions.push(`doc_fec >= '${filters.fecha_desde}'`);
    }
    
    if (filters.fecha_hasta) {
      conditions.push(`doc_fec <= '${filters.fecha_hasta}'`);
    }
    
    if (filters.clc_cod) {
      conditions.push(`clc_cod = '${filters.clc_cod}'`);
    }
    
    if (filters.min_valor) {
      conditions.push(`ABS(mov_val) >= ${filters.min_valor}`);
    }
    
    if (filters.max_valor) {
      conditions.push(`ABS(mov_val) <= ${filters.max_valor}`);
    }
    
    if (conditions.length > 0) {
      // Buscar WHERE en el query y agregar condiciones
      if (filteredQuery.toUpperCase().includes('WHERE')) {
        filteredQuery += ` AND ${conditions.join(' AND ')}`;
      } else {
        filteredQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
    }
    
    setQuery(filteredQuery);
  };

  const exportResults = () => {
    if (results.length === 0) return;
    
    const csv = [
      Object.keys(results[0]).join(','),
      ...results.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Query Manual</h1>
          <p className="text-muted-foreground">
            Ejecuta consultas SQL personalizadas en tu base de datos PostgreSQL
          </p>
        </div>
      </div>

      <Tabs defaultValue="query" className="space-y-4">
        <TabsList>
          <TabsTrigger value="query">Editor SQL</TabsTrigger>
          <TabsTrigger value="filters">Filtros Dinámicos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Editor de Consultas SQL</span>
              </CardTitle>
              <CardDescription>
                Escribe tu consulta SQL para la tabla public.con_mov
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query">Consulta SQL</Label>
                <Textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SELECT * FROM public.con_mov WHERE..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={executeQuery} disabled={isLoading || !query.trim()}>
                  <Play className="h-4 w-4 mr-2" />
                  {isLoading ? 'Ejecutando...' : 'Ejecutar Query'}
                </Button>
                
                {results.length > 0 && (
                  <Button variant="outline" onClick={exportResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                )}
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Resultados */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados ({results.length} registros)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(results[0]).map((key) => (
                          <th key={key} className="border border-gray-300 px-4 py-2 text-left font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                              {value?.toString() || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtros Dinámicos</span>
              </CardTitle>
              <CardDescription>
                Configura filtros que se aplicarán automáticamente a tu consulta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ter_nit">NIT Tercero</Label>
                  <Input
                    id="ter_nit"
                    value={filters.ter_nit}
                    onChange={(e) => setFilters({...filters, ter_nit: e.target.value})}
                    placeholder="900123456"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clc_cod">Código Clase</Label>
                  <Input
                    id="clc_cod"
                    value={filters.clc_cod}
                    onChange={(e) => setFilters({...filters, clc_cod: e.target.value})}
                    placeholder="FAC, REC, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fecha_desde">Fecha Desde</Label>
                  <Input
                    id="fecha_desde"
                    type="date"
                    value={filters.fecha_desde}
                    onChange={(e) => setFilters({...filters, fecha_desde: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fecha_hasta">Fecha Hasta</Label>
                  <Input
                    id="fecha_hasta"
                    type="date"
                    value={filters.fecha_hasta}
                    onChange={(e) => setFilters({...filters, fecha_hasta: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="min_valor">Valor Mínimo</Label>
                  <Input
                    id="min_valor"
                    type="number"
                    value={filters.min_valor}
                    onChange={(e) => setFilters({...filters, min_valor: e.target.value})}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_valor">Valor Máximo</Label>
                  <Input
                    id="max_valor"
                    type="number"
                    value={filters.max_valor}
                    onChange={(e) => setFilters({...filters, max_valor: e.target.value})}
                    placeholder="1000000"
                  />
                </div>
              </div>
              
              <Button onClick={applyFilters} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros al Query
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QueryManualPage;
