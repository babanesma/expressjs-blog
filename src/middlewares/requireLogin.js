requireLogin = function (req, res, next) {
    if (!req.session.userId) {
        req.flash('warning', 'Page Not Allowed');
        res.redirect('/auth/login?redirectTo=' + req.originalUrl);
    }
    next()
}

module.exports = requireLogin