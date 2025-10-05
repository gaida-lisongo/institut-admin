import mongoose from "mongoose";

const ReponseSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
    },
    reponse: {
        type: String,
        required: true
    },
    note: {
        type: Number,
        required: true
    },
    statut: {
        type: String,
        required: true
    }
});

const ResolutionSchema = new mongoose.Schema({
    etudiantId: {
        type: String,
        required: true
    },
    reponses: {
        type: [ReponseSchema],
        required: false
    },
    note: {
        type: Number,
        required: true
    },
    statut: {
        type: String,
        required: true
    },
    dateDebut: {
        type: Date,
        required: false
    },
    dateFin: {
        type: Date,
        required: false
    },
    tempsEcoule: {
        type: Number,
        required: false
    }
});

const Resolution = mongoose.models.Resolution || mongoose.model("Resolution", ResolutionSchema);

export default Resolution;
