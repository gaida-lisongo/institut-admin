// Override complet des types pdfmake pour éviter les conflits
// Ce fichier force TypeScript à utiliser nos types personnalisés

declare module 'pdfmake/interfaces' {
  // Exporter tout comme any pour une compatibilité maximale
  export type Content = any;
  export type Style = any;
  export type TDocumentDefinitions = any;
  export type PageSize = any;
  export type PageOrientation = any;
  export type Alignment = any;
  export type TableLayout = any;
  export type CustomTableLayout = any;
  export type Margins = any;
  export type Size = any;
  export type ContextPageSize = any;
  export type PageBreak = any;
  export type DynamicContent = any;
  export type DynamicBackground = any;
  export type Node = any;
  export type ContentText = any;
  export type ContentColumns = any;
  export type ContentStack = any;
  export type ContentUnorderedList = any;
  export type ContentOrderedList = any;
  export type ContentTable = any;
  export type ContentAnchor = any;
  export type ContentToc = any;
  export type ContentTocItem = any;
  export type ContentImage = any;
  export type ContentSvg = any;
  export type ContentQr = any;
  export type ContentCanvas = any;
  export type ContentLink = any;
  export type ContentAttachment = any;
}

declare module 'pdfmake/build/pdfmake' {
  const pdfMake: any;
  export default pdfMake;
  export type TCreatedPdf = any;
}

declare module 'pdfmake/build/vfs_fonts' {
  const pdfFonts: any;
  export default pdfFonts;
}
