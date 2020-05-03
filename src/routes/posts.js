const express = require('express');
const router = express.Router();
const postsModel = require('../models/Post');
const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true });
const bodyParser = require('body-parser');
const parseForm = bodyParser.urlencoded({ extended: false });
const requireLogin = require('../middlewares/requireLogin');
const slugify = require('slugify');
const moment = require('moment')

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
        await postsModel.remove({_id: req.params.id});
        req.flash('danger', 'Post Deleted !');
        res.redirect('/posts');
    } catch (error) {
        req.flash('warning', error.message);
        res.redirect('back');
    }
});

module.exports = router;