
// Servicio para gestionar el esquema de la tabla con_mov
export interface TableColumn {
  name: string;
  type: string;
  description: string;
  isNumeric: boolean;
  isDate: boolean;
  isText: boolean;
}

export interface QueryCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  type: 'text' | 'number' | 'date';
}

export interface QueryConfiguration {
  selectedFields: string[];
  conditions: QueryCondition[];
  orderBy: string[];
  groupBy: string[];
  limit?: number;
}

// Columnas de la tabla con_mov basadas en el esquema típico
const CON_MOV_COLUMNS: TableColumn[] = [
  { name: 'ter_nit', type: 'varchar', description: 'NIT del tercero', isNumeric: false, isDate: false, isText: true },
  { name: 'ter_raz', type: 'varchar', description: 'Razón social del tercero', isNumeric: false, isDate: false, isText: true },
  { name: 'clc_cod', type: 'varchar', description: 'Código de clase de documento', isNumeric: false, isDate: false, isText: true },
  { name: 'doc_num', type: 'integer', description: 'Número de documento', isNumeric: true, isDate: false, isText: false },
  { name: 'doc_fec', type: 'date', description: 'Fecha del documento', isNumeric: false, isDate: true, isText: false },
  { name: 'cta_cod', type: 'varchar', description: 'Código de cuenta', isNumeric: false, isDate: false, isText: true },
  { name: 'cta_nom', type: 'varchar', description: 'Nombre de cuenta', isNumeric: false, isDate: false, isText: true },
  { name: 'mov_val', type: 'numeric', description: 'Valor del movimiento', isNumeric: true, isDate: false, isText: false },
  { name: 'mov_val_ext', type: 'numeric', description: 'Valor externo del movimiento', isNumeric: true, isDate: false, isText: false },
  { name: 'mov_obs', type: 'text', description: 'Observaciones del movimiento', isNumeric: false, isDate: false, isText: true },
  { name: 'mov_det', type: 'text', description: 'Detalle del movimiento', isNumeric: false, isDate: false, isText: true },
  { name: 'anf_cla', type: 'integer', description: 'Clasificación analítica', isNumeric: true, isDate: false, isText: false },
  { name: 'anf_cre', type: 'integer', description: 'Analítica crédito', isNumeric: true, isDate: false, isText: false }
];

const OPERATORS = {
  text: [
    { value: '=', label: 'Igual a' },
    { value: '!=', label: 'Diferente de' },
    { value: 'LIKE', label: 'Contiene' },
    { value: 'NOT LIKE', label: 'No contiene' },
    { value: 'IN', label: 'En lista' }
  ],
  number: [
    { value: '=', label: 'Igual a' },
    { value: '!=', label: 'Diferente de' },
    { value: '>', label: 'Mayor que' },
    { value: '>=', label: 'Mayor o igual que' },
    { value: '<', label: 'Menor que' },
    { value: '<=', label: 'Menor o igual que' },
    { value: 'BETWEEN', label: 'Entre' }
  ],
  date: [
    { value: '=', label: 'Igual a' },
    { value: '!=', label: 'Diferente de' },
    { value: '>', label: 'Posterior a' },
    { value: '>=', label: 'Posterior o igual a' },
    { value: '<', label: 'Anterior a' },
    { value: '<=', label: 'Anterior o igual a' },
    { value: 'BETWEEN', label: 'Entre fechas' }
  ]
};

class SchemaService {
  getTableColumns(): TableColumn[] {
    return CON_MOV_COLUMNS;
  }

  getOperatorsForColumn(columnName: string): Array<{value: string, label: string}> {
    const column = CON_MOV_COLUMNS.find(col => col.name === columnName);
    if (!column) return [];

    if (column.isNumeric) return OPERATORS.number;
    if (column.isDate) return OPERATORS.date;
    return OPERATORS.text;
  }

  generateSQL(config: QueryConfiguration): string {
    const { selectedFields, conditions, orderBy, groupBy, limit } = config;

    // SELECT clause
    let sql = `SELECT ${selectedFields.length > 0 ? selectedFields.join(', ') : '*'}\nFROM public.con_mov`;

    // WHERE clause
    if (conditions.length > 0) {
      const whereConditions = conditions.map(condition => {
        const { field, operator, value, type } = condition;
        
        if (operator === 'LIKE' || operator === 'NOT LIKE') {
          return `${field} ${operator} '%${value}%'`;
        } else if (operator === 'IN') {
          const values = value.split(',').map(v => `'${v.trim()}'`).join(', ');
          return `${field} IN (${values})`;
        } else if (operator === 'BETWEEN') {
          const [val1, val2] = value.split(',');
          if (type === 'date') {
            return `${field} BETWEEN '${val1.trim()}' AND '${val2.trim()}'`;
          } else {
            return `${field} BETWEEN ${val1.trim()} AND ${val2.trim()}`;
          }
        } else {
          if (type === 'text' || type === 'date') {
            return `${field} ${operator} '${value}'`;
          } else {
            return `${field} ${operator} ${value}`;
          }
        }
      });
      
      sql += `\nWHERE ${whereConditions.join(' AND ')}`;
    }

    // GROUP BY clause
    if (groupBy.length > 0) {
      sql += `\nGROUP BY ${groupBy.join(', ')}`;
    }

    // ORDER BY clause
    if (orderBy.length > 0) {
      sql += `\nORDER BY ${orderBy.join(', ')}`;
    }

    // LIMIT clause
    if (limit && limit > 0) {
      sql += `\nLIMIT ${limit}`;
    }

    return sql;
  }

  getColumnType(columnName: string): 'text' | 'number' | 'date' {
    const column = CON_MOV_COLUMNS.find(col => col.name === columnName);
    if (!column) return 'text';
    
    if (column.isNumeric) return 'number';
    if (column.isDate) return 'date';
    return 'text';
  }
}

export const schemaService = new SchemaService();
