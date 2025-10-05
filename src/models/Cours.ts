import mongoose from "mongoose";

const CoursSchema = new mongoose.Schema({
    designation: {
        type: String,
        required: true
    },
    credit: {
        type: Number,
        required: true
    },
    unite: {
        type: String,
        required: true
    }
});

const Cours = mongoose.models.Cours || mongoose.model("Cours", CoursSchema);

export default Cours;
