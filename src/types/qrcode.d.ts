// Déclarations de types pour qrcode
declare module 'qrcode' {
  export interface QRCodeToDataURLOptions {
    type?: 'image/png' | 'image/jpeg' | 'image/webp';
    quality?: number;
    margin?: number;
    scale?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    version?: number;
    maskPattern?: number;
    toSJISFunc?: any;
  }

  export interface QRCodeToStringOptions extends QRCodeToDataURLOptions {
    type?: 'svg' | 'terminal' | 'utf8';
  }

  export interface QRCodeToFileOptions extends QRCodeToDataURLOptions {
    rendererOpts?: any;
  }

  export interface QRCodeToBufferOptions extends QRCodeToDataURLOptions {
    rendererOpts?: any;
  }

  export function toDataURL(
    text: string | any[],
    options?: QRCodeToDataURLOptions
  ): Promise<string>;

  export function toDataURL(
    text: string | any[],
    callback: (error: Error | null, url: string) => void
  ): void;

  export function toDataURL(
    text: string | any[],
    options: QRCodeToDataURLOptions,
    callback: (error: Error | null, url: string) => void
  ): void;

  export function toString(
    text: string | any[],
    options?: QRCodeToStringOptions
  ): Promise<string>;

  export function toString(
    text: string | any[],
    callback: (error: Error | null, string: string) => void
  ): void;

  export function toString(
    text: string | any[],
    options: QRCodeToStringOptions,
    callback: (error: Error | null, string: string) => void
  ): void;

  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string | any[],
    options?: any
  ): Promise<any>;

  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string | any[],
    callback: (error: Error | null) => void
  ): void;

  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string | any[],
    options: any,
    callback: (error: Error | null) => void
  ): void;

  export function toCanvas(
    text: string | any[],
    options?: any
  ): Promise<HTMLCanvasElement>;

  export function toCanvas(
    text: string | any[],
    callback: (error: Error | null, canvas: HTMLCanvasElement) => void
  ): void;

  export function toCanvas(
    text: string | any[],
    options: any,
    callback: (error: Error | null, canvas: HTMLCanvasElement) => void
  ): void;

  export function toFile(
    path: string,
    text: string | any[],
    options?: QRCodeToFileOptions
  ): Promise<void>;

  export function toFile(
    path: string,
    text: string | any[],
    callback: (error: Error | null) => void
  ): void;

  export function toFile(
    path: string,
    text: string | any[],
    options: QRCodeToFileOptions,
    callback: (error: Error | null) => void
  ): void;

  export function toBuffer(
    text: string | any[],
    options?: QRCodeToBufferOptions
  ): Promise<Buffer>;

  export function toBuffer(
    text: string | any[],
    callback: (error: Error | null, buffer: Buffer) => void
  ): void;

  export function toBuffer(
    text: string | any[],
    options: QRCodeToBufferOptions,
    callback: (error: Error | null, buffer: Buffer) => void
  ): void;

  export function toFileStream(
    stream: any,
    text: string | any[],
    options?: any
  ): void;

  const QRCode: {
    toDataURL: typeof toDataURL;
    toString: typeof toString;
    toCanvas: typeof toCanvas;
    toFile: typeof toFile;
    toBuffer: typeof toBuffer;
    toFileStream: typeof toFileStream;
  };

  export default QRCode;
}
