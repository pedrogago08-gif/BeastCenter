(function () {
    "use strict";

    var DEFAULT_API_BASE = "http://localhost:3000/api";

    function normalizeBase(url) {
        return (url || DEFAULT_API_BASE).replace(/\/+$/, "");
    }

    function getConfiguredBase() {
        var fromWindow = window.BEASTCENTER_API_BASE;
        var fromStorage = localStorage.getItem("beastcenter_api_base");
        return normalizeBase(fromWindow || fromStorage || DEFAULT_API_BASE);
    }

    async function request(path, options) {
        var response = await fetch(getConfiguredBase() + path, Object.assign({
            headers: {
                "Content-Type": "application/json"
            }
        }, options || {}));

        var data = null;
        try {
            data = await response.json();
        } catch (error) {
            data = null;
        }

        if (!response.ok) {
            var message = data && data.error ? data.error : "Pedido falhou";
            throw new Error(message);
        }

        return data;
    }

    window.BeastCenterApi = {
        getBase: getConfiguredBase,
        setBase: function (baseUrl) {
            localStorage.setItem("beastcenter_api_base", normalizeBase(baseUrl));
        },
        health: function () {
            return request("/health");
        },
        register: function (payload) {
            return request("/auth/register", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        },
        login: function (payload) {
            return request("/auth/login", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        },
        adminLogin: function (payload) {
            return request("/auth/admin-login", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        },
        getUsers: function () {
            return request("/users");
        },
        createUser: function (payload) {
            return request("/users", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        },
        updateUser: function (id, payload) {
            return request("/users/" + encodeURIComponent(id), {
                method: "PATCH",
                body: JSON.stringify(payload)
            });
        },
        getTrainers: function () {
            return request("/trainers");
        },
        createTrainer: function (payload) {
            return request("/trainers", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        },
        updateTrainer: function (id, payload) {
            return request("/trainers/" + encodeURIComponent(id), {
                method: "PATCH",
                body: JSON.stringify(payload)
            });
        },
        deleteTrainer: function (id) {
            return request("/trainers/" + encodeURIComponent(id), {
                method: "DELETE"
            });
        },
        getClasses: function () {
            return request("/classes");
        },
        createClass: function (payload) {
            return request("/classes", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        },
        updateClass: function (id, payload) {
            return request("/classes/" + encodeURIComponent(id), {
                method: "PATCH",
                body: JSON.stringify(payload)
            });
        },
        deleteClass: function (id) {
            return request("/classes/" + encodeURIComponent(id), {
                method: "DELETE"
            });
        }
    };
})();
