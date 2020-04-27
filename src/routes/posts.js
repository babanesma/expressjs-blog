var express = require('express');
var router = express.Router();
var postModel = require('../models/Post');


router.get('/', (req, res) => {
    var posts = postModel.find({});
    var isAdmin = req.session.userId ? true : false

    return res.render('posts/list', {
        posts: posts,
        isAdmin: isAdmin
    });
});

router.get('/create', (req, res) => {
    res.render('posts/form');
});

module.exports = router;