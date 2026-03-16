(function () {
    "use strict";

    function readCurrentUser() {
        try {
            var raw = localStorage.getItem("currentUser");
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    var user = readCurrentUser();
    var isAdmin = user && user.role === "admin";

    if (!isAdmin) {
        window.location.href = "../login.html?admin=1";
    }
})();
