(function () {
    "use strict";

    function readCurrentUser() {
        return window.BeastCenterPtSessions ? window.BeastCenterPtSessions.readCurrentUser() : null;
    }

    function planLabel(plan) {
        var labels = {
            none: "Sem plano ativo",
            basico: "Plano Basico",
            extra: "Plano Extra",
            premium: "Plano Premium"
        };
        return labels[plan] || "Sem plano ativo";
    }

    function renderSummary(user, sessions) {
        var summary = document.getElementById("client-pt-plan-summary");
        var hero = document.getElementById("client-pt-hero-copy");
        if (!summary || !hero) {
            return;
        }

        var freeUsed = user && user.plan === "premium" ? window.BeastCenterPtSessions.getPremiumFreeUsage(user) : 0;
        var freeRemaining = user && user.plan === "premium" ? Math.max(2 - freeUsed, 0) : 0;

        hero.textContent = user && user.plan === "premium"
            ? "No Premium tens 2 sessoes gratis por mes. O restante fica registado aqui."
            : "Nos planos Basico e Extra as sessoes de PT sao pagas individualmente. Os teus pedidos ficam registados nesta area.";

        summary.innerHTML = [
            "<li><strong>Plano atual</strong><span>" + planLabel(user && user.plan) + "</span></li>",
            "<li><strong>Sessoes gratis este mes</strong><span>" + freeRemaining + "</span></li>",
            "<li><strong>Sessoes ja marcadas</strong><span>" + sessions.length + "</span></li>"
        ].join("");
    }

    function renderSessions(user) {
        var container = document.getElementById("client-pt-sessions-list");
        if (!container) {
            return;
        }

        var sessions = window.BeastCenterPtSessions.getUserSessions(user);
        renderSummary(user, sessions);

        if (!sessions.length) {
            container.innerHTML = "<div class='empty-state-block'><h3>Ainda nao tens sessoes marcadas</h3><p>Quando agendares uma sessao com um PT, ela aparece aqui com data, hora e tipo de acesso.</p></div>";
            return;
        }

        container.innerHTML = sessions.map(function (session) {
            var paymentLabel = session.paymentType === "premium_free"
                ? "Incluida no Premium"
                : (session.amountPaid > 0 ? "Paga: " + window.BeastCenterPtSessions.formatPrice(session.amountPaid) : "Sem custo");

            return (
                "<article class='booking-card'>" +
                    "<div class='booking-card-head'>" +
                        "<div>" +
                            "<span class='status-pill'>Confirmada</span>" +
                            "<h3>" + session.trainerName + "</h3>" +
                            "<p>" + session.goal + " · " + session.sessionDate + " · " + session.sessionTime + "</p>" +
                        "</div>" +
                        "<button class='btn secondary pt-session-cancel-btn' type='button' data-session-id='" + session.id + "'>Cancelar</button>" +
                    "</div>" +
                    "<div class='booking-meta-grid'>" +
                        "<div><strong>Tipo</strong><span>" + paymentLabel + "</span></div>" +
                        "<div><strong>Estado</strong><span>" + session.status + "</span></div>" +
                    "</div>" +
                "</article>"
            );
        }).join("");

        Array.prototype.slice.call(document.querySelectorAll(".pt-session-cancel-btn")).forEach(function (button) {
            button.addEventListener("click", function () {
                if (!window.confirm("Queres cancelar esta sessao com PT?")) {
                    return;
                }

                window.BeastCenterPtSessions.cancelSession(button.getAttribute("data-session-id"), user);
                renderSessions(user);
            });
        });
    }

    function init() {
        var user = readCurrentUser();
        if (!user) {
            window.location.href = "../login.html";
            return;
        }

        renderSessions(user);
    }

    init();
})();
