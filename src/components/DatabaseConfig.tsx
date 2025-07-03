
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, CheckCircle, AlertCircle } from 'lucide-react';
import { databaseService, type DatabaseConfig } from '@/services/database';

interface DatabaseConfigProps {
  onConfigured?: () => void;
}

export function DatabaseConfig({ onConfigured }: DatabaseConfigProps) {
  const [config, setConfig] = useState<DatabaseConfig>({
    host: '162.248.53.100',
    port: 5432,
    database: 'iNova',
    username: 'postgres',
    password: ''
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedConfig = databaseService.getConfig();
    if (savedConfig) {
      setConfig(savedConfig);
      setIsConfigured(true);
    }
  }, []);

  const handleSave = () => {
    databaseService.saveConfig(config);
    setIsConfigured(true);
    onConfigured?.();
  };

  const handleClear = () => {
    databaseService.clearConfig();
    setConfig({
      host: '162.248.53.100',
      port: 5432,
      database: 'iNova',
      username: 'postgres',
      password: ''
    });
    setIsConfigured(false);
  };

  if (isConfigured) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Base de datos configurada correctamente. Conectado a: {config.host}:{config.port}/{config.database}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="ml-4"
          >
            Reconfigurar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <CardTitle>Configuración de Base de Datos</CardTitle>
        </div>
        <CardDescription>
          Configura la conexión a tu base de datos PostgreSQL. Los datos se guardan localmente en tu navegador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Importante:</strong> Esta configuración es solo para pruebas locales. 
            Los datos se almacenan en tu navegador y no se envían a ningún servidor.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              value={config.host}
              onChange={(e) => setConfig({...config, host: e.target.value})}
              placeholder="162.248.53.100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Puerto</Label>
            <Input
              id="port"
              type="number"
              value={config.port}
              onChange={(e) => setConfig({...config, port: parseInt(e.target.value)})}
              placeholder="5432"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="database">Base de Datos</Label>
          <Input
            id="database"
            value={config.database}
            onChange={(e) => setConfig({...config, database: e.target.value})}
            placeholder="iNova"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Usuario</Label>
          <Input
            id="username"
            value={config.username}
            onChange={(e) => setConfig({...config, username: e.target.value})}
            placeholder="postgres"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="flex space-x-2">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={config.password}
              onChange={(e) => setConfig({...config, password: e.target.value})}
              placeholder="Ingresa tu contraseña"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </div>

        <Button 
          onClick={handleSave}
          className="w-full"
          disabled={!config.password}
        >
          Guardar Configuración
        </Button>
      </CardContent>
    </Card>
  );
}
