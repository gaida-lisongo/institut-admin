declare module 'jspdf' {
  export class jsPDF {
    constructor(options?: any);
    text(text: string | string[], x: number, y: number, options?: any): any;
    setFontSize(size: number): any;
    setTextColor(r: number, g: number, b: number): any;
    setDrawColor(r: number, g: number, b: number): any;
    setFillColor(r: number, g: number, b: number): any;
    setFont(font: string, style?: string): any;
    rect(x: number, y: number, w: number, h: number, style?: string): any;
    line(x1: number, y1: number, x2: number, y2: number): any;
    setLineWidth(width: number): any;
    addImage(imageData: string, format: string, x: number, y: number, width: number, height: number): any;
    save(filename: string): void;
    splitTextToSize(text: string, maxWidth: number): string[];
    internal: {
      pageSize: {
        width: number;
        height: number;
      };
    };
  }
}
