// Déclarations de types pour file-saver
declare module 'file-saver' {
  /**
   * Sauvegarde un fichier
   * @param data - Les données à sauvegarder (Blob, File, string, etc.)
   * @param filename - Le nom du fichier
   * @param options - Options de sauvegarde
   */
  export function saveAs(
    data: Blob | File | string | ArrayBuffer | ArrayBufferView | Uint8Array | any,
    filename?: string,
    options?: {
      autoBom?: boolean;
      [key: string]: any;
    }
  ): void;

  /**
   * Interface pour FileSaver
   */
  export interface FileSaver {
    saveAs: typeof saveAs;
    [key: string]: any;
  }

  const fileSaver: FileSaver;
  export default fileSaver;
}
