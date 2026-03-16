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

    function planFeatures(plan) {
        var features = {
            basico: ["1 entrada por dia", "Acesso ao ginasio", "Balnearios incluidos"],
            extra: ["2 entradas por dia", "Wi-Fi gratis", "Acesso a piscina e spa", "Snack diario gratis"],
            premium: ["Entradas ilimitadas", "Piscina e spa", "Aulas premium", "Acesso prioritario"]
        };
        return features[plan] || [];
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

    function fillPlan(user) {
        var title = document.getElementById("client-plan-name");
        var featuresContainer = document.getElementById("client-plan-features");
        var renewal = document.getElementById("client-plan-renewal");
        var features = planFeatures(user && user.plan);

        title.textContent = planLabel(user && user.plan);

        if (features.length === 0) {
            featuresContainer.innerHTML = "<p>As informacoes do plano vao aparecer depois de ativares uma subscricao.</p>";
            renewal.innerHTML = "<p>Sem data de renovacao definida.</p>";
            return;
        }

        featuresContainer.innerHTML = features.map(function (item) {
            return "<p>" + item + "</p>";
        }).join("");
        renewal.innerHTML = "<p>Renovacao mostrada quando houver assinatura real associada.</p>";
    }

    function init() {
        var user = readCurrentUser();
        if (!user) {
            window.location.href = "../login.html";
            return;
        }

        document.getElementById("client-user-name").textContent = user.name || "Cliente";
        document.getElementById("client-user-plan").textContent = planLabel(user.plan);
        document.getElementById("client-user-avatar").textContent = userInitials(user.name);
        fillPlan(user);

    }

    init();
})();
