var express = require('express');
var router = express.Router();
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true });
var bodyParser = require('body-parser');
var parseForm = bodyParser.urlencoded({extended: false});
var userModel = require('../models/User');
var bcrypt = require('bcrypt');


// login
router.get('/login', csrfProtection, function(req, res) {
    res.render('auth/login', { csrfToken: req.csrfToken() });
});

router.post('/login', parseForm, csrfProtection, async function(req, res) {
    const {
        email,
        password
    } = req.body;

    userModel.findOne({email: email}, (error, user) => {
        if (user) {
            bcrypt.compare(password, user.password, (error, same) => {
                if (same) {
                    req.session.userId = user._id;
                    req.flash('success', 'Login Successful');
                    return res.redirect('/');
                } else {
                    req.flash('danger', 'Wrong Credentials');
                    return res.redirect('/auth/login');
                }
            })
        } else {
            req.flash('danger', 'Wrong Credentials');
            return res.redirect('/auth/login');
        }
    })
});

router.get('/logout', function(req, res){
    req.session.destroy();
    return res.redirect('/');
});

module.exports = router;