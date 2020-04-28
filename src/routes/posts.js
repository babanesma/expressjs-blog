var express = require('express');
var router = express.Router();
var postModel = require('../models/Post');
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true });
var bodyParser = require('body-parser');
var parseForm = bodyParser.urlencoded({ extended: false });
var requireLogin = require('../middlewares/requireLogin');

router.get('/', (req, res) => {
    res.render('posts/list');
});

router.get('/create', requireLogin, csrfProtection, (req, res) => {
    res.render('posts/form', { csrfToken: req.csrfToken() });
});

router.post('/store', requireLogin, parseForm, csrfProtection, (req, res) => {
    post = {
        title: req.body.title,
        summary: req.body.summary,
        content: req.body.content,
        published: req.body.published || false,
        user: req.session.userId
    }

    postModel.create(post, function (err, p) {
        if (err) {
            req.flash('warning', err);
            res.redirect('back');
        } else {
            req.flash('success', 'Post Created successfully');
            res.redirect('/posts');
        }
    });
});

module.exports = router;