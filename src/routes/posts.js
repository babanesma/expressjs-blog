var express = require('express');
var router = express.Router();
var postsModel = require('../models/Post');
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true });
var bodyParser = require('body-parser');
var parseForm = bodyParser.urlencoded({ extended: false });
var requireLogin = require('../middlewares/requireLogin');
const slugify = require('slugify');
const moment = require('moment')

router.get('/', async (req, res, next) => {
    try {
        posts = await postsModel.find({}).sort({createdAt: -1});
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
    res.render('posts/form', { csrfToken: req.csrfToken() });
});

router.post('/store', requireLogin, parseForm, csrfProtection, async (req, res) => {

    try {
        post = {
            title: req.body.title,
            summary: req.body.summary,
            content: req.body.content,
            published: req.body.published || false,
            user: req.session.userId,
            slug: slugify(req.body.title)
        }

        createdPost = await postsModel.create(post)
        req.flash('success', 'Post Created successfully');
        res.redirect('/posts');
    } catch (err) {
        req.flash('warning', err);
        res.redirect('back');
    }
});

module.exports = router;