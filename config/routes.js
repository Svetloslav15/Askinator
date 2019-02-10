const controllers = require('../controllers');
const restrictedPages = require('./auth');

module.exports = app => {
    app.get('/', controllers.home.index);

    app.get('/auth/register', restrictedPages.isAnonymous, controllers.auth.registerGet);
    app.post('/auth/register', restrictedPages.isAnonymous, controllers.auth.registerPost);
    app.get('/auth/login', restrictedPages.isAnonymous, controllers.auth.loginGet);
    app.post('/auth/login', restrictedPages.isAnonymous, controllers.auth.loginPost);
    app.post('/auth/logout', restrictedPages.isAuthed, controllers.auth.logout);

    app.get('/search-user', restrictedPages.isAuthed, controllers.home.searchUser);
    app.get('/profile/:username', controllers.home.getUserByUsername);
    app.get('/my-profile', restrictedPages.isAuthed, controllers.home.myProfileGet);

    app.post('/questions/ask/:userId', controllers.home.askQuestion);
    app.post('/questions/answer/:id', controllers.home.answerQuestion);
    app.get('/questions/delete/:id', controllers.home.deleteQuestion);

    app.get('/search/filtered', restrictedPages.isAuthed, controllers.home.searchFilter);

    app.all('*', (req, res) => {
        res.status(404);
        res.send('404 Not Found');
        res.end();
    });
};