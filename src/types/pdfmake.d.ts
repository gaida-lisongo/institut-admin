declare module 'pdfmake/build/pdfmake' {
  export interface TCreatedPdf {
    download(defaultFileName?: string, cb?: () => void, options?: any): void;
    open(options?: any, win?: Window | null): void;
    print(options?: any, win?: Window | null): void;
    getDataUrl(cb: (result: string) => void, options?: any): void;
    getBase64(cb: (result: string) => void, options?: any): void;
    getBuffer(cb: (result: Buffer) => void, options?: any): void;
    getBlob(cb: (result: Blob) => void, options?: any): void;
    [key: string]: any;
  }
  
  const pdfMake: {
    vfs: any;
    fonts?: any;
    createPdf(documentDefinitions: any): TCreatedPdf;
    [key: string]: any;
  };
  
  export default pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  const pdfFonts: {
    pdfMake: {
      vfs: any;
    };
    vfs: any;
  };
  export default pdfFonts;
}

declare module 'pdfmake/interfaces' {
  export type PageSize = 'A4' | 'A3' | 'A5' | 'LETTER' | 'LEGAL' | any;
  export type PageOrientation = 'portrait' | 'landscape' | any;
  export type Alignment = 'left' | 'right' | 'center' | 'justify' | any;
  
  // Type ultra-permissif pour Content
  export type Content = {
    text?: any;
    image?: any;
    width?: any;
    height?: any;
    columns?: any;
    stack?: any;
    table?: any;
    layout?: any;
    style?: any;
    alignment?: any;
    margin?: any;
    bold?: any;
    fontSize?: any;
    color?: any;
    fillColor?: any;
    pageBreak?: any;
    columnGap?: any;
    [key: string]: any;
  };
  
  export type Style = {
    fontSize?: any;
    bold?: any;
    italics?: any;
    alignment?: any;
    color?: any;
    background?: any;
    margin?: any;
    font?: any;
    [key: string]: any;
  };
  
  export type TDocumentDefinitions = {
    content?: any;
    styles?: any;
    pageSize?: any;
    pageOrientation?: any;
    pageMargins?: any;
    defaultStyle?: any;
    [key: string]: any;
  };
}
