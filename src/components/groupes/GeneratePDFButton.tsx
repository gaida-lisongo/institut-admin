"use client";

import React, { useState } from 'react';
import { Groupe, ResolutionWithEtudiant } from '@/types/groupe';
import { Session, Cours } from '@/types/session';

interface GeneratePDFButtonProps {
  groupe: Groupe;
  resolutions: ResolutionWithEtudiant[];
  session?: Session;
  cours?: Cours;
}

const GeneratePDFButton: React.FC<GeneratePDFButtonProps> = ({
  groupe,
  resolutions,
  session,
  cours
}) => {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      // Import dynamique des librairies pour éviter les erreurs SSR
      const pdfMake = (await import('pdfmake/build/pdfmake')).default;
      const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
      const QRCode = (await import('qrcode')).default;

      // Configuration des polices
      pdfMake.vfs = pdfFonts.pdfMake.vfs;

      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        content: [],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          subheader: {
            fontSize: 14,
            bold: true,
            margin: [0, 10, 0, 5]
          },
          normal: {
            fontSize: 11,
            margin: [0, 0, 0, 5]
          },
          small: {
            fontSize: 9,
            margin: [0, 0, 0, 3]
          },
          instructions: {
            fontSize: 10,
            italics: true,
            margin: [0, 10, 0, 10],
            color: '#666666'
          }
        }
      };

      // Générer une page pour chaque étudiant
      for (let i = 0; i < resolutions.length; i++) {
        const resolution = resolutions[i];
        const etudiant = resolution.etudiant;
        const classe = resolution.classe;

        if (!etudiant) continue;

        // Générer l'URL du QR code (simulée)
        const qrCodeData = JSON.stringify({
          groupeId: groupe._id,
          etudiantId: etudiant._id,
          sessionId: groupe.sessionId,
          timestamp: Date.now()
        });

        // Générer le QR code en base64
        const qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        // Contenu de la page pour cet étudiant
        const pageContent = [
          // En-tête
          {
            text: 'FICHE DE TRAVAIL ÉTUDIANT',
            style: 'header'
          },
          
          // Informations du groupe
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: 'Informations du travail', style: 'subheader' },
                  { text: `Groupe: ${groupe.designation}`, style: 'normal' },
                  { text: `Session: ${session?.designation || 'Non définie'}`, style: 'normal' },
                  { text: `Cours: ${cours?.designation || 'Non défini'}`, style: 'normal' },
                  { text: `Unité: ${cours?.unite || 'Non définie'}`, style: 'normal' },
                  { text: `Date: ${new Date().toLocaleDateString()}`, style: 'normal' }
                ]
              },
              {
                width: '50%',
                stack: [
                  { text: 'Informations étudiant', style: 'subheader' },
                  { text: `Nom: ${etudiant.nom}`, style: 'normal' },
                  { text: `Prénom: ${etudiant.prenom}`, style: 'normal' },
                  { text: `Email: ${etudiant.email}`, style: 'normal' },
                  { text: `Classe: ${classe ? `${classe.nom} (${classe.niveau})` : 'Non définie'}`, style: 'normal' },
                  { text: `Sexe: ${(etudiant as any).sexe === 'M' ? 'Masculin' : 'Féminin'}`, style: 'normal' }
                ]
              }
            ]
          },

          // Séparateur
          {
            canvas: [
              {
                type: 'line',
                x1: 0, y1: 0,
                x2: 515, y2: 0,
                lineWidth: 1,
                lineColor: '#CCCCCC'
              }
            ],
            margin: [0, 20, 0, 20]
          },

          // Description du travail
          {
            text: 'Description du travail',
            style: 'subheader'
          },
          {
            text: groupe.description || 'Aucune description fournie.',
            style: 'normal',
            margin: [0, 0, 0, 15]
          },

          // Détails de la session
          {
            text: 'Détails de la session',
            style: 'subheader'
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: `Questions: ${session?.questions?.length || 0}`, style: 'normal' },
                  { text: `Note maximale: ${session?.maximum || 20} points`, style: 'normal' }
                ]
              },
              {
                width: '50%',
                stack: [
                  { text: `Durée maximale: ${groupe.dureeMaximale ? `${groupe.dureeMaximale} minutes` : 'Non limitée'}`, style: 'normal' },
                  { text: `Tentatives autorisées: ${groupe.tentativesMax || 1}`, style: 'normal' }
                ]
              }
            ],
            margin: [0, 0, 0, 20]
          },

          // QR Code et instructions
          {
            columns: [
              {
                width: '60%',
                stack: [
                  { text: 'Instructions', style: 'subheader' },
                  { 
                    text: [
                      '1. Scannez le QR code ci-contre avec votre smartphone ou tablette\n',
                      '2. Vous serez redirigé vers la plateforme de soumission\n',
                      '3. Connectez-vous avec vos identifiants\n',
                      '4. Répondez aux questions dans le temps imparti\n',
                      '5. Validez votre soumission avant la fin du temps\n\n',
                      'Important: Assurez-vous d\'avoir une connexion internet stable.'
                    ], 
                    style: 'instructions' 
                  }
                ]
              },
              {
                width: '40%',
                stack: [
                  { text: 'QR Code d\'accès', style: 'subheader', alignment: 'center' },
                  {
                    image: qrCodeDataURL,
                    width: 150,
                    height: 150,
                    alignment: 'center',
                    margin: [0, 10, 0, 10]
                  },
                  {
                    text: 'Scannez pour accéder au travail',
                    style: 'small',
                    alignment: 'center'
                  }
                ]
              }
            ]
          },

          // Espace pour notes
          {
            text: 'Espace pour vos notes',
            style: 'subheader',
            margin: [0, 30, 0, 10]
          },
          {
            canvas: [
              // Lignes pour écrire
              { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#DDDDDD' },
              { type: 'line', x1: 0, y1: 20, x2: 515, y2: 20, lineWidth: 0.5, lineColor: '#DDDDDD' },
              { type: 'line', x1: 0, y1: 40, x2: 515, y2: 40, lineWidth: 0.5, lineColor: '#DDDDDD' },
              { type: 'line', x1: 0, y1: 60, x2: 515, y2: 60, lineWidth: 0.5, lineColor: '#DDDDDD' },
              { type: 'line', x1: 0, y1: 80, x2: 515, y2: 80, lineWidth: 0.5, lineColor: '#DDDDDD' },
              { type: 'line', x1: 0, y1: 100, x2: 515, y2: 100, lineWidth: 0.5, lineColor: '#DDDDDD' }
            ],
            margin: [0, 0, 0, 20]
          },

          // Pied de page
          {
            text: [
              'Document généré automatiquement le ',
              { text: new Date().toLocaleString(), bold: true },
              '\nID Groupe: ',
              { text: groupe._id, fontSize: 8, color: '#666666' }
            ],
            style: 'small',
            alignment: 'center',
            margin: [0, 30, 0, 0]
          }
        ];

        // Ajouter le contenu de la page
        docDefinition.content.push(...pageContent);

        // Ajouter un saut de page sauf pour la dernière page
        if (i < resolutions.length - 1) {
          docDefinition.content.push({ text: '', pageBreak: 'after' });
        }
      }

      // Générer et télécharger le PDF
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.download(`fiches_travail_${groupe.designation.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du document PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading || resolutions.length === 0}
      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      {loading ? 'Génération...' : 'Générer PDF'}
    </button>
  );
};

export default GeneratePDFButton;
