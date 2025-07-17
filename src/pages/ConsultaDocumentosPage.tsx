import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { databaseService } from '@/services/database';
import { formatCellValue } from '@/utils/formatters';
import { schemaService } from '@/services/schemaService';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getColumnDescription = (key: string): string => {
  const col = schemaService.getTableColumns().find(c => c.name === key);
  return col?.description || key;
};

type Filtros = {
  suc_cod: string;
  clc_cod: string;
  doc_num_ini: string;
  doc_num_fin: string;
  fecha_ini: string;
  fecha_fin: string;
  ter_nit_ini: string;
  ter_nit_fin: string;
  cta_cod_ini: string;
  cta_cod_fin: string;
};

const ROWS_PER_PAGE = 100;

const ConsultaDocumentosPage = () => {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState<Filtros>({
    suc_cod: '',
    clc_cod: '',
    doc_num_ini: '',
    doc_num_fin: '',
    fecha_ini: '',
    fecha_fin: '',
    ter_nit_ini: '',
    ter_nit_fin: '',
    cta_cod_ini: '',
    cta_cod_fin: '',
  });

  const [resultado, setResultado] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState('1');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResultado([]);
    setPage(1);
    setInputPage('1');

    try {
      const response = await databaseService.consultaDocumentos(filtros);
      setResultado(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // === PAGINACIÓN ===
  const totalPages = Math.ceil(resultado.length / ROWS_PER_PAGE);
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const endIndex = Math.min(startIndex + ROWS_PER_PAGE, resultado.length);
  const pageResults = resultado.slice(startIndex, endIndex);

  const handleInputPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value.replace(/[^0-9]/g, ''));
  };

  const goToInputPage = () => {
    let newPage = parseInt(inputPage, 10);
    if (isNaN(newPage) || newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;
    setPage(newPage);
    setInputPage(newPage.toString());
  };

  const goToNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
      setInputPage((page + 1).toString());
    }
  };

  const goToPrev = () => {
    if (page > 1) {
      setPage(page - 1);
      setInputPage((page - 1).toString());
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
        
      <Card>
        <CardHeader>
          <CardTitle>Consulta de Documentos Contables</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6" onSubmit={handleSubmit}>
            <Input name="suc_cod" placeholder="Sucursal" value={filtros.suc_cod} onChange={handleChange} />
            <Input name="clc_cod" placeholder="Clase Documento" value={filtros.clc_cod} onChange={handleChange} />
            <Input name="doc_num_ini" placeholder="Doc. Inicial" value={filtros.doc_num_ini} onChange={handleChange} />
            <Input name="doc_num_fin" placeholder="Doc. Final" value={filtros.doc_num_fin} onChange={handleChange} />
            <Input type="date" name="fecha_ini" value={filtros.fecha_ini} onChange={handleChange} />
            <Input type="date" name="fecha_fin" value={filtros.fecha_fin} onChange={handleChange} />
            <Input name="ter_nit_ini" placeholder="NIT Inicial" value={filtros.ter_nit_ini} onChange={handleChange} />
            <Input name="ter_nit_fin" placeholder="NIT Final" value={filtros.ter_nit_fin} onChange={handleChange} />
            <Input name="cta_cod_ini" placeholder="Cuenta Inicial" value={filtros.cta_cod_ini} onChange={handleChange} />
            <Input name="cta_cod_fin" placeholder="Cuenta Final" value={filtros.cta_cod_fin} onChange={handleChange} />
            <div className="col-span-full">
              <Button type="submit" disabled={loading}>
                {loading ? 'Consultando...' : 'Consultar'}
              </Button>
            </div>
          </form>

          {error && <div className="text-red-600 mb-4">{error}</div>}

          {resultado.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Resultados ({resultado.length} registros)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        {Object.keys(pageResults[0]).map((key) => (
                          <th key={key} className="border px-4 py-2 font-semibold text-left">
                            {getColumnDescription(key)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageResults.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {Object.keys(row).map((key) => (
                            <td key={key} className="border px-4 py-2">
                              {formatCellValue(key, row[key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
                  <Button variant="outline" size="sm" onClick={goToPrev} disabled={page === 1}>
                    Anterior
                  </Button>
                  <span className="text-sm">
                    Página{' '}
                    <Input
                      type="text"
                      value={inputPage}
                      onChange={handleInputPageChange}
                      onBlur={goToInputPage}
                      onKeyDown={(e) => e.key === 'Enter' && goToInputPage()}
                      className="w-16 text-center inline-block"
                    />{' '}
                    de {totalPages}
                  </span>
                  <Button variant="outline" size="sm" onClick={goToNext} disabled={page === totalPages}>
                    Siguiente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultaDocumentosPage;
