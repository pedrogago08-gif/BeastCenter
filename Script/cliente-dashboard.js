(function () {
    "use strict";

    var state = {
        selectedPlan: null,
        selectedMethod: null
    };

    function readCurrentUser() {
        try {
            var raw = localStorage.getItem("currentUser");
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    function writeCurrentUser(user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
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

    function hasActivePlan(user) {
        return !!(user && user.planStatus === "active" && user.paymentStatus === "paid" && user.plan && user.plan !== "none");
    }

    function setDashboardMessage(message, type) {
        var box = document.getElementById("dashboard-plan-message");
        if (!box) {
            return;
        }

        box.className = "payment-status-message" + (type ? " " + type : "");
        box.textContent = message;
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
        renewal.innerHTML = "<p>Plano ativo e pronto a ser gerido nesta area.</p>";
    }

    function updateVisibility(user) {
        var lockedBlock = document.getElementById("client-dashboard-locked");
        var fullBlock = document.getElementById("client-dashboard-full");
        var activePlan = hasActivePlan(user);
        var cancelButton = document.getElementById("cancel-plan-btn");

        if (lockedBlock) {
            lockedBlock.hidden = activePlan;
        }

        if (fullBlock) {
            fullBlock.hidden = !activePlan;
        }

        if (cancelButton) {
            cancelButton.hidden = !activePlan;
        }
    }

    function getPaymentPanel(method) {
        var panels = {
            card: document.getElementById("dashboard-payment-form-card"),
            mbway: document.getElementById("dashboard-payment-form-mbway"),
            paypal: document.getElementById("dashboard-payment-form-paypal"),
            multibanco: document.getElementById("dashboard-payment-form-multibanco")
        };

        return panels[method] || null;
    }

    function showPaymentPanel(method) {
        ["card", "mbway", "paypal", "multibanco"].forEach(function (key) {
            var panel = getPaymentPanel(key);
            if (panel) {
                panel.hidden = key !== method;
            }
        });
    }

    function bindPaymentMethods() {
        Array.prototype.slice.call(document.querySelectorAll("#dashboard-payment-method-grid .payment-option")).forEach(function (option) {
            option.addEventListener("click", function () {
                state.selectedMethod = option.getAttribute("data-method");

                Array.prototype.slice.call(document.querySelectorAll("#dashboard-payment-method-grid .payment-option")).forEach(function (item) {
                    item.classList.remove("selected");
                    var input = item.querySelector("input");
                    if (input) {
                        input.checked = false;
                    }
                });

                option.classList.add("selected");
                var radio = option.querySelector("input");
                if (radio) {
                    radio.checked = true;
                }

                showPaymentPanel(state.selectedMethod);
            });
        });
    }

    function bindPlanOptions() {
        Array.prototype.slice.call(document.querySelectorAll(".plan-manager-select")).forEach(function (button) {
            button.addEventListener("click", function () {
                state.selectedPlan = button.getAttribute("data-plan");

                Array.prototype.slice.call(document.querySelectorAll(".plan-manager-select")).forEach(function (item) {
                    item.classList.remove("is-selected");
                });

                button.classList.add("is-selected");
                setDashboardMessage("Plano " + planLabel(state.selectedPlan) + " selecionado. Escolhe o metodo de pagamento.", "");
            });
        });
    }

    function validatePaymentInputs(method) {
        if (method === "card") {
            return !!(document.getElementById("dashboard-card-name").value.trim() &&
                document.getElementById("dashboard-card-number").value.trim() &&
                document.getElementById("dashboard-card-expiry").value.trim() &&
                document.getElementById("dashboard-card-cvv").value.trim());
        }

        if (method === "mbway") {
            return !!document.getElementById("dashboard-mbway-phone").value.trim();
        }

        if (method === "paypal") {
            return !!document.getElementById("dashboard-paypal-email").value.trim();
        }

        if (method === "multibanco") {
            return !!(document.getElementById("dashboard-mb-name").value.trim() &&
                document.getElementById("dashboard-mb-email").value.trim());
        }

        return false;
    }

    function refreshHeader(user) {
        document.getElementById("client-user-name").textContent = user.name || "Cliente";
        document.getElementById("client-user-plan").textContent = planLabel(user.plan);
        document.getElementById("client-user-avatar").textContent = userInitials(user.name);
        fillPlan(user);
        updateVisibility(user);
    }

    async function confirmPlanChange() {
        var user = readCurrentUser();

        if (!user) {
            window.location.href = "../login.html";
            return;
        }

        if (!state.selectedPlan) {
            setDashboardMessage("Seleciona um plano.", "error");
            return;
        }

        if (!state.selectedMethod) {
            setDashboardMessage("Seleciona um metodo de pagamento.", "error");
            return;
        }

        if (!validatePaymentInputs(state.selectedMethod)) {
            setDashboardMessage("Preenche os dados do metodo de pagamento escolhido.", "error");
            return;
        }

        if (!window.confirm("Tens a certeza que queres mudar para " + planLabel(state.selectedPlan) + "?")) {
            return;
        }

        if (!window.confirm("Confirma que queres avancar com a alteracao do plano e respetivo pagamento?")) {
            return;
        }

        try {
            setDashboardMessage("A atualizar o teu plano...", "");
            var response = await window.BeastCenterApi.activatePlan(user.id, {
                plan: state.selectedPlan,
                paymentMethod: state.selectedMethod
            });

            writeCurrentUser(response.user);
            refreshHeader(response.user);
            setDashboardMessage("Plano atualizado com sucesso.", "success");
        } catch (error) {
            setDashboardMessage(error.message || "Nao foi possivel atualizar o plano.", "error");
        }
    }

    async function cancelCurrentPlan() {
        var user = readCurrentUser();

        if (!user || !hasActivePlan(user)) {
            return;
        }

        if (!window.confirm("Tens a certeza que queres cancelar o teu plano atual?")) {
            return;
        }

        if (!window.confirm("Esta acao vai remover o plano ativo da tua conta. Queres mesmo continuar?")) {
            return;
        }

        try {
            setDashboardMessage("A cancelar o plano atual...", "");
            var response = await window.BeastCenterApi.cancelPlan(user.id);
            writeCurrentUser(response.user);
            refreshHeader(response.user);
            setDashboardMessage("Plano cancelado. Podes aderir novamente quando quiseres.", "success");
        } catch (error) {
            setDashboardMessage(error.message || "Nao foi possivel cancelar o plano.", "error");
        }
    }

    function bindDashboardControls() {
        var openManager = document.getElementById("open-plan-manager-btn");
        var manager = document.getElementById("dashboard-plan-manager");
        var confirmButton = document.getElementById("confirm-dashboard-plan-btn");
        var cancelButton = document.getElementById("cancel-plan-btn");

        if (openManager && manager) {
            openManager.addEventListener("click", function () {
                manager.hidden = !manager.hidden;
                if (!manager.hidden) {
                    manager.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        }

        if (confirmButton) {
            confirmButton.addEventListener("click", confirmPlanChange);
        }

        if (cancelButton) {
            cancelButton.addEventListener("click", cancelCurrentPlan);
        }
    }

    function init() {
        var user = readCurrentUser();
        if (!user) {
            window.location.href = "../login.html";
            return;
        }

        refreshHeader(user);
        bindPlanOptions();
        bindPaymentMethods();
        bindDashboardControls();
        showPaymentPanel(null);
    }

    init();
})();
