const auth = (() => {
    function isAuthed() {
         return getCookie('authtoken');
    }
    function setCookie(name, value, days) {
        let day = new Date();
        day.setTime(day.getTime() + (days * 24 * 60 * 60 * 1000));
        let expires = "expires=" + day.toGMTString();
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function deleteCookies() {
        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "authtoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    function saveSession(data) {
        setCookie('username', data.username, 10);
        setCookie('id', data._id, 10);
        setCookie('authtoken', data._kmd.authtoken, 10);
    }

    function login(username, password) {
        return remote.post('user', 'login', {username, password}, 'basic');
    }

    async function register(username, password, email, firstName, lastName) {
        return remote.post('user', '', {username, password, email, firstName, lastName}, 'basic');
    }

    async function logout() {
        return remote.post('user', '_logout', {authtoken: getCookie('authtoken')});
    }

    return {
        saveSession, login, register, logout, isAuthed, getCookie, setCookie, deleteCookies
    }
})();