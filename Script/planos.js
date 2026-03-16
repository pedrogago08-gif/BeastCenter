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
            if (!user || user.planStatus !== "active" || user.paymentStatus !== "paid") {
                accountState.textContent = "Sem plano ativo";
            } else {
                accountState.textContent = planLabel(user.plan) + " ativo";
            }
        }
    }

    function bindPlanButtons() {
        Array.prototype.slice.call(document.querySelectorAll(".plan-select-btn")).forEach(function (button) {
            button.addEventListener("click", function () {
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

                updateSummary();
            });
        });
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

        if (!state.selectedPlan) {
            setMessage("Seleciona primeiro um plano.", "error");
            return;
        }

        if (!state.selectedMethod) {
            setMessage("Seleciona um metodo de pagamento.", "error");
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
            setMessage("Pagamento confirmado. O teu plano foi ativado com sucesso.", "success");
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
        updateSummary();

        var confirmButton = document.getElementById("confirm-plan-payment");
        if (confirmButton) {
            confirmButton.addEventListener("click", confirmPayment);
        }
    }

    document.addEventListener("DOMContentLoaded", init);
})();
