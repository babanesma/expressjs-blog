const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const PostSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            unique: true
        },
        title: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        published: {
            type: Boolean,
            default: false
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        tags: {
            type: mongoose.Schema.Types.Array,
        }
    },
    {
        timestamps: true,
    }
);

PostSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Post", PostSchema);
