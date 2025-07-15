import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: false
    },
    index: Number,
    createdAt: Date,
    updatedAt: Date,
},{timestamps: true});

export default mongoose.model('genre', userSchema);