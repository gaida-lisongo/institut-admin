"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DataTable, { Column } from "@/components/common/DataTable";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import TiptapEditor from "@/components/common/TiptapEditor";
import { useAnneeStore } from "@/stores/anneeStore";
import { useSectionStore } from "@/stores/sectionStore";
import { useModal } from "@/hooks/useModal";
import { Article, Annee } from "@/services/AnneeService";
import BlobManager from "@/services/BlobManager";

export default function AnneeDetail() {
  const params = useParams();
  const router = useRouter();
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: "",
    content: "",
    author: "",
    tags: [] as string[],
    image: "",
    sectionId: "",
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    selectedAnnee,
    isLoading,
    error,
    fetchAnnee,
    updateAnnee,
    clearError,
  } = useAnneeStore();

  const { sections, fetchSections } = useSectionStore();

  const blobManager = BlobManager;

  useEffect(() => {
    if (params.id) {
      fetchAnnee(params.id as string);
      fetchSections();
    }
  }, [params.id, fetchAnnee, fetchSections]);

  const columns: Column<Article>[] = [
    {
      key: "title",
      header: "Titre",
      sortable: true,
    },
    {
      key: "author",
      header: "Auteur",
      sortable: true,
    },
    {
      key: "date",
      header: "Date",
      render: (article) => 
        article.date ? new Date(article.date).toLocaleDateString('fr-FR') : "",
      sortable: true,
    },
    {
      key: "sectionId",
      header: "Section",
      render: (article) => {
        const section = sections.find(s => s._id === article.sectionId);
        return section?.description?.designation || "Section inconnue";
      },
      sortable: false,
    },
    {
      key: "tags",
      header: "Tags",
      render: (article) => (
        <div className="flex flex-wrap gap-1">
          {article.tags?.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-300"
            >
              {tag}
            </span>
          ))}
          {(article.tags?.length || 0) > 3 && (
            <span className="text-xs text-gray-500">+{(article.tags?.length || 0) - 3}</span>
          )}
        </div>
      ),
      sortable: false,
    },
  ];

  const handleAddArticle = () => {
    setSelectedArticle(null);
    setArticleForm({
      title: "",
      content: "",
      author: "",
      tags: [],
      image: "",
      sectionId: "",
    });
    openModal();
  };

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setArticleForm({
      title: article.title,
      content: article.content,
      author: article.author,
      tags: article.tags || [],
      image: article.image || "",
      sectionId: article.sectionId,
    });
    openModal();
  };

  const handleDeleteArticle = async (article: Article) => {
    if (!selectedAnnee || !confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      return;
    }

    const updatedArticles = selectedAnnee.articles.filter(
      (a, index) => 
        !(a.title === article.title && a.author === article.author && a.sectionId === article.sectionId)
    );

    if (selectedAnnee._id) {
      await updateAnnee(selectedAnnee._id, { articles: updatedArticles });
      fetchAnnee(selectedAnnee._id);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await blobManager.createBlob(file, {
        type: "article-image",
        anneeId: selectedAnnee?._id,
        articleTitle: articleForm.title,
      });
      
      setArticleForm(prev => ({ ...prev, image: result.url }));
    } catch (error) {
      console.error("Erreur upload image:", error);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAnnee || !articleForm.title || !articleForm.content || !articleForm.sectionId) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const newArticle: Article = {
      ...articleForm,
      date: selectedArticle?.date || new Date().toISOString(),
    };

    let updatedArticles;
    if (selectedArticle) {
      // Mise à jour
      const articleIndex = selectedAnnee.articles.findIndex(
        (a) => a.title === selectedArticle.title && a.author === selectedArticle.author
      );
      updatedArticles = [...selectedAnnee.articles];
      if (articleIndex >= 0) {
        updatedArticles[articleIndex] = newArticle;
      }
    } else {
      // Ajout
      updatedArticles = [...selectedAnnee.articles, newArticle];
    }

    if (selectedAnnee._id) {
      const success = await updateAnnee(selectedAnnee._id, { articles: updatedArticles });
      if (success) {
        closeModal();
        fetchAnnee(selectedAnnee._id);
      }
    }
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setArticleForm(prev => ({ ...prev, tags }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-center justify-between">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button onClick={clearError} className="text-red-600 hover:text-red-800">
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (!selectedAnnee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Année académique non trouvée</p>
        <Button className="mt-4" onClick={() => router.push("/annees")}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/annees")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Retour à la liste
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Année Académique {selectedAnnee.debut}-{selectedAnnee.fin}
          </h1>
        </div>
      </div>

      {/* Info Année */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
            <p><strong>Période:</strong> {selectedAnnee.debut} - {selectedAnnee.fin}</p>
            <p><strong>Nombre d'articles:</strong> {selectedAnnee.articles?.length || 0}</p>
          </div>
          {selectedAnnee.motDg?.photo && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Photo du Directeur Général</h3>
              <img
                src={selectedAnnee.motDg.photo}
                alt="Photo DG"
                className="w-24 h-24 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Articles */}
      <DataTable
        data={selectedAnnee.articles.map((article, index) => ({ ...article, _id: `article-${index}` }))}
        columns={columns}
        searchPlaceholder="Rechercher un article..."
        onAdd={handleAddArticle}
        onEdit={(item) => {
          const originalIndex = parseInt(item._id?.replace('article-', '') || '0');
          handleEditArticle(selectedAnnee.articles[originalIndex]);
        }}
        onDelete={(item) => {
          const originalIndex = parseInt(item._id?.replace('article-', '') || '0');
          handleDeleteArticle(selectedAnnee.articles[originalIndex]);
        }}
        addButtonText="Nouvel article"
      />

      {/* Modal Article */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-4xl p-6">
        <h4 className="font-semibold text-gray-800 mb-6 text-title-sm dark:text-white/90">
          {selectedArticle ? "Modifier l'article" : "Créer un nouvel article"}
        </h4>

        <form onSubmit={handleSaveArticle} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={articleForm.title}
                onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auteur *
              </label>
              <input
                type="text"
                value={articleForm.author}
                onChange={(e) => setArticleForm(prev => ({ ...prev, author: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Section *
            </label>
            <select
              value={articleForm.sectionId}
              onChange={(e) => setArticleForm(prev => ({ ...prev, sectionId: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Choisir une section</option>
              {sections.map((section) => (
                <option key={section._id} value={section._id}>
                  {section.description.designation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              value={articleForm.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image de l'article
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {uploading ? "Upload..." : "Choisir une image"}
              </button>
              {articleForm.image && (
                <img
                  src={articleForm.image}
                  alt="Image article"
                  className="w-12 h-12 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenu *
            </label>
            <TiptapEditor
              content={articleForm.content}
              onChange={(content: string) => setArticleForm(prev => ({ ...prev, content }))}
              placeholder="Rédigez le contenu de l'article..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" onClick={closeModal}>
              Annuler
            </Button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {selectedArticle ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
