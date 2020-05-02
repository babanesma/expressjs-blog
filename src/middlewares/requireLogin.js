requireLogin = function (req, res, next) {
    if (!req.session.userId) {
        req.flash('warning', 'Page Not Allowed');
        return res.redirect('/auth/login?redirectTo=' + req.originalUrl);
    }
    return next();
}

module.exports = requireLogin