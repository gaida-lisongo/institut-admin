import mongoose from "mongoose";

const EtudiantSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    sexe: {
        type: String,
        required: true
    },
    classeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Classe",
        required: true
    }
});

const Etudiant = mongoose.models.Etudiant || mongoose.model("Etudiant", EtudiantSchema);

export default Etudiant;
