import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
    enonce: {
        type: [String],
        required: true
    },
    reponse: {
        type: Number,
        required: true
    },
    choix: {
        type: [String],
        required: true
    },
    pts: {
        type: Number,
        required: true
    }
});

// Supprimer le modèle du cache s'il existe pour forcer la mise à jour
if (mongoose.models.Question) {
    delete mongoose.models.Question;
}

const Question = mongoose.model("Question", QuestionSchema);

export default Question;
