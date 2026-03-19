(function () {
    "use strict";

    var state = {
        trainer: null,
        offer: null,
        paymentMethod: null
    };

    function getTrainerSlug() {
        var params = new URLSearchParams(window.location.search);
        return params.get("trainer") || "";
    }

    function readCurrentUser() {
        return window.BeastCenterPtSessions ? window.BeastCenterPtSessions.readCurrentUser() : null;
    }

    function showPaymentPanel(method) {
        ["card", "mbway", "paypal", "multibanco"].forEach(function (key) {
            var panel = document.getElementById("pt-payment-form-" + key);
            if (panel) {
                panel.hidden = key !== method;
            }
        });
    }

    function bindPaymentMethods() {
        Array.prototype.slice.call(document.querySelectorAll(".trainer-payment-option")).forEach(function (option) {
            option.addEventListener("click", function () {
                state.paymentMethod = option.getAttribute("data-method");

                Array.prototype.slice.call(document.querySelectorAll(".trainer-payment-option")).forEach(function (item) {
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

                showPaymentPanel(state.paymentMethod);
            });
        });
    }

    function validatePaymentFields(method) {
        if (!method) {
            return false;
        }

        if (method === "card") {
            return !!(document.getElementById("pt-card-name").value.trim() &&
                document.getElementById("pt-card-number").value.trim() &&
                document.getElementById("pt-card-expiry").value.trim() &&
                document.getElementById("pt-card-cvv").value.trim());
        }

        if (method === "mbway") {
            return !!document.getElementById("pt-mbway-phone").value.trim();
        }

        if (method === "paypal") {
            return !!document.getElementById("pt-paypal-email").value.trim();
        }

        if (method === "multibanco") {
            return !!(document.getElementById("pt-mb-name").value.trim() &&
                document.getElementById("pt-mb-email").value.trim());
        }

        return false;
    }

    function renderTrainerSummary(trainer) {
        document.title = "Marcar Sessao com " + trainer.name + " - BeastCenter";
        document.getElementById("trainer-book-title").textContent = "Marcar sessao com " + trainer.name;
        document.getElementById("trainer-book-subtitle").textContent = trainer.specialization + " com acompanhamento focado em resultados reais.";
        document.getElementById("trainer-book-back-link").href = "perfil.html?trainer=" + encodeURIComponent(trainer.slug);

        var summary = document.getElementById("trainer-book-summary");
        if (summary) {
            summary.innerHTML = [
                "<div><strong>Especialidade</strong><span>" + trainer.specialization + "</span></div>",
                "<div><strong>Experiencia</strong><span>" + trainer.experience + " anos</span></div>",
                "<div><strong>Avaliacao</strong><span>" + Number(trainer.rating).toFixed(1) + "/5</span></div>"
            ].join("");
        }

        var image = document.getElementById("trainer-book-image");
        var fallback = document.getElementById("trainer-book-fallback");
        if (image) {
            var candidates = Array.isArray(trainer.profileImageCandidates) ? trainer.profileImageCandidates.slice() : ["../../images/trainers/" + trainer.slug + ".jpg"];
            var index = 0;

            image.src = candidates[0];
            image.alt = trainer.name;
            image.onerror = function () {
                index += 1;
                if (index < candidates.length) {
                    image.src = candidates[index];
                    return;
                }

                image.style.display = "none";
                if (fallback) {
                    fallback.style.display = "grid";
                }
            };
        }
    }

    function prefillUser() {
        var user = readCurrentUser();
        if (!user) {
            return;
        }

        document.getElementById("booking-name").value = user.name || "";
        document.getElementById("booking-email").value = user.email || "";
        document.getElementById("booking-phone").value = user.phone || "";
    }

    function renderOffer() {
        var planBox = document.getElementById("trainer-plan-status");
        var paymentShell = document.getElementById("trainer-payment-shell");
        var paymentCopy = document.getElementById("trainer-payment-copy");

        if (!planBox || !state.offer) {
            return;
        }

        if (!state.offer.allowed) {
            planBox.innerHTML = "";
            if (paymentShell) {
                paymentShell.hidden = true;
            }
            return;
        }

        planBox.className = "trainer-plan-status" + (state.offer.requiresPayment ? " warning" : " success");
        planBox.innerHTML = "<strong>" + state.offer.title + "</strong><span>" + state.offer.description + "</span>";

        if (paymentShell) {
            paymentShell.hidden = !state.offer.requiresPayment;
        }

        if (paymentCopy) {
            paymentCopy.textContent = state.offer.requiresPayment
                ? "Seleciona um metodo para pagar " + window.BeastCenterPtSessions.formatPrice(state.offer.price) + " e concluir o pedido."
                : "No teu plano atual esta sessao nao exige pagamento adicional.";
        }
    }

    function updateAccessState() {
        var user = readCurrentUser();
        var locked = document.getElementById("trainer-booking-locked");
        var lockedTitle = document.getElementById("trainer-booking-locked-title");
        var lockedCopy = document.getElementById("trainer-booking-locked-copy");
        var lockedPrimary = document.getElementById("trainer-booking-locked-primary");
        var form = document.getElementById("trainer-booking-form");

        if (!locked || !form) {
            return false;
        }

        state.offer = window.BeastCenterPtSessions.getSessionOffer(user, document.getElementById("booking-date").value || new Date().toISOString());

        if (!user) {
            locked.hidden = false;
            form.hidden = true;
            lockedTitle.textContent = "Precisas de iniciar sessao";
            lockedCopy.textContent = "So membros com sessao iniciada podem enviar pedidos de marcacao com personal trainer.";
            lockedPrimary.textContent = "Iniciar sessao";
            lockedPrimary.href = "../login.html";
            return false;
        }

        if (!window.BeastCenterPtSessions.hasActivePaidPlan(user)) {
            locked.hidden = false;
            form.hidden = true;
            lockedTitle.textContent = "Precisas de um plano ativo";
            lockedCopy.textContent = "Ativa primeiro um plano BeastCenter. Depois disso ja podes pedir sessoes com os personal trainers.";
            lockedPrimary.textContent = "Ver planos";
            lockedPrimary.href = "../planos.html";
            return false;
        }

        locked.hidden = true;
        form.hidden = false;
        renderOffer();
        return true;
    }

    function bindDateWatcher() {
        var dateField = document.getElementById("booking-date");
        if (!dateField) {
            return;
        }

        dateField.addEventListener("change", function () {
            updateAccessState();
        });
    }

    function bindForm() {
        var form = document.getElementById("trainer-booking-form");
        if (!form || !state.trainer) {
            return;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            var user = readCurrentUser();
            if (!user) {
                updateAccessState();
                return;
            }

            state.offer = window.BeastCenterPtSessions.getSessionOffer(user, document.getElementById("booking-date").value);

            if (!state.offer.allowed) {
                updateAccessState();
                return;
            }

            if (state.offer.requiresPayment) {
                if (!state.paymentMethod) {
                    window.alert("Seleciona um metodo de pagamento para concluir o pedido.");
                    return;
                }

                if (!validatePaymentFields(state.paymentMethod)) {
                    window.alert("Preenche os dados do metodo de pagamento selecionado.");
                    return;
                }
            }

            var result = window.BeastCenterPtSessions.bookSession({
                trainerSlug: state.trainer.slug,
                trainerName: state.trainer.name,
                goal: document.getElementById("booking-goal").value,
                sessionDate: document.getElementById("booking-date").value,
                sessionTime: document.getElementById("booking-time").value,
                notes: document.getElementById("booking-notes").value.trim(),
                paymentMethod: state.offer.requiresPayment ? state.paymentMethod : ""
            });

            if (!result.ok) {
                window.alert(result.message);
                return;
            }

            if (state.offer.requiresPayment) {
                window.alert("Pedido e pagamento simulados com sucesso. A sessao com " + state.trainer.name + " foi registada.");
            } else {
                window.alert("Pedido enviado com sucesso. Esta sessao ficou incluida no teu plano.");
            }

            window.location.href = "../cliente/personal-trainers.html";
        });
    }

    async function init() {
        var slug = getTrainerSlug();
        if (!slug || !window.BeastCenterTrainersData || !window.BeastCenterPtSessions) {
            window.location.href = "../trainers.html";
            return;
        }

        var trainer = await window.BeastCenterTrainersData.readTrainerBySlug(slug);
        if (!trainer) {
            window.location.href = "../trainers.html";
            return;
        }

        state.trainer = trainer;
        renderTrainerSummary(trainer);
        bindPaymentMethods();
        bindDateWatcher();
        if (updateAccessState()) {
            prefillUser();
            bindForm();
        }
        showPaymentPanel(null);
    }

    init();
})();
