// Déclarations de types pour exceljs
declare module 'exceljs' {
  export class Workbook {
    constructor();
    addWorksheet(name: string, options?: any): Worksheet;
    removeWorksheet(id: number): void;
    getWorksheet(id: number | string): Worksheet;
    eachSheet(callback: (sheet: Worksheet, id: number) => void): void;
    xlsx: {
      writeBuffer(options?: any): Promise<Buffer>;
      writeFile(filename: string, options?: any): Promise<void>;
      readFile(filename: string, options?: any): Promise<void>;
      read(stream: any, options?: any): Promise<void>;
      write(stream: any, options?: any): Promise<void>;
    };
    csv: {
      writeBuffer(options?: any): Promise<Buffer>;
      writeFile(filename: string, options?: any): Promise<void>;
      readFile(filename: string, options?: any): Promise<void>;
    };
    [key: string]: any;
  }

  export class Worksheet {
    name: string;
    columns: Column[];
    addRow(data: any): Row;
    addRows(rows: any[]): void;
    getRow(row: number): Row;
    getColumn(col: number | string): Column;
    eachRow(callback: (row: Row, rowNumber: number) => void): void;
    mergeCells(start: string | number, end?: string | number, top?: number, bottom?: number): void;
    [key: string]: any;
  }

  export interface Column {
    header?: string;
    key?: string;
    width?: number;
    style?: any;
    [key: string]: any;
  }

  export class Row {
    values: any[];
    font?: any;
    alignment?: any;
    border?: any;
    fill?: any;
    numFmt?: string;
    getCell(col: number | string): Cell;
    eachCell(callback: (cell: Cell, colNumber: number) => void): void;
    [key: string]: any;
  }

  export class Cell {
    value: any;
    font?: any;
    alignment?: any;
    border?: any;
    fill?: any;
    numFmt?: string;
    [key: string]: any;
  }

  export default Workbook;
}
