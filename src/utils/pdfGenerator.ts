import { GroupeDetail } from '@/stores/groupeStore';
import { Matiere } from '@/stores/matiereStore';
import { SerieDetail } from '@/stores/serieStore';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces';

// Configuration des polices par defaut
pdfMake.vfs = pdfFonts.vfs;

class PdfGroupe {
  groupe: GroupeDetail;
  serie: SerieDetail;
  cours: Matiere;

  constructor(groupe: GroupeDetail, serie: SerieDetail, cours: Matiere) {
    this.groupe = groupe;
    this.serie = serie;
    this.cours = cours;
  }

  // Nouvelle méthode pour générer les fiches individuelles
  generateStudentSheets() {
    const content: any[] = [];

    // Générer une page par étudiant
    this.groupe.etudiantIds.forEach((etudiant, index) => {
      // Ajouter un saut de page avant chaque étudiant (sauf le premier)
      if (index > 0) {
        content.push({ text: '', pageBreak: 'before' });
      }

      // URL pour le QR code
      const qrCodeUrl = `https://interro.he-section.site/epreuve/${this.groupe._id}-${etudiant._id}`;

      // Contenu de la fiche étudiant
      content.push(
        // En-tête avec logo/titre
        {
          columns: [
            {
              width: '70%',
              stack: [
                {
                  text: 'FICHE D\'ÉPREUVE INDIVIDUELLE',
                  style: 'header',
                  margin: [0, 0, 0, 10]
                },
                {
                  text: `Étudiant ${index + 1} sur ${this.groupe.etudiantIds.length}`,
                  style: 'subheader',
                  color: '#6b7280'
                }
              ]
            },
            {
              width: '30%',
              qr: qrCodeUrl,
              fit: 120,
              alignment: 'right',
              margin: [0, 10, 0, 0]
            }
          ],
          margin: [0, 0, 0, 30]
        },

        // Informations de l'étudiant
        {
          table: {
            widths: ['25%', '75%'],
            body: [
              [
                { text: 'Nom:', style: 'labelStyle' },
                { text: etudiant.nom.toUpperCase(), style: 'valueStyle', bold: true }
              ],
              [
                { text: 'Post-nom:', style: 'labelStyle'},
                { text: etudiant.post_nom.toUpperCase(), style: 'valueStyle', bold: true }
              ],
              [
                { text: 'Prénom:', style: 'labelStyle' },
                { text: etudiant.prenom, style: 'valueStyle' }
              ],
              [
                { text: 'Matricule:', style: 'labelStyle' },
                { text: etudiant.matricule, style: 'valueStyle', bold: true }
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 25]
        },

        // Informations du groupe et cours
        {
          text: 'INFORMATIONS DE L\'ÉPREUVE',
          style: 'sectionHeader',
          margin: [0, 0, 0, 15]
        },
        
        {
          table: {
            widths: ['25%', '75%'],
            body: [
              [
                { text: 'Groupe:', style: 'labelStyle' },
                { text: this.groupe.designation, style: 'valueStyle' }
              ],
              [
                { text: 'Cours:', style: 'labelStyle' },
                { text: this.cours.designation, style: 'valueStyle' }
              ],
              [
                { text: 'Unité:', style: 'labelStyle' },
                { text: this.cours.unite, style: 'valueStyle' }
              ],
              [
                { text: 'Crédits:', style: 'labelStyle' },
                { text: `${this.cours.credit} ECTS`, style: 'valueStyle' }
              ],
              [
                { text: 'Série ID:', style: 'labelStyle' },
                { text: `#${this.serie._id.slice(-6)}`, style: 'valueStyle' }
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 25]
        },

        // Statistiques de l'épreuve
        {
          text: 'DÉTAILS DE L\'ÉPREUVE',
          style: 'sectionHeader',
          margin: [0, 0, 0, 15]
        },

        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                {
                  text: [
                    { text: this.serie.questions.length.toString(), fontSize: 20, bold: true, color: '#dc2626' },
                    { text: '\nQuestions', fontSize: 10, color: '#6b7280' }
                  ],
                  alignment: 'center',
                  fillColor: '#fef2f2',
                  margin: [0, 10, 0, 10]
                },
                {
                  text: [
                    { text: this.serie.questions.reduce((total, q) => total + q.pts, 0).toString(), fontSize: 20, bold: true, color: '#2563eb' },
                    { text: '\nPoints Total', fontSize: 10, color: '#6b7280' }
                  ],
                  alignment: 'center',
                  fillColor: '#eff6ff',
                  margin: [0, 10, 0, 10]
                },
                {
                  text: [
                    { text: this.getStatusText(this.groupe.statut), fontSize: 12, bold: true, color: this.getStatusColor(this.groupe.statut) },
                    { text: '\nStatut', fontSize: 10, color: '#6b7280' }
                  ],
                  alignment: 'center',
                  fillColor: '#f9fafb',
                  margin: [0, 10, 0, 10]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#e5e7eb',
            vLineColor: () => '#e5e7eb'
          },
          margin: [0, 0, 0, 30]
        },

        // Instructions
        {
          text: 'INSTRUCTIONS',
          style: 'sectionHeader',
          margin: [0, 0, 0, 15]
        },

        {
          ul: [
            'Scannez le QR code ci-dessus pour accéder à votre épreuve en ligne',
            'Vous devez vous connecter avec vos identifiants pour commencer',
            'L\'épreuve est limitée dans le temps selon les paramètres du groupe',
            'Assurez-vous d\'avoir une connexion internet stable',
            'En cas de problème technique, contactez immédiatement le surveillant'
          ],
          style: 'instructionsList',
          margin: [0, 0, 0, 30]
        },

        // Pied de page avec informations
        {
          columns: [
            {
              width: '30%',
              text: [
                { text: 'Document généré le: ', fontSize: 8, color: '#6b7280' },
                { text: new Date().toLocaleDateString('fr-FR'), fontSize: 8, color: '#374151' }
              ]
            },
            {
              width: '70%',
              text: [
                { text: 'URL d\'accès: ', fontSize: 8, color: '#6b7280' },
                { text: qrCodeUrl, fontSize: 7, color: '#374151' }
              ],
              alignment: 'right'
            }
          ],
          margin: [0, 40, 0, 0]
        }
      );
    });

    const documentDefinition: TDocumentDefinitions = {
      content,
      
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#1f2937'
        },
        subheader: {
          fontSize: 12,
          italics: true
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#7c3aed',
          decoration: 'underline'
        },
        labelStyle: {
          fontSize: 11,
          bold: true,
          color: '#374151'
        },
        valueStyle: {
          fontSize: 11,
          color: '#1f2937'
        },
        instructionsList: {
          fontSize: 10,
          color: '#4b5563'
        }
      },

      defaultStyle: {
        fontSize: 10
      },

      pageMargins: [40, 60, 40, 60]
    };

    const fileName = `fiches_etudiants_${this.groupe.designation.replace(/\s+/g, '_')}_${this.groupe._id.slice(-6)}.pdf`;
    pdfMake.createPdf(documentDefinition).download(fileName);
  }

  generatePdf() {
    const content: any[] = [
      // En-tête principal
      {
        text: 'FICHE DE GROUPE',
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 30]
      },

      // Informations du groupe
      {
        columns: [
          {
            width: '50%',
            stack: [
              {
                text: [
                  { text: 'Groupe: ', bold: true, color: '#7c3aed' },
                  { text: this.groupe.designation, color: '#1f2937' }
                ],
                margin: [0, 0, 0, 8]
              },
              {
                text: [
                  { text: 'Cours: ', bold: true, color: '#7c3aed' },
                  { text: this.cours.designation, color: '#1f2937' }
                ],
                margin: [0, 0, 0, 8]
              },
              {
                text: [
                  { text: 'Unité: ', bold: true, color: '#7c3aed' },
                  { text: this.cours.unite, color: '#1f2937' }
                ],
                margin: [0, 0, 0, 8]
              }
            ]
          },
          {
            width: '50%',
            stack: [
              {
                text: [
                  { text: 'Statut: ', bold: true, color: '#7c3aed' },
                  { text: this.getStatusText(this.groupe.statut), color: this.getStatusColor(this.groupe.statut) }
                ],
                margin: [0, 0, 0, 8]
              },
              {
                text: [
                  { text: 'Série ID: ', bold: true, color: '#7c3aed' },
                  { text: `#${this.serie._id.slice(-6)}`, color: '#1f2937' }
                ],
                margin: [0, 0, 0, 8]
              },
              {
                text: [
                  { text: 'Crédits: ', bold: true, color: '#7c3aed' },
                  { text: `${this.cours.credit} ECTS`, color: '#1f2937' }
                ],
                margin: [0, 0, 0, 8]
              }
            ]
          }
        ],
        margin: [0, 0, 0, 30]
      },

      // Statistiques
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              {
                text: [
                  { text: this.groupe.etudiantIds.length.toString(), fontSize: 24, bold: true, color: '#059669' },
                  { text: '\nÉtudiants inscrits', fontSize: 10, color: '#6b7280' }
                ],
                alignment: 'center',
                border: [false, false, false, false],
                fillColor: '#f0fdf4'
              },
              {
                text: [
                  { text: this.serie.questions.length.toString(), fontSize: 24, bold: true, color: '#dc2626' },
                  { text: '\nQuestions', fontSize: 10, color: '#6b7280' }
                ],
                alignment: 'center',
                border: [false, false, false, false],
                fillColor: '#fef2f2'
              },
              {
                text: [
                  { text: this.serie.questions.reduce((total, q) => total + q.pts, 0).toString(), fontSize: 24, bold: true, color: '#2563eb' },
                  { text: '\nPoints total', fontSize: 10, color: '#6b7280' }
                ],
                alignment: 'center',
                border: [false, false, false, false],
                fillColor: '#eff6ff'
              }
            ]
          ]
        },
        margin: [0, 0, 0, 30]
      }
    ];

    // Ajouter la liste des étudiants si il y en a
    if (this.groupe.etudiantIds.length > 0) {
      content.push({
        text: 'LISTE DES ÉTUDIANTS',
        style: 'sectionHeader',
        margin: [0, 0, 0, 15]
      });

      content.push({
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', '*'],
          body: [
            // En-tête du tableau
            [
              { text: 'N°', style: 'tableHeader' },
              { text: 'Matricule', style: 'tableHeader' },
              { text: 'Nom', style: 'tableHeader' },
              { text: 'Prénom', style: 'tableHeader' }
            ],
            // Données des étudiants
            ...this.groupe.etudiantIds.map((etudiant, index) => [
              { text: (index + 1).toString(), style: 'tableCell', alignment: 'center' },
              { text: etudiant.matricule, style: 'tableCell' },
              { text: etudiant.nom.toUpperCase(), style: 'tableCell' },
              { text: etudiant.prenom, style: 'tableCell' }
            ])
          ]
        },
        layout: {
          fillColor: function (rowIndex: number) {
            return rowIndex === 0 ? '#f3f4f6' : (rowIndex % 2 === 0 ? '#f9fafb' : null);
          },
          hLineWidth: function (i: number, node: any) {
            return i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5;
          },
          vLineWidth: function () {
            return 0.5;
          },
          hLineColor: function () {
            return '#e5e7eb';
          },
          vLineColor: function () {
            return '#e5e7eb';
          }
        },
        margin: [0, 0, 0, 30]
      });
    } else {
      content.push({
        text: 'Aucun étudiant assigné à ce groupe',
        style: 'emptyMessage',
        alignment: 'center',
        margin: [0, 20, 0, 30]
      });
    }

    // Pied de page
    content.push({
      columns: [
        {
          width: '50%',
          text: [
            { text: 'Document généré le: ', fontSize: 8, color: '#6b7280' },
            { text: new Date().toLocaleDateString('fr-FR'), fontSize: 8, color: '#374151' }
          ]
        },
        {
          width: '50%',
          text: [
            { text: 'Heure: ', fontSize: 8, color: '#6b7280' },
            { text: new Date().toLocaleTimeString('fr-FR'), fontSize: 8, color: '#374151' }
          ],
          alignment: 'right'
        }
      ],
      margin: [0, 40, 0, 0]
    });

    const documentDefinition: TDocumentDefinitions = {
      content,

      styles: {
        header: {
          fontSize: 20,
          bold: true,
          color: '#1f2937'
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#7c3aed'
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: '#374151',
          fillColor: '#f3f4f6'
        },
        tableCell: {
          fontSize: 10,
          color: '#4b5563'
        },
        emptyMessage: {
          fontSize: 12,
          color: '#9ca3af',
          italics: true
        }
      },

      defaultStyle: {
        fontSize: 10
      },

      pageMargins: [40, 60, 40, 60]
    };

    pdfMake.createPdf(documentDefinition).download(`groupe_${this.groupe.designation.replace(/\s+/g, '_')}_${this.groupe._id.slice(-6)}.pdf`);
  }

  // Méthodes utilitaires
  private getStatusText(statut: string): string {
    switch (statut) {
      case 'OK': return 'Validé';
      case 'PENDING': return 'En attente';
      case 'NO': return 'Non assigné';
      default: return statut;
    }
  }

  private getStatusColor(statut: string): string {
    switch (statut) {
      case 'OK': return '#059669';
      case 'PENDING': return '#d97706';
      case 'NO': return '#6b7280';
      default: return '#6b7280';
    }
  }
}

export default PdfGroupe;
