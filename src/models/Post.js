const mongoose = require("mongoose");
const slugify = require('slugify');

const PostSchema = new mongoose.Schema(
    {
        slug: {
            type: String
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
    },
    {
        timestamps: true,
    }
);

PostSchema.pre("create", function (next) {
    const post = this;
    post.slug = slugify(post.title, {
        lower: true,
        strip: true
    });
});

module.exports = mongoose.model("Post", PostSchema);
