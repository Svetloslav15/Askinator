module.exports = {
    isAuthed: (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/auth/login');
        }
    },
    hasRole: (role) => (req, res, next) => {
        if (req.isAuthenticated() &&
            req.user.roles.indexOf(role) > -1) {
            next();
        } else {
            res.redirect('/auth/login');
        }
    },
	isAnonymous: (req, res, next) => {
        if (!req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/');
        }
    }
}