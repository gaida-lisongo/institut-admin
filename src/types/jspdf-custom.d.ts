// Déclarations de types personnalisées pour jspdf avec any pour éviter les erreurs
declare module 'jspdf' {
  export class jsPDF {
    constructor(options?: any);
    
    // Méthodes de texte
    text(text: string | string[] | any, x: number, y: number, options?: any): any;
    splitTextToSize(text: string, maxWidth: number, options?: any): string[];
    
    // Méthodes de style de texte
    setFontSize(size: number): any;
    setFont(fontName: string, fontStyle?: string): any;
    setTextColor(r: number, g?: number, b?: number, a?: number): any;
    
    // Méthodes de dessin
    setDrawColor(r: number, g?: number, b?: number, a?: number): any;
    setFillColor(r: number, g?: number, b?: number, a?: number): any;
    setLineWidth(width: number): any;
    
    // Formes
    rect(x: number, y: number, w: number, h: number, style?: string | null): any;
    line(x1: number, y1: number, x2: number, y2: number, style?: string | null): any;
    circle(x: number, y: number, r: number, style?: string | null): any;
    ellipse(x: number, y: number, rx: number, ry: number, style?: string | null): any;
    triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, style?: string | null): any;
    
    // Images
    addImage(
      imageData: string | HTMLImageElement | HTMLCanvasElement | Uint8Array,
      format: string,
      x: number,
      y: number,
      width: number,
      height: number,
      alias?: string,
      compression?: string,
      rotation?: number
    ): any;
    
    // Pages
    addPage(format?: any, orientation?: any): any;
    deletePage(pageNumber: number): any;
    setPage(pageNumber: number): any;
    
    // Sauvegarde
    save(filename: string, options?: any): void;
    output(type: string, options?: any): any;
    
    // Propriétés internes
    internal: {
      pageSize: {
        width: number;
        height: number;
        getWidth: () => number;
        getHeight: () => number;
      };
      scaleFactor: number;
      pages: any[];
      getCurrentPageInfo: () => any;
      [key: string]: any;
    };
    
    // Autres méthodes utiles
    getNumberOfPages(): number;
    getCurrentPageInfo(): any;
    setProperties(properties: any): any;
    
    // Permettre toute autre méthode
    [key: string]: any;
  }
  
  export default jsPDF;
}
