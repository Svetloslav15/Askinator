$(() => {
    const app = Sammy('#main', function () {
        this.use("Handlebars", "hbs");

        this.get("index.html", function () {
            if (auth.isAuthed()) {
                this.redirect('#/myProfile');
            }
            else {
                this.redirect('#/home');
            }
        });

        this.get("#/home", function () {
            if (auth.isAuthed()) {
                this.redirect('#/myProfile');
                return;
            }
            this.loadPartials({
                navigation: "./templates/common/navigation.hbs",
                footer: "./templates/common/footer.hbs",
                homeSection: "./templates/home/home-section.hbs"
            }).then(function () {
                this.partial('./templates/home/home-page.hbs');
            });
        });

        this.get('#/register', function () {
            this.loadPartials({
                navigation: "./templates/common/navigation.hbs",
                footer: "./templates/common/footer.hbs",
                registerForm: "./templates/forms/register-form.hbs"
            }).then(function () {
                this.partial('./templates/registerPage.hbs');
            });
        });

        this.get('#/login', function () {
            this.loadPartials({
                navigation: "./templates/common/navigation.hbs",
                footer: "./templates/common/footer.hbs",
                loginForm: "./templates/forms/login-form.hbs"
            }).then(function () {
                this.partial('./templates/loginPage.hbs');
            });
        });

        this.get('#/logout', function (context) {
            swal({
                title: "Logout",
                text: `Are you sure that you want to logout?`,
                icon: "warning",
                buttons: ["No", "Yes"],
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    auth.logout()
                        .then(function () {
                            auth.deleteCookies();
                            notify.showInfo("Logout successfully!");
                            context.redirect('#/home');
                        }).catch(notify.handleError);
                }
                else{
                    context.redirect("#/myProfile");
                }
            });


        });

        this.post('#/register', function (context) {
            let username = context.params.username;
            let firstName = context.params.firstName;
            let lastName = context.params.lastName;
            let email = context.params.email;
            let password = context.params.password;
            let repeatPass = context.params.repeatPass;
            if (username === "" || firstName === "" || lastName === "" ||
                email === "" || password === "" || repeatPass === "") {
                notify.showError("Empty field!");
            }
            else if (username.length < 5) {
                notify.showError("Username must be at least 5 symbols!");
            }
            else if (password !== repeatPass) {
                notify.showError("Passwords not match!");
            }
            else if (password.length < 5) {
                notify.showError("Password must be at least 5 symbols!");
            }
            else {
                auth.register(username, password, email, firstName, lastName)
                    .then(function (data) {
                        auth.saveSession(data);
                        context.redirect('#/myProfile');
                        notify.showInfo("Register successfully!");
                    }).catch(notify.handleError);
            }
        });

        this.post('#/login', function (context) {
            let username = context.params.username;
            let password = context.params.password;
            if (username === "" || password === "") {
                notify.showError("Empty field!");
            }
            else {
                auth.login(username, password)
                    .then(function (data) {
                        auth.saveSession(data);
                        context.redirect("#/myProfile");
                        notify.showInfo("Login successfully!");
                    }).catch(notify.handleError);
            }
        });

        this.get("#/myProfile", function (context) {
            if (!auth.isAuthed()) {
                this.redirect('#/home');
                return;
            }
            remote.get("user", auth.getCookie("id"), "kinvey")
                .then(function (res) {
                    context.isAuthed = auth.isAuthed();
                    context.username = auth.getCookie("username");
                    context.firstName = res.firstName;
                    context.lastName = res.lastName;
                    context.email = res.email;
                    remote.get("appdata", `messages?query={"receiver":"${auth.getCookie("id")}"}&sort={"_kmd.ect": -1}`, "kinvey")
                        .then(function (messages) {
                            messages.forEach((el, index) => {
                                el.rank = index + 1;
                                el.date = calcTime(el._kmd.ect);
                            });
                            context.messages = messages;
                            context.messagesCount = messages.length;
                            context.loadPartials({
                                navigation: "./templates/common/navigation.hbs",
                                footer: "./templates/common/footer.hbs",
                                profileSection: "./templates/myProfile/show-profile-section.hbs",
                                listMessagesSection: "./templates/myProfile/list-messages-section.hbs",
                                message: "./templates/myProfile/message.hbs"
                            }).then(function () {
                                this.partial('./templates/myProfilePage.hbs');
                            })
                        });
                });
        });

        this.get('#/searchUser', function (context) {
            if (!auth.isAuthed()){
                context.redirect("#/home");
                return;
            }
            remote.get("user", "", "kinvey")
                .then(function (users) {
                    users.forEach((el, index) => {
                        el.rank = index + 1;
                    });
                    context.users = users;
                    context.isAuthed = auth.isAuthed();
                    context.username = auth.getCookie("username");
                    context.loadPartials({
                        navigation: "./templates/common/navigation.hbs",
                        user: "./templates/searchProfiles/profile-template.hbs"
                    }).then(function () {
                        this.partial('./templates/searchProfilePage.hbs');
                    }).catch(notify.handleError);
                }).catch(notify.handleError);
        });

        this.get("#/profile/:id", function (context) {
            if (!auth.isAuthed()){
                context.redirect("#/home");
                return;
            }
            let id = context.params.id.slice(1);
            context.isAuthed = auth.isAuthed();
            context.username = auth.getCookie("username");
            remote.get("user", `${id}`, "kinvey")
                .then(function (res) {
                    context.user = res.username;
                    context.id = res._id;
                    remote.get("appdata", `messages?query={"receiver":"${res._id}"}&sort={"_kmd.ect": -1}`, "kinvey")
                        .then(function (messages) {
                            messages.forEach((el, index) => {
                                el.rank = index + 1;
                                el.date = calcTime(el._kmd.ect);
                            });
                            context.messagesCount = messages.length;
                            context.messages = messages;
                            context.loadPartials({
                                navigation: "./templates/common/navigation.hbs",
                                infoSection: "./templates/profileDetails/info-section.hbs",
                                listMessages: "./templates/profileDetails/list-messages.hbs",
                                message: "./templates/profileDetails/message.hbs"
                            }).then(function () {
                                this.partial("./templates/profileDetailsPage.hbs");
                            })
                        })
                }).catch(notify.handleError);
        });

        this.post('#/askQuestion/:id', function (context) {
            let data = {
                content: context.params.question,
                receiver: context.params.id,
                author: auth.getCookie("id")
            };

            remote.post("appdata", "messages", data, "kinvey")
                .then(function () {
                    notify.showInfo("You asked question!");
                    context.redirect(`#/profile/:${data.receiver}`);
                })
        });

        this.get("#/deleteQuestion/:id", function (context) {
            swal({
                title: "Delete message",
                text: `Are you sure that you want to delete this message?`,
                icon: "warning",
                buttons: ["No", "Yes"],
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {
                    let id = context.params.id.slice(1);
                    remote.remove("appdata", `messages/${id}`, "kinvey")
                        .then(function () {
                            notify.showInfo("Message deleted successfully!");
                            context.redirect("#/myProfile");
                        }).catch(notify.handleError);
                }
                else{
                    context.redirect("#/myProfile");
                }
            });

        });

        this.post('#/createAnswer/:id', function (context) {
            let questionId = context.params.id.slice(1);
            let answer = context.params.answer;
            remote.get("appdata", `messages/${questionId}`, "kinvey")
                .then(function (res) {
                    res.answer = answer;
                    remote.update("appdata", `messages/${questionId}`, res, "kinvey")
                        .then(function () {
                            notify.showInfo("You answered a question!");
                            context.redirect("#/myProfile");
                        })
                })
        });

    });

    app.run();
});

function calcTime(dateIsoFormat) {
    let diff = new Date - (new Date(dateIsoFormat));
    diff = Math.floor(diff / 60000);
    if (diff < 1) return 'less than a minute';
    if (diff < 60) return diff + ' minute' + pluralize(diff);
    diff = Math.floor(diff / 60);
    if (diff < 24) return diff + ' hour' + pluralize(diff);
    diff = Math.floor(diff / 24);
    if (diff < 30) return diff + ' day' + pluralize(diff);
    diff = Math.floor(diff / 30);
    if (diff < 12) return diff + ' month' + pluralize(diff);
    diff = Math.floor(diff / 12);
    return diff + ' year' + pluralize(diff);

    function pluralize(value) {
        if (value !== 1) return 's';
        else return '';
    }
}