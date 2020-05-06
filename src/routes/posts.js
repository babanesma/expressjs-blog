const express = require('express');
const router = express.Router();
const postsModel = require('../models/Post');
const mediaModel = require('../models/Media');
const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true });
const bodyParser = require('body-parser');
const parseForm = bodyParser.urlencoded({ extended: false });
const requireLogin = require('../middlewares/requireLogin');
const slugify = require('slugify');
const moment = require('moment');
const marked = require('marked');
const fs = require('fs-extra');
const path = require('path');

router.get('/create', requireLogin, csrfProtection, (req, res) => {
    res.render('posts/form', {
        csrfToken: req.csrfToken(),
        title: 'Create New Post',
        submit_text: 'Create'
    });
});

router.post('/store', requireLogin, parseForm, csrfProtection, async (req, res) => {

    try {
        let tags_input = req.body.tags;
        let tags = tags_input.split(',');
        tags = tags.filter((t) => t.length > 0);

        let post = {
            title: req.body.title,
            summary: req.body.summary,
            content: req.body.content,
            published: req.body.published || false,
            user: req.session.userId,
            slug: slugify(req.body.title),
            tags: tags
        }

        let createdPost = await postsModel.create(post)
        req.flash('success', 'Post Created Successfully');
        res.redirect('/posts/' + createdPost.slug);
    } catch (err) {
        req.flash('warning', err.message);
        res.redirect('back');
    }
});

router.get('/edit/:id', requireLogin, csrfProtection, async (req, res) => {
    let post = await postsModel.findOne({
        _id: req.params.id
    });

    return res.render('posts/form', {
        csrfToken: req.csrfToken(),
        title: 'Edit Post',
        post: post,
        post_tags: post.tags.join(','),
        submit_text: 'Update'
    });
});

router.post('/update/:id', requireLogin, parseForm, csrfProtection, async (req, res) => {
    try {
        let tags_input = req.body.tags;
        let tags = tags_input.split(',');
        tags = tags.filter((t) => t.length > 0);

        let post = {
            title: req.body.title,
            summary: req.body.summary,
            content: req.body.content,
            published: req.body.published || false,
            tags: tags
        }

        updatedPost = await postsModel.findOneAndUpdate({ _id: req.params.id }, post)
        req.flash('success', 'Post Updated Successfully');
        res.redirect('/posts/' + updatedPost.slug);
    } catch (err) {
        req.flash('warning', err);
        res.redirect('back');
    }
});

router.get('/:slug', async (req, res) => {
    try {
        let post = await postsModel.findOne({ slug: req.params.slug }).populate('user');
        post.fromNow = moment(post.createdAt).fromNow();
        post.author = post.user.firstname + ' ' + post.user.lastname;
        post.summary = marked(post.summary);
        post.content = marked(post.content)
        return res.render('posts/post', {
            post: post
        });
    } catch (error) {
        req.flash('warning', error.message);
        res.redirect('back');
    }
});

router.get('/delete/:id', requireLogin, csrfProtection, async (req, res) => {
    try {
        let post = await postsModel.findOne({ _id: req.params.id });

        res.render('posts/delete', {
            post: post,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        req.flash('warning', error.message);
        res.redirect('back');
    }
})

router.post('/delete/:id', requireLogin, csrfProtection, async (req, res) => {
    try {
        await postsModel.remove({ _id: req.params.id });
        req.flash('danger', 'Post Deleted !');
        res.redirect('/posts');
    } catch (error) {
        req.flash('warning', error.message);
        res.redirect('back');
    }
});

router.post('/upload', requireLogin, async (req, res) => {
    let fileResponse = [];
    for (const f in req.files) {
        if (req.files.hasOwnProperty(f)) {
            const currentFile = req.files[f];
            let basePath = path.join(__dirname, '..', '..');
            let d = new Date();
            let uploadsPath = path.join('uploads',
                d.getFullYear().toString(), d.getMonth().toString());
            fs.mkdirp(path.join(basePath, uploadsPath));

            console.log(currentFile, path.join(basePath, uploadsPath));
            // await fs.move(currentFile.tempFilePath, path.join(basePath, uploadsPath));
            await fs.writeFile(path.join(basePath, uploadsPath, currentFile.name), currentFile.data, 'binary');
            let createdMedia = await mediaModel.create({
                path: path.join(uploadsPath, currentFile.name),
                mimetype: currentFile.mimetype
            });
            fileResponse.push('/posts/media/' + createdMedia._id);
        }
    }
    res.json(fileResponse);
});

router.get('/media/:id', requireLogin, async (req, res) => {
    let mediaFile = await mediaModel.findOne({ _id: req.params.id });
    res.sendFile(path.resolve(__dirname , '..', '..', mediaFile.path), {
        headers: {
            'Content-Type': mediaFile.mimetype
        }
    });
});

module.exports = router;