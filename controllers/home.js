const User = require('mongoose').model('User');
const Message = require('mongoose').model('Message');

module.exports = {
    index: (req, res) => {
        res.render('home/index');
    },
    searchUser: (req, res) => {
        User.find()
            .then(users => {
                users.forEach((x, i) => {
                    x.rank = i + 1;
                });
                res.render('home/search', {users});
            }).catch((err) => {
            console.log(err);
            res.render('/');
        });
    },
    getUserById: (req, res) => {
        let userId = req.params.id;
        User.findById(userId)
            .then(user => {
                Message.find({
                    receiver: userId
                }).sort({date: 'descending'}).then((messages) => {
                    let messagesCount = messages.length;
                    messages.forEach((x, i) => {
                        x.rank = i + 1;
                        x.data = `${x.date.getDate()}/${x.date.getMonth()}/${x.date.getFullYear()}`;
                    });
                    res.render('home/profile-details', {user, messages, messagesCount});
                }).catch(console.error);
            }).catch((err) => {
            console.log(err);
            res.redirect('/');
        })
    },
    askQuestion: (req, res) => {
        let receiver = req.params.userId;
        let content = req.body.content;
        let author = 'anonymous';
        if (req.isAuthenticated()) {
            author = req.user.username;
        }
        Message.create({
            content,
            author,
            receiver,
            answers: []
        }).then(() => {
            res.redirect(`/profile/${receiver}`);
        }).catch(console.error);
    },
    myProfileGet: (req, res) => {
        let myId = req.user._id;
        User.findById(myId)
            .then((user) => {
                Message.find({
                    receiver: myId
                }).sort({date: 'descending'})
                    .then((messages) => {
                    let messagesCount = messages.length;
                    messages.forEach((x, i) => {
                        x.rank = i + 1;
                        x.data = `${x.date.getDate()}/${x.date.getMonth()}/${x.date.getFullYear()}`;
                    });
                    res.render('home/my-profile', {user, messages, messagesCount});
                }).catch(console.error);
            }).catch(console.error);
    },
    answerQuestion: (req, res) => {
        let answer = req.body.answer;
        let messageId = req.params.id;
        Message.findByIdAndUpdate(messageId, {
            $set: {
                answer: answer
            }
        }).then(() => {
           res.redirect(`/my-profile`);
        });
    },
    deleteQuestion: (req, res) => {
        let answer = req.body.answer;
        let messageId = req.params.id;
        Message.findByIdAndRemove(messageId, {
            $set: {
                answer: answer
            }
        }).then(() => {
            res.redirect(`/my-profile`);
        });
    }
};