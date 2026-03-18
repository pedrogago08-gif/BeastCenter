(function () {
    "use strict";

    function getTrainerSlug() {
        var params = new URLSearchParams(window.location.search);
        return params.get("trainer") || "";
    }

    function readCurrentUser() {
        try {
            var raw = localStorage.getItem("currentUser");
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
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
    }

    function prefillUser() {
        var user = readCurrentUser();
        if (!user) {
            return;
        }

        var name = document.getElementById("booking-name");
        var email = document.getElementById("booking-email");
        var phone = document.getElementById("booking-phone");

        if (name) {
            name.value = user.name || "";
        }
        if (email) {
            email.value = user.email || "";
        }
        if (phone) {
            phone.value = user.phone || "";
        }
    }

    function bindForm(trainer) {
        var form = document.getElementById("trainer-booking-form");
        if (!form) {
            return;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            window.alert("Pedido enviado com sucesso para " + trainer.name + ". Esta pagina ficou pronta para ligar ao backend quando quiseres.");
            window.location.href = "perfil.html?trainer=" + encodeURIComponent(trainer.slug);
        });
    }

    async function init() {
        var slug = getTrainerSlug();
        if (!slug || !window.BeastCenterTrainersData) {
            window.location.href = "../trainers.html";
            return;
        }

        var trainer = await window.BeastCenterTrainersData.readTrainerBySlug(slug);
        if (!trainer) {
            window.location.href = "../trainers.html";
            return;
        }

        renderTrainerSummary(trainer);
        prefillUser();
        bindForm(trainer);
    }

    init();
})();
