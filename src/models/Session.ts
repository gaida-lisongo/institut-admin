import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
    designation: {
        type: String,
        required: true
    },
    statut: {
        type: String,
        required: true
    },
    questions: {
        type: [String],
        required: true
    },
    coursId: {
        type: String,
        required: true
    },
    maximum: {
        type: Number,
        required: false,
        default: 0
    }
});

const Session = mongoose.models.Session || mongoose.model("Session", SessionSchema);

export default Session;
