const express = require('express');
const router = express.Router();
const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true });
const bodyParser = require('body-parser');
const parseForm = bodyParser.urlencoded({extended: false});
const userModel = require('../models/User');
const bcrypt = require('bcrypt');

// login
router.get('/login', csrfProtection, function(req, res) {
    res.render('auth/login', { csrfToken: req.csrfToken() });
});

router.post('/login', parseForm, csrfProtection, async function(req, res) {
    const {
        email,
        password
    } = req.body;

    let redirectTo = req.query.redirectTo;
    userModel.findOne({email: email}, (error, user) => {
        if (user) {
            bcrypt.compare(password, user.password, (error, same) => {
                if (same) {
                    req.session.userId = user._id;
                    req.flash('success', 'Login Successful');
                    res.redirect(redirectTo || '/');
                } else {
                    req.flash('danger', 'Wrong Credentials');
                    res.redirect('back');
                }
            })
        } else {
            req.flash('danger', 'Wrong Credentials');
            res.redirect('back');
        }
    })
});

router.get('/logout', function(req, res){
    req.session.destroy();
    return res.redirect('/');
});

module.exports = router;