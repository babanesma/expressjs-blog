const express = require('express');
const router = express.Router();
const moment = require('moment');
const postsModel = require('../models/Post');

router.get('/', async (req, res, next) => {
    try {
        let posts = await postsModel.find({}).sort({ createdAt: -1 }).populate('user');
        posts.forEach(p => {
            p.fromNow = moment(p.createdAt).fromNow();
            p.author = p.user.firstname + ' ' + p.user.lastname;
        });
        res.render('posts/index', {
            posts: posts
        });
    } catch (err) {
        req.flash('warning', err.message);
        res.redirect('back');
    }
});

module.exports = router;
