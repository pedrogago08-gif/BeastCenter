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

    function planLabel(plan) {
        var labels = {
            basico: "Plano Basico",
            extra: "Plano Extra",
            premium: "Plano Premium",
            admin: "Plano Admin"
        };
        return labels[plan] || "Sem plano ativo";
    }

    function userInitials(name) {
        if (!name) {
            return "BC";
        }

        var parts = String(name).trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) {
            return "BC";
        }

        return parts.slice(0, 2).map(function (part) {
            return part.charAt(0).toUpperCase();
        }).join("");
    }

    function setText(id, value) {
        var element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    function setValue(id, value) {
        var element = document.getElementById(id);
        if (element) {
            element.value = value || "";
        }
    }

    function init() {
        var user = readCurrentUser();
        if (!user) {
            window.location.href = "../login.html";
            return;
        }

        setText("client-user-name", user.name || "Cliente");
        setText("client-user-plan", planLabel(user.plan));
        setText("client-user-avatar", userInitials(user.name));
        setValue("settings-name", user.name);
        setValue("settings-email", user.email);

        var logoutLink = document.getElementById("client-logout-link");
        if (logoutLink) {
            logoutLink.addEventListener("click", function (event) {
                event.preventDefault();
                localStorage.removeItem("currentUser");
                window.location.href = "../Index.html";
            });
        }
    }

    init();
})();
