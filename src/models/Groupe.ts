import mongoose from "mongoose";

const GroupeSchema = new mongoose.Schema({
    designation: {
        type: String,
        required: true
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: true
    },
    resolutions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Resolution",
        required: true
    },
    dateCreation: {
        type: Date,
        required: true
    },
    dateOuverture: {
        type: Date,
        required: true
    },
    dateFermeture: {
        type: Date,
        required: true
    },
    statut: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dureeMaximale: {
        type: Number,
        required: true
    },
    tentativesMax: {
        type: Number,
        required: true
    }
});

const Groupe = mongoose.models.Groupe || mongoose.model("Groupe", GroupeSchema);

export default Groupe;
