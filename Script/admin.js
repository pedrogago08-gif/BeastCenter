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

    function isExistingAdminPage(path) {
        var knownPages = [
            "dashboard.html",
            "usuarios.html",
            "trainers.html",
            "estatisticas.html",
            "aulas.html",
            "loja.html",
            "planos.html",
            "mensagens.html",
            "recompensas.html",
            "notificacoes.html",
            "historico.html"
        ];

        return knownPages.indexOf(path) !== -1;
    }

    function updateProfile(user) {
        var nameTargets = document.querySelectorAll(".admin-name");
        var roleTargets = document.querySelectorAll(".admin-role");

        nameTargets.forEach(function (node) {
            node.textContent = user && user.name ? user.name : "Administrador";
        });

        roleTargets.forEach(function (node) {
            node.textContent = user && user.username ? "@" + user.username : "Super Admin";
        });
    }

    function wireLogout() {
        var logoutLink = document.querySelector(".menu-item.logout");
        if (!logoutLink) {
            return;
        }

        logoutLink.addEventListener("click", function (event) {
            event.preventDefault();
            localStorage.removeItem("currentUser");
            window.location.href = "../login.html?admin=1";
        });
    }

    function markMissingLinks() {
        var links = document.querySelectorAll(".admin-menu a[href]");
        links.forEach(function (link) {
            var href = link.getAttribute("href");
            if (!href || href.indexOf("http") === 0 || href.indexOf("../") === 0) {
                return;
            }

            if (!isExistingAdminPage(href)) {
                link.classList.add("is-disabled");
                link.setAttribute("aria-disabled", "true");
            }
        });
    }

    function init() {
        updateProfile(readCurrentUser());
        wireLogout();
        markMissingLinks();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
