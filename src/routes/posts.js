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

router.get('/', async (req, res, next) => {
    try {
        let posts = await postsModel.find({}).sort({ createdAt: -1 }).populate('user');
        posts.forEach(p => {
            p.fromNow = moment(p.createdAt).fromNow()
        });
        res.render('posts/list', {
            posts: posts
        });
    } catch (err) {
        req.flash('warning', err.message);
        res.redirect('back');
    }
});

router.get('/create', requireLogin, csrfProtection, (req, res) => {
    res.render('posts/form', {
        csrfToken: req.csrfToken(),
        title: 'Create New Post',
        submit_text: 'Create'
    });
});

router.post('/store', requireLogin, parseForm, csrfProtection, async (req, res) => {

    try {
        let post = {
            title: req.body.title,
            summary: req.body.summary,
            content: req.body.content,
            published: req.body.published || false,
            user: req.session.userId,
            slug: slugify(req.body.title)
        }

        let createdPost = await postsModel.create(post)
        req.flash('success', 'Post Created Successfully');
        res.redirect('/posts/' + createdPost.slug);
    } catch (err) {
        req.flash('warning', err);
        res.redirect('back');
    }
});

router.get('/edit/:id', requireLogin, csrfProtection, async (req, res) => {
    let post = await postsModel.findOne({
        _id: req.params.id
    })

    return res.render('posts/form', {
        csrfToken: req.csrfToken(),
        title: 'Edit Post',
        post: post,
        submit_text: 'Update'
    });
})

router.post('/update/:id', requireLogin, parseForm, csrfProtection, async (req, res)=>{
    try {
        let post = {
            title: req.body.title,
            summary: req.body.summary,
            content: req.body.content,
            published: req.body.published || false
        }

        updatedPost = await postsModel.findOneAndUpdate({_id: req.params.id} , post)
        req.flash('success', 'Post Updated Successfully');
        res.redirect('/posts/' + updatedPost.slug);
    } catch (err) {
        req.flash('warning', err);
        res.redirect('back');
    }
})

module.exports = router;