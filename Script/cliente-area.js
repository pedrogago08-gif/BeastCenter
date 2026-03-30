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
            none: "Sem plano ativo",
            basico: "Plano Basico",
            extra: "Plano Extra",
            premium: "Plano Premium",
            admin: "Plano Admin"
        };
        return labels[plan] || "Sem plano ativo";
    }

    function hasActivePaidPlan(user) {
        return !!(user && user.planStatus === "active" && user.paymentStatus === "paid" && user.plan && user.plan !== "none");
    }

    function getDiscountRate(plan) {
        if (plan === "extra") {
            return 0.10;
        }

        if (plan === "premium") {
            return 0.20;
        }

        return 0;
    }

    function getCouponOwnerKey(user) {
        var raw = String((user && (user.id || user.email || user.username || user.name)) || "")
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "");

        return raw;
    }

    function getPersonalDiscount(user) {
        if (!hasActivePaidPlan(user)) {
            return null;
        }

        var rate = getDiscountRate(user.plan);
        var ownerKey = getCouponOwnerKey(user);
        var prefix = user.plan === "premium" ? "PREMIUM20" : "EXTRA10";

        if (!rate || !ownerKey) {
            return null;
        }

        return {
            code: prefix + "-" + ownerKey.slice(-6),
            rate: rate,
            ownerKey: ownerKey,
            label: Math.round(rate * 100) + "% de desconto"
        };
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

    function removeLegacyPlanFoodLink() {
        Array.prototype.slice.call(document.querySelectorAll(".sidebar-menu a[href='plano-alimentar.html']")).forEach(function (link) {
            link.remove();
        });

        if (window.location.pathname.indexOf("plano-alimentar.html") !== -1) {
            window.location.replace("dashboard.html");
        }
    }

    function renderRewards(user) {
        var discount = getPersonalDiscount(user);
        var status = document.getElementById("reward-discount-status");
        var rate = document.getElementById("reward-discount-rate");
        var code = document.getElementById("reward-discount-code");
        var copy = document.getElementById("reward-discount-copy");
        var note = document.getElementById("reward-discount-note");
        var heroTitle = document.getElementById("reward-hero-title");
        var heroCopy = document.getElementById("reward-hero-copy");
        var heroButton = document.getElementById("reward-hero-button");

        if (!status && !heroTitle) {
            return;
        }

        if (!discount) {
            setText("reward-discount-status", "Sem desconto ativo");
            setText("reward-discount-rate", "Disponivel apenas nos planos Extra e Premium");
            setText("reward-discount-code", "Ativa um plano elegivel");
            setText("reward-discount-copy", "Quando tiveres um plano Extra ou Premium ativo, vais receber aqui um codigo pessoal para usar na loja.");
            setText("reward-discount-note", "O codigo sera individual e nao pode ser usado por outras contas.");
            setText("reward-hero-title", "Ainda sem recompensas ativas");
            setText("reward-hero-copy", "Ativa um plano Extra ou Premium para desbloquear o teu desconto pessoal na loja BeastCenter.");
            if (heroButton) {
                heroButton.textContent = "Ver planos";
                heroButton.href = "../planos.html";
            }
            return;
        }

        setText("reward-discount-status", "Desconto pessoal ativo");
        setText("reward-discount-rate", discount.label + " na loja");
        setText("reward-discount-code", discount.code);
        setText("reward-discount-copy", "Usa este codigo no carrinho da loja para aplicar automaticamente o desconto correspondente ao teu plano.");
        setText("reward-discount-note", "Codigo pessoal e intransmissivel. So funciona autenticado na tua conta atual.");
        setText("reward-hero-title", "Ja tens uma recompensa ativa");
        setText("reward-hero-copy", "O teu plano desbloqueou um codigo pessoal para usar nas compras da loja sem poder ser transferido para outras pessoas.");
        if (heroButton) {
            heroButton.textContent = "Abrir loja";
            heroButton.href = "../loja/produtos.html";
        }
    }

    function init() {
        removeLegacyPlanFoodLink();

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
        renderRewards(user);
    }

    window.BeastCenterPerks = {
        getPersonalDiscount: getPersonalDiscount
    };

    init();
})();
