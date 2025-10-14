
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import QRCode from 'qrcode';
import { Product } from '@/app/(admin)/(coge)/paiements/[slug]/page';
import { Etablissement } from '@/types/etablissement';
import { Frais } from '@/types/frais';
import { Annee } from '@/types/annee';
import { Classe } from '@/types/systemes';

// Initialiser les polices
pdfMake.vfs = pdfFonts.vfs;

// Taux de conversion USD vers CDF
const USD_TO_CDF_RATE = 2800;

interface PaymentPDFOptions {
  product: Product;
  etablissement: Etablissement;
  frais: Frais;
  annee: Annee;
  classe: any;
}

export const convertUSDToCDF = (amountUSD: number): number => {
  return Math.round(amountUSD * USD_TO_CDF_RATE);
};

export const formatCurrency = (amount: number, currency: 'USD' | 'CDF' = 'CDF'): string => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  return new Intl.NumberFormat('fr-CD', {
    style: 'currency',
    currency: 'CDF',
    minimumFractionDigits: 0
  }).format(amount);
};

export const generatePaymentQRCode = async (productId: string): Promise<string> => {
  const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/finance/produit/${productId}`;
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(paymentUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Erreur lors de la génération du QR Code:', error);
    throw error;
  }
};

export const generatePaymentPDF = async (options: PaymentPDFOptions): Promise<void> => {
  const { product, etablissement, frais, annee, classe } = options;
  
  // Générer le QR Code
  const qrCodeDataUrl = await generatePaymentQRCode(product._id);
  
  // Convertir le montant en CDF
  const montantCDF = convertUSDToCDF(product.montant);
  
  // Définir le contenu du PDF
  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    
    header: {
      margin: [40, 20, 40, 0],
      columns: [
        {
          stack: [
            { text: etablissement.designation, style: 'header', alignment: 'center' },
            { text: etablissement.sigle, style: 'subheader', alignment: 'center' }
          ],
          width: '*'
        }
      ]
    },
    
    content: [
      // Titre
      {
        text: 'BON DE PAIEMENT',
        style: 'title',
        alignment: 'center',
        margin: [0, 20, 0, 30]
      },
      
      // Informations du paiement
      {
        text: 'DÉTAILS DU PAIEMENT',
        style: 'sectionHeader',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: ['35%', '65%'],
          body: [
            [
              { text: 'Année académique:', bold: true },
              `${annee.debut}-${annee.fin}`
            ],
            [
              { text: 'Classe:', bold: true },
              `${classe.niveau} - ${classe.description}`
            ],
            [
              { text: 'Type de frais:', bold: true },
              frais.designation
            ],
            [
              { text: 'Tranche:', bold: true },
              product.tranche
            ],
            [
              { text: 'Montant (USD):', bold: true },
              formatCurrency(product.montant, 'USD')
            ],
            [
              { text: 'Montant (CDF):', bold: true, fillColor: '#f0f0f0' },
              { text: formatCurrency(montantCDF, 'CDF'), bold: true, fontSize: 14, fillColor: '#f0f0f0' }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#cccccc',
          vLineColor: () => '#cccccc'
        },
        margin: [0, 0, 0, 30]
      },
      
      // QR Code
      {
        text: 'SCANNER POUR PAYER',
        style: 'sectionHeader',
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      {
        image: qrCodeDataUrl,
        width: 200,
        alignment: 'center',
        margin: [0, 0, 0, 15]
      },
      {
        text: 'Scannez ce QR code avec votre application de paiement mobile',
        style: 'instruction',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      {
        text: `ID de transaction: ${product._id}`,
        style: 'transactionId',
        alignment: 'center',
        margin: [0, 0, 0, 30]
      },
      
      // Instructions
      {
        text: 'INSTRUCTIONS DE PAIEMENT',
        style: 'sectionHeader',
        margin: [0, 0, 0, 10]
      },
      {
        ol: [
          'Scannez le QR code ci-dessus avec votre application de paiement mobile',
          'Vérifiez le montant et les informations du paiement',
          'Confirmez le paiement dans votre application',
          'Conservez le reçu de transaction comme preuve de paiement',
          'Le paiement sera validé automatiquement dans le système'
        ],
        margin: [0, 0, 0, 20]
      },
      
      // Note importante
      {
        text: 'Note importante',
        style: 'noteHeader',
        margin: [0, 0, 0, 5]
      },
      {
        text: [
          `Ce bon de paiement est valable uniquement pour la tranche et l'année académique mentionnées ci-dessus. `,
          `En cas de problème, veuillez contacter le service financier de l'établissement.`
        ],
        style: 'note'
      }
    ],
    
    footer: (currentPage: number, pageCount: number) => {
      return {
        columns: [
          {
            text: `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
            alignment: 'left',
            fontSize: 8,
            color: '#666666'
          },
          {
            text: `Page ${currentPage} sur ${pageCount}`,
            alignment: 'right',
            fontSize: 8,
            color: '#666666'
          }
        ],
        margin: [40, 0, 40, 0]
      };
    },
    
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        color: '#1a56db'
      },
      subheader: {
        fontSize: 12,
        color: '#666666'
      },
      title: {
        fontSize: 24,
        bold: true,
        color: '#1a56db'
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        color: '#1a56db',
        decoration: 'underline'
      },
      instruction: {
        fontSize: 11,
        color: '#666666',
        italics: true
      },
      transactionId: {
        fontSize: 9,
        color: '#999999',
        // font: 'Courier'
      },
      noteHeader: {
        fontSize: 12,
        bold: true,
        color: '#dc2626'
      },
      note: {
        fontSize: 10,
        color: '#666666',
        italics: true
      }
    }
  };
  
  // Générer et télécharger le PDF
  const fileName = `Paiement_${frais.designation}_${product.tranche}_${Date.now()}.pdf`;
  pdfMake.createPdf(docDefinition).download(fileName);
};

// Fonction pour générer plusieurs PDFs (pour toute une classe)
export const generateBulkPaymentPDFs = async (
  products: Product[],
  etablissement: Etablissement,
  frais: Frais,
  annee: Annee,
  classe: Classe,
  students?: Array<{ nom: string; prenom: string; matricule: string }>
): Promise<void> => {
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const studentInfo = students?.[i];
    
    await generatePaymentPDF({
      product,
      etablissement,
      frais,
      annee,
      classe
    });
    
    // Petit délai entre chaque génération pour éviter de surcharger le navigateur
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};
