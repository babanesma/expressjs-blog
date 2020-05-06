const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Media", MediaSchema);
