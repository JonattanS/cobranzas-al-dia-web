
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Play, Download, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QueryEditorProps {
  query: string;
  setQuery: (query: string) => void;
  executeQuery: () => void;
  isLoading: boolean;
  error: string;
  onSaveModule: () => void;
  onExportResults: () => void;
  hasResults: boolean;
  resultsCount: number;
}

export const QueryEditor = ({
  query,
  setQuery,
  executeQuery,
  isLoading,
  error,
  onSaveModule,
  onExportResults,
  hasResults,
  resultsCount
}: QueryEditorProps) => {
  return (
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
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={executeQuery} disabled={isLoading || !query.trim()}>
            <Play className="h-4 w-4 mr-2" />
            {isLoading ? 'Ejecutando...' : 'Ejecutar Query'}
          </Button>
          
          <Button variant="outline" disabled={!query.trim()} onClick={onSaveModule}>
            <Save className="h-4 w-4 mr-2" />
            Guardar como Módulo
          </Button>
          
          {hasResults && (
            <Button variant="outline" onClick={onExportResults}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
