(function () {
    "use strict";

    var state = {
        selectedPlan: null,
        selectedPrice: null,
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

    function hasActivePaidPlan(user) {
        return !!(user && user.planStatus === "active" && user.paymentStatus === "paid" && user.plan && user.plan !== "none");
    }

    function getDashboardUrl() {
        var user = readCurrentUser();
        return user && user.role === "admin" ? "admin/dashboard.html" : "cliente/dashboard.html";
    }

    function formatPrice(value) {
        return Number(value || 0).toFixed(2).replace(".", ",") + "€/mes";
    }

    function planLabel(plan) {
        var labels = {
            basico: "Plano Basico",
            extra: "Plano Extra",
            premium: "Plano Premium"
        };
        return labels[plan] || "Nenhum plano escolhido";
    }

    function paymentLabel(method) {
        var labels = {
            card: "Cartao de credito/debito",
            mbway: "MB Way",
            paypal: "PayPal",
            multibanco: "Referencia Multibanco"
        };
        return labels[method] || "Nenhum metodo selecionado";
    }

    function setMessage(message, type) {
        var box = document.getElementById("plan-checkout-message");
        if (!box) {
            return;
        }

        box.className = "payment-status-message" + (type ? " " + type : "");
        box.textContent = message;
    }

    function updatePlansCta() {
        var user = readCurrentUser();
        var copy = document.getElementById("plans-cta-copy");
        var button = document.getElementById("plans-cta-button");
        var title = document.querySelector("#plans-cta-container h2");

        if (!copy || !button || !title) {
            return;
        }

        if (!user) {
            title.textContent = "Pronto para Começar?";
            copy.textContent = "Junta-te à família BeastCenter e transforma o teu corpo hoje!";
            button.textContent = "Criar Conta";
            button.onclick = function () {
                window.location.href = "login.html";
            };
            return;
        }

        if (hasActivePaidPlan(user)) {
            title.textContent = "Já tens um plano ativo";
            copy.textContent = "Entra no teu dashboard para gerires a subscrição, veres benefícios e tratares de futuras alterações.";
            button.textContent = "Abrir Dashboard";
            button.onclick = function () {
                window.location.href = getDashboardUrl();
            };
            return;
        }

        title.textContent = "Falta só ativar o teu plano";
        copy.textContent = "Já tens conta iniciada. Escolhe o plano ideal acima e confirma o pagamento para desbloquear o acesso completo.";
        button.textContent = "Ir para o pagamento";
        button.onclick = function () {
            var checkout = document.getElementById("checkout");
            if (checkout) {
                checkout.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        };
    }

    function updateSummary() {
        var user = readCurrentUser();
        var planName = document.getElementById("selected-plan-name");
        var price = document.getElementById("selected-plan-price");
        var paymentMethod = document.getElementById("selected-payment-method");
        var accountState = document.getElementById("plan-account-state");

        if (planName) {
            planName.textContent = planLabel(state.selectedPlan);
        }

        if (price) {
            price.textContent = state.selectedPrice ? formatPrice(state.selectedPrice) : "--";
        }

        if (paymentMethod) {
            paymentMethod.textContent = paymentLabel(state.selectedMethod);
        }

        if (accountState) {
            if (!hasActivePaidPlan(user)) {
                accountState.textContent = "Sem plano ativo";
            } else {
                accountState.textContent = planLabel(user.plan) + " ativo";
            }
        }
    }

    function getPaymentPanel(method) {
        var panels = {
            card: document.getElementById("payment-form-card"),
            mbway: document.getElementById("payment-form-mbway"),
            paypal: document.getElementById("payment-form-paypal"),
            multibanco: document.getElementById("payment-form-multibanco")
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

    function bindPlanButtons() {
        Array.prototype.slice.call(document.querySelectorAll(".plan-select-btn")).forEach(function (button) {
            button.addEventListener("click", function () {
                var user = readCurrentUser();

                if (hasActivePaidPlan(user)) {
                    setMessage("Ja tens um plano ativo. Para alterar ou cancelar, usa o dashboard.", "error");
                    return;
                }

                state.selectedPlan = button.getAttribute("data-plan");
                state.selectedPrice = button.getAttribute("data-price");
                updateSummary();
                setMessage("Plano " + planLabel(state.selectedPlan) + " selecionado. Escolhe agora o metodo de pagamento.", "");

                var checkout = document.getElementById("checkout");
                if (checkout) {
                    checkout.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });
    }

    function bindPaymentMethods() {
        Array.prototype.slice.call(document.querySelectorAll(".payment-option")).forEach(function (option) {
            option.addEventListener("click", function () {
                state.selectedMethod = option.getAttribute("data-method");

                Array.prototype.slice.call(document.querySelectorAll(".payment-option")).forEach(function (item) {
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
                updateSummary();
            });
        });
    }

    function validatePaymentInputs(method) {
        if (method === "card") {
            return !!(document.getElementById("payment-card-name").value.trim() &&
                document.getElementById("payment-card-number").value.trim() &&
                document.getElementById("payment-card-expiry").value.trim() &&
                document.getElementById("payment-card-cvv").value.trim());
        }

        if (method === "mbway") {
            return !!document.getElementById("payment-mbway-phone").value.trim();
        }

        if (method === "paypal") {
            return !!document.getElementById("payment-paypal-email").value.trim();
        }

        if (method === "multibanco") {
            return !!(document.getElementById("payment-multibanco-name").value.trim() &&
                document.getElementById("payment-multibanco-email").value.trim());
        }

        return false;
    }

    function disablePlanCheckoutForActiveUser() {
        Array.prototype.slice.call(document.querySelectorAll(".plan-select-btn")).forEach(function (button) {
            button.disabled = true;
            button.textContent = "Gerir no dashboard";
        });

        var confirmButton = document.getElementById("confirm-plan-payment");
        if (confirmButton) {
            confirmButton.disabled = true;
            confirmButton.textContent = "Gerido no dashboard";
        }

        showPaymentPanel(null);
        updateSummary();
        setMessage("Ja tens um plano ativo. Alteracoes e cancelamentos fazem-se no dashboard.", "success");
    }

    async function confirmPayment() {
        var user = readCurrentUser();

        if (!user) {
            setMessage("Precisas de criar conta e fazer login antes de aderir a um plano.", "error");
            setTimeout(function () {
                window.location.href = "login.html";
            }, 900);
            return;
        }

        if (hasActivePaidPlan(user)) {
            setMessage("Ja tens um plano ativo. Para alterar ou cancelar, usa o dashboard.", "error");
            return;
        }

        if (!state.selectedPlan) {
            setMessage("Seleciona primeiro um plano.", "error");
            return;
        }

        if (!state.selectedMethod) {
            setMessage("Seleciona um metodo de pagamento.", "error");
            return;
        }

        if (!validatePaymentInputs(state.selectedMethod)) {
            setMessage("Preenche os dados do metodo de pagamento selecionado.", "error");
            return;
        }

        try {
            setMessage("A confirmar pagamento e a ativar o teu plano...", "");
            var response = await window.BeastCenterApi.activatePlan(user.id, {
                plan: state.selectedPlan,
                paymentMethod: state.selectedMethod
            });

            writeCurrentUser(response.user);
            updateSummary();
            disablePlanCheckoutForActiveUser();
            setMessage("Pagamento confirmado. O teu plano foi ativado com sucesso.", "success");

            window.alert("Pagamento concluido com sucesso. O separador vai ser fechado.");

            setTimeout(function () {
                window.close();
                setTimeout(function () {
                    if (!window.closed) {
                        window.location.href = getDashboardUrl();
                    }
                }, 350);
            }, 250);
        } catch (error) {
            setMessage(error.message || "Nao foi possivel confirmar o pagamento.", "error");
        }
    }

    function init() {
        if (!document.getElementById("checkout")) {
            return;
        }

        bindPlanButtons();
        bindPaymentMethods();
        showPaymentPanel(null);
        updateSummary();
        updatePlansCta();

        if (hasActivePaidPlan(readCurrentUser())) {
            disablePlanCheckoutForActiveUser();
        }

        var confirmButton = document.getElementById("confirm-plan-payment");
        if (confirmButton) {
            confirmButton.addEventListener("click", confirmPayment);
        }
    }

    document.addEventListener("DOMContentLoaded", init);
})();
