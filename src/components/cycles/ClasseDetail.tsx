"use client";

import { useEffect, useState } from "react";
import { Annee } from "@/services/AnneeService";
import { Classe, Cycle } from "@/services/CycleService";
import { Etudiant } from "@/types/etudiant";
import { exportEtudiantsExcel } from "@/utils/exportEtudiants";

interface ClasseProps {
  cycle: Cycle;
  classe: Classe;
  annee: Annee;
  onBack: () => void;
}

interface Inscription {
    _id: string;
    etudiant: Etudiant;
    classe: string;
    annee: Annee;
    status: "PENDING" | "OK" | "NO";
    faculteId: string;
    etabId: string;
    createdAt: Date;
}

const ClasseDetail = ({ cycle, classe, annee, onBack }: ClasseProps) => {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [search, setSearch] = useState("");

  const fetchInscrits = async () => {
    try {
      const request = await fetch(
        `http://192.168.1.65:4003/api/v1/etudiant/parcours/classe/${classe._id}/annee/${annee._id}`
      );
      const response = await request.json();
      if (!response.success) throw new Error(response.message);
      setInscriptions(response.data || []);
    } catch (error) {
      console.error("Erreur de chargement :", error);
    }
  };

  const updateInscrit = async (
    id: string,
    status: "PENDING" | "OK" | "NO"
  ) => {
    try {
      const res = await fetch(
        `http://192.168.1.65:4003/api/v1/etudiant/parcours/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // Update local state
      setInscriptions((prev) =>
        prev.map((i) => (i._id === id ? { ...i, status } : i))
      );
    } catch (error) {
      console.error("Erreur de mise à jour :", error);
    }
  };

  const deleteInscrit = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette inscription ?")) return;
    try {
      await fetch(`http://192.168.1.65:4003/api/v1/etudiant/parcours/${id}`, {
        method: "DELETE",
      });
      setInscriptions((prev) => prev.filter((i) => i._id !== id));
    } catch (error) {
      console.error("Erreur de suppression :", error);
    }
  };

  useEffect(() => {
    const fetchAndSort = async () => {
        try {
        const request = await fetch(
            `http://192.168.1.65:4003/api/v1/etudiant/parcours/classe/${classe._id}/annee/${annee._id}`
        );
        const response = await request.json();
        if (!response.success) throw new Error(response.message);

        const sorted = (response.data || []).sort((a : Inscription, b: Inscription) =>
            a.etudiant.nom.localeCompare(b.etudiant.nom)
        );
        setInscriptions(sorted);
        } catch (error) {
        console.error("Erreur de chargement :", error);
        }
    };

    fetchAndSort();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OK":
        return "#4CAF50";
      case "NO":
        return "#F44336";
      default:
        return "#FFC107";
    }
  };

  const filtered = inscriptions.filter((i) => {
    const name = `${i.etudiant.nom} ${i.etudiant.post_nom || ""} ${
      i.etudiant.prenom || ""
    }`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div style={{ padding: "24px", fontFamily: "Segoe UI, sans-serif", backgroundColor: "#f5f5f7", minHeight: "100vh" }}>
      {/* --- Header --- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button
          onClick={onBack}
          style={{
            background: "#e0e0e0",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          ← Retour
        </button>
        <h2 style={{ margin: 0 }}>{cycle.designation} – {classe.designation}</h2>
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            outline: "none",
            width: "220px"
          }}
        />
        
        <button
        onClick={() => exportEtudiantsExcel(inscriptions.map(i => i.etudiant), `${classe.designation}_${annee.debut}-${annee.fin}`)}
        style={{
            backgroundColor: "#2563EB",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "6px",
            marginBottom: "16px",
            border: "none",
            cursor: "pointer"
        }}
        >
        Exporter en Excel
        </button>
      </div>

      {/* --- Cartes des étudiants --- */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filtered.map((insc) => {
          const { etudiant, status, _id } = insc;
          const initials = `${etudiant.nom[0]}${etudiant.prenom[0]}`.toUpperCase();
          return (
            <div
              key={_id}
              style={{
                display: "flex",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                overflow: "hidden",
                width: "100%",
                minHeight: "120px"
              }}
            >
              {/* Photo / Initiales */}
              <div
                style={{
                  width: "20%",
                  backgroundColor: "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#555",
                }}
              >
                {etudiant.photo ? (
                  <img
                    src={etudiant.photo}
                    alt={etudiant.nom}
                    style={{ width: "80%", height: "80%", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  initials
                )}
              </div>

              {/* Info */}
              <div style={{ width: "80%", padding: "12px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#222" }}>
                    {etudiant.nom} {etudiant.post_nom} {etudiant.prenom}
                  </h3>

                  {/* Switch & Delete */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {/* Switch */}
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={status === "OK"}
                        onChange={(e) => updateInscrit(_id, e.target.checked ? "OK" : "NO")}
                        style={{ display: "none" }}
                      />
                      <span style={{
                        width: "40px",
                        height: "20px",
                        background: status === "OK" ? "#4CAF50" : "#ccc",
                        borderRadius: "20px",
                        position: "relative",
                        transition: "background 0.3s"
                      }}>
                        <span style={{
                          position: "absolute",
                          top: "2px",
                          left: status === "OK" ? "20px" : "2px",
                          width: "16px",
                          height: "16px",
                          background: "#fff",
                          borderRadius: "50%",
                          transition: "left 0.3s"
                        }}></span>
                      </span>
                    </label>

                    {/* Delete Button with SVG */}
                    <button
                      onClick={() => deleteInscrit(_id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      title="Supprimer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="red" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm2 3h14v13H5V9zm3 2v9h2v-9H8zm4 0v9h2v-9h-2z"/></svg>
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", color: "#555", fontSize: "14px" }}>
                  <div>
                    <p style={{ margin: "2px 0" }}><strong>Matricule:</strong> {etudiant.matricule}</p>
                    <p style={{ margin: "2px 0" }}><strong>Nationalité:</strong> {etudiant.nationalite}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: "2px 0" }}><strong>Date inscription:</strong> {new Date(insc.createdAt).toLocaleDateString()}</p>
                    <p style={{ margin: "2px 0" }}>
                      <strong>Status:</strong>{" "}
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        backgroundColor: getStatusColor(status),
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "12px"
                      }}>
                        {status === "OK" ? "Validé" : status === "NO" ? "Refusé" : "En attente"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && <p style={{ textAlign: "center", marginTop: "40px", color: "#777" }}>Aucun résultat trouvé pour "{search}"</p>}
      </div>
    </div>
  );
};

export default ClasseDetail;
