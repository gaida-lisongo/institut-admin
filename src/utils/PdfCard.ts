import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import QRCode from 'qrcode';
import { Etudiant } from '@/types/etudiant';

// Initialiser les polices
pdfMake.vfs = pdfFonts.vfs;

interface StudentCardData {
  etudiant: Etudiant;
  institution?: string;
  annee?: string;
  classe?: string;
}

export class PdfCard {
  private static readonly CARDS_PER_ROW = 3;
  private static readonly CARDS_PER_COLUMN = 8;
  private static readonly CARDS_PER_PAGE = 24; // 3 x 8
  
  // Dimensions en points (1 point = 1/72 inch)
  // A4 = 595.28 x 841.89 points
  private static readonly PAGE_WIDTH = 595.28;
  private static readonly PAGE_HEIGHT = 841.89;
  private static readonly MARGIN = 20;
  
  // Dimensions de carte (en points) - ajustées pour tenir 3x8 sur A4
  private static readonly CARD_WIDTH = (PdfCard.PAGE_WIDTH - 2 * PdfCard.MARGIN - 20) / 3; // ~178 points
  private static readonly CARD_HEIGHT = (PdfCard.PAGE_HEIGHT - 2 * PdfCard.MARGIN - 35) / 8; // ~95 points
  
  /**
   * Génère un QR code en base64
   */
  private static async generateQRCode(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data, {
        width: 80,
        margin: 1,
        errorCorrectionLevel: 'M'
      });
    } catch (error) {
      console.error('Erreur génération QR code:', error);
      return '';
    }
  }

  /**
   * Crée une carte d'étudiant
   */
  private static async createStudentCard(data: StudentCardData): Promise<Content> {
    const { etudiant, institution = 'Institut Supérieur', annee = '', classe = '' } = data;
    // Construct url : protocol + host + path
    const url = `https://${institution.toLowerCase()}.inbtp.net/scanning/${etudiant?._id}`;
    const qrCodeData = await this.generateQRCode(url);
    
    const nomComplet = `${etudiant.nom} ${etudiant.post_nom} ${etudiant.prenom}`.toUpperCase();
    
    return {
      table: {
        widths: [this.CARD_WIDTH - 10],
        heights: [this.CARD_HEIGHT - 5],
        body: [
          [
            {
              stack: [
                // En-tête
                {
                  text: `Section : ${institution}`,
                  style: 'cardHeader',
                  alignment: 'center',
                  margin: [0, 2, 0, 2]
                },
                {
                  text: 'JETON D\'AUTHENTIFICATION',
                  style: 'cardTitle',
                  alignment: 'center',
                  margin: [0, 0, 0, 3]
                },
                // Contenu principal
                {
                  columns: [
                    // QR Code
                    {
                      width: 60,
                      stack: [
                        qrCodeData ? {
                          image: qrCodeData,
                          width: 55,
                          height: 55,
                          alignment: 'center',
                          margin: [2, 0, 0, 0]
                        } : {
                          text: '',
                          width: 55,
                          height: 55
                        }
                      ]
                    },
                    // Informations
                    {
                      width: '*',
                      stack: [
                        {
                          text: [
                            { text: 'Matricule: ', bold: true, fontSize: 7 },
                            { text: etudiant.matricule, fontSize: 7 }
                          ],
                          margin: [0, 0, 0, 1]
                        },
                        {
                          text: [
                            { text: 'Nom: ', bold: true, fontSize: 6.5 },
                            { text: nomComplet, fontSize: 6.5 }
                          ],
                          margin: [0, 0, 0, 1]
                        },
                        {
                          text: [
                            { text: 'Sexe: ', bold: true, fontSize: 7 },
                            { text: etudiant.sexe === 'M' ? 'Masculin' : 'Féminin', fontSize: 7 }
                          ],
                          margin: [0, 0, 0, 1]
                        },
                        {
                          text: [
                            { text: 'Nationalité: ', bold: true, fontSize: 7 },
                            { text: etudiant.nationalite, fontSize: 7 }
                          ],
                          margin: [0, 0, 0, 1]
                        },
                        annee ? {
                          text: [
                            { text: 'Année: ', bold: true, fontSize: 6.5 },
                            { text: annee, fontSize: 6.5 }
                          ],
                          margin: [0, 0, 0, 1]
                        } : {},
                        classe ? {
                          text: [
                            { text: 'Classe: ', bold: true, fontSize: 6.5 },
                            { text: classe, fontSize: 6.5 }
                          ],
                          margin: [0, 0, 0, 0]
                        } : {}
                      ]
                    }
                  ],
                  columnGap: 3
                }
              ],
              fillColor: '#f8f9fa',
              margin: [3, 3, 3, 3]
            }
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#333333',
        vLineColor: () => '#333333',
        paddingLeft: () => 2,
        paddingRight: () => 2,
        paddingTop: () => 2,
        paddingBottom: () => 2
      }
    };
  }

  /**
   * Génère le PDF avec toutes les cartes
   */
  public static async generateStudentCards(
    students: StudentCardData[],
    options?: {
      institution?: string;
      annee?: string;
      classe?: string;
      fileName?: string;
    }
  ): Promise<void> {
    const { institution, annee, classe, fileName = 'cartes_etudiants.pdf' } = options || {};
    
    // Générer toutes les cartes
    const cards: Content[] = [];
    for (const student of students) {
      const card = await this.createStudentCard({
        ...student,
        institution: institution || student.institution,
        annee: annee || student.annee,
        classe: classe || student.classe
      });
      cards.push(card);
    }

    // Organiser les cartes en pages (3 colonnes x 8 lignes)
    const content: Content[] = [];
    
    for (let pageStart = 0; pageStart < cards.length; pageStart += this.CARDS_PER_PAGE) {
      const pageCards = cards.slice(pageStart, pageStart + this.CARDS_PER_PAGE);
      
      // Créer les lignes (8 lignes par page)
      const rows: Content[][] = [];
      for (let row = 0; row < this.CARDS_PER_COLUMN; row++) {
        const rowCards: Content[] = [];
        for (let col = 0; col < this.CARDS_PER_ROW; col++) {
          const cardIndex = row * this.CARDS_PER_ROW + col;
          if (cardIndex < pageCards.length) {
            rowCards.push(pageCards[cardIndex]);
          } else {
            // Cellule vide si pas assez de cartes
            rowCards.push({ text: '', width: this.CARD_WIDTH });
          }
        }
        rows.push(rowCards);
      }

      // Ajouter la page
      rows.forEach((row, index) => {
        content.push({
          columns: row,
          columnGap: 5,
          margin: [0, index === 0 ? 0 : 3, 0, 0]
        });
      });

      // Saut de page si ce n'est pas la dernière page
      if (pageStart + this.CARDS_PER_PAGE < cards.length) {
        content.push({ text: '', pageBreak: 'after' });
      }
    }

    // Définition du document
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [this.MARGIN, this.MARGIN, this.MARGIN, this.MARGIN],
      content: content,
      styles: {
        cardHeader: {
          fontSize: 8,
          bold: true,
          color: '#1a1a1a'
        },
        cardTitle: {
          fontSize: 7,
          bold: true,
          color: '#2563eb'
        }
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };

    // Générer et télécharger le PDF
    pdfMake.createPdf(docDefinition).download(fileName);
  }

  /**
   * Génère un aperçu du PDF (ouvre dans un nouvel onglet)
   */
  public static async previewStudentCards(
    students: StudentCardData[],
    options?: {
      institution?: string;
      annee?: string;
      classe?: string;
    }
  ): Promise<void> {
    const { institution, annee, classe } = options || {};
    
    // Générer toutes les cartes
    const cards: Content[] = [];
    for (const student of students) {
      const card = await this.createStudentCard({
        ...student,
        institution: institution || student.institution,
        annee: annee || student.annee,
        classe: classe || student.classe
      });
      cards.push(card);
    }

    // Organiser les cartes en pages
    const content: Content[] = [];
    
    for (let pageStart = 0; pageStart < cards.length; pageStart += this.CARDS_PER_PAGE) {
      const pageCards = cards.slice(pageStart, pageStart + this.CARDS_PER_PAGE);
      
      const rows: Content[][] = [];
      for (let row = 0; row < this.CARDS_PER_COLUMN; row++) {
        const rowCards: Content[] = [];
        for (let col = 0; col < this.CARDS_PER_ROW; col++) {
          const cardIndex = row * this.CARDS_PER_ROW + col;
          if (cardIndex < pageCards.length) {
            rowCards.push(pageCards[cardIndex]);
          } else {
            rowCards.push({ text: '', width: this.CARD_WIDTH });
          }
        }
        rows.push(rowCards);
      }

      rows.forEach((row, index) => {
        content.push({
          columns: row,
          columnGap: 5,
          margin: [0, index === 0 ? 0 : 3, 0, 0]
        });
      });

      if (pageStart + this.CARDS_PER_PAGE < cards.length) {
        content.push({ text: '', pageBreak: 'after' });
      }
    }

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [this.MARGIN, this.MARGIN, this.MARGIN, this.MARGIN],
      content: content,
      styles: {
        cardHeader: {
          fontSize: 8,
          bold: true,
          color: '#1a1a1a'
        },
        cardTitle: {
          fontSize: 7,
          bold: true,
          color: '#2563eb'
        }
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };

    // Ouvrir dans un nouvel onglet
    pdfMake.createPdf(docDefinition).open();
  }
}
