import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    createdAt: Date,
    updatedAt: Date,
},{timestamps: true});

export default mongoose.model('media', userSchema);