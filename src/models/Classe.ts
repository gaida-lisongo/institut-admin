import mongoose from "mongoose";

const ClasseSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    niveau: {
        type: String,
        required: true
    }
});

const Classe = mongoose.models.Classe || mongoose.model("Classe", ClasseSchema);

export default Classe;
