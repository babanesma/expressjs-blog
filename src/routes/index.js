const express = require('express');
const router = express.Router();
const moment = require('moment');
const postsModel = require('../models/Post');

router.get('/:page?', async (req, res, next) => {
    try {
        let query = {};
        if (!req.session.userId) {
            query.published = true
        }
        let options = {
            sort: { createdAt: 'desc' },
            populate: 'user',
            page: req.params.page || 1,
            limit: process.env.PAGE_MAX || 10
        };
        let posts = await postsModel.paginate(query, options);

        posts.docs.forEach(p => {
            p.fromNow = moment(p.createdAt).fromNow();
            p.author = p.user.firstname + ' ' + p.user.lastname;
        });

        res.render('posts/index', {
            posts: posts
        });

    } catch (err) {
        req.flash('warning', err.message);
        next(err);
    }
});

module.exports = router;
