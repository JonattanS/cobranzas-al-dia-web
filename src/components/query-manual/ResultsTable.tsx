
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResultsTableProps {
  results: any[];
}

export const ResultsTable = ({ results }: ResultsTableProps) => {
  if (results.length === 0) return null;

  return (
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
  );
};
