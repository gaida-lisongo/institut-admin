declare module 'pdfmake/build/pdfmake' {
  import { TCreatedPdf } from 'pdfmake/build/pdfmake';
  
  const pdfMake: {
    vfs: any;
    fonts?: any;
    createPdf(documentDefinitions: any): TCreatedPdf;
  };
  
  export default pdfMake;
  
  export interface TCreatedPdf {
    download(defaultFileName?: string, cb?: () => void, options?: any): void;
    open(options?: any, win?: Window | null): void;
    print(options?: any, win?: Window | null): void;
    getDataUrl(cb: (result: string) => void, options?: any): void;
    getBase64(cb: (result: string) => void, options?: any): void;
    getBuffer(cb: (result: Buffer) => void, options?: any): void;
    getBlob(cb: (result: Blob) => void, options?: any): void;
  }
}

declare module 'pdfmake/build/vfs_fonts' {
  const pdfFonts: {
    pdfMake: {
      vfs: any;
    };
  };
  export default pdfFonts;
}

declare module 'pdfmake/interfaces' {
  export type PageSize = 'A4' | 'A3' | 'A5' | 'LETTER' | 'LEGAL';
  export type PageOrientation = 'portrait' | 'landscape';
  export type Alignment = 'left' | 'right' | 'center' | 'justify';
  
  export interface Content {
    text?: string | string[];
    image?: string;
    width?: number | string | 'auto' | '*';
    height?: number | 'auto';
    columns?: Content[];
    stack?: Content[];
    table?: {
      widths?: (number | string | 'auto' | '*')[];
      heights?: (number | string | 'auto' | '*')[];
      body: Content[][];
    };
    layout?: any;
    style?: string | string[];
    alignment?: Alignment;
    margin?: number | [number, number] | [number, number, number, number];
    bold?: boolean;
    fontSize?: number;
    color?: string;
    fillColor?: string;
    pageBreak?: 'before' | 'after';
    columnGap?: number;
    [key: string]: any;
  }
  
  export interface Style {
    fontSize?: number;
    bold?: boolean;
    italics?: boolean;
    alignment?: Alignment;
    color?: string;
    background?: string;
    margin?: number | [number, number] | [number, number, number, number];
    [key: string]: any;
  }
  
  export interface TDocumentDefinitions {
    content: Content | Content[];
    styles?: { [name: string]: Style };
    pageSize?: PageSize | { width: number; height: number };
    pageOrientation?: PageOrientation;
    pageMargins?: number | [number, number] | [number, number, number, number];
    defaultStyle?: Style;
    [key: string]: any;
  }
}
