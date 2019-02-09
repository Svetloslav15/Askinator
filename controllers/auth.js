const encryption = require('../util/encryption');
const User = require('mongoose').model('User');

module.exports = {
    registerGet: (req, res) => {
        res.render('users/register');
    },
    registerPost: async (req, res) => {
        const reqUser = req.body;
        let {username, email, password, repeatPassword, firstName, lastName} = reqUser;
        if (username.trim() === "" || email.trim() === "" || firstName.trim() === "" ||
            lastName.trim() === "" || password.trim() === "" || password.trim() !== repeatPassword.trim()){
            res.locals.globalError = 'Fields are required!';
            res.render('users/register', user);
        }
        console.log(reqUser);
        const salt = encryption.generateSalt();
        const hashedPass = encryption.generateHashedPassword(salt, reqUser.password);
        try {
            const user = await User.create({
                username: reqUser.username,
                email: reqUser.email,
                hashedPass,
                salt,
                firstName: reqUser.firstName,
                lastName: reqUser.lastName,
                roles: ['User']
            });
            req.logIn(user, (err, user) => {
                if (err) {
                    res.locals.globalError = err;
                    res.render('users/register', user);
                } else {
                    res.redirect('/');
                }
            });
        } catch (e) {
            res.locals.globalError = e;
            res.render('users/register');
        }
    },
    logout: (req, res) => {
        req.logout();
        res.redirect('/');
    },
    loginGet: (req, res) => {
        res.render('users/login');
    },
    loginPost: async (req, res) => {
        const reqUser = req.body;
        try {
            const user = await User.findOne({ username: reqUser.username });
            if (!user) {
                errorHandler('Invalid user data');
                return;
            }
            if (!user.authenticate(reqUser.password)) {
                errorHandler('Invalid user data');
                return;
            }
            req.logIn(user, (err, user) => {
                if (err) {
                    errorHandler(err);
                } else {
                    res.redirect('/');
                }
            });
        } catch (e) {
            errorHandler(e);
        }

        function errorHandler(e) {
            console.log(e);
            res.locals.globalError = e;
            res.render('users/login');
        }
    }
};