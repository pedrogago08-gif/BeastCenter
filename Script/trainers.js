(function () {
    "use strict";

    async function readTrainers() {
        if (!window.BeastCenterTrainersData) {
            return [];
        }

        return window.BeastCenterTrainersData.readPublicTrainers();
    }

    function renderKpis(trainers) {
        var total = trainers.length;
        var sumClients = trainers.reduce(function (acc, trainer) { return acc + Number(trainer.clients || 0); }, 0);
        var avg = total ? trainers.reduce(function (acc, trainer) { return acc + Number(trainer.rating || 0); }, 0) / total : 0;
        var kpiValues = document.querySelectorAll(".trainers-kpis .kpi strong");

        if (kpiValues.length >= 3) {
            kpiValues[0].textContent = String(total);
            kpiValues[1].textContent = String(sumClients);
            kpiValues[2].textContent = avg > 0 ? avg.toFixed(1) + "/5" : "0/5";
        }
    }

    function cardTemplate(trainer) {
        var profileUrl = "trainers/perfil.html?trainer=" + encodeURIComponent(trainer.slug);
        var bookingUrl = "trainers/marcar-sessao.html?trainer=" + encodeURIComponent(trainer.slug);
        var desc = trainer.description || "Acompanhamento personalizado para evolucao segura e consistente.";
        var tags = Array.isArray(trainer.tags) && trainer.tags.length > 0
            ? trainer.tags.slice(0, 3)
            : ["Treino", "Performance", "Resultados"];

        return (
            "<article class='trainer-card'>" +
                "<img class='trainer-photo-real' data-image-candidates='" + encodeURIComponent(JSON.stringify(trainer.imageCandidates || [])) + "' src='" + (trainer.imageCandidates && trainer.imageCandidates[0] ? trainer.imageCandidates[0] : "../images/trainers/" + trainer.slug + ".jpg") + "' alt='" + trainer.name + "'>" +
                "<div class='trainer-photo-slot' role='img' aria-label='Espaco para foto do treinador " + trainer.name + "' style='display:none;'><span>Espaco para Foto</span><small>Coloca a imagem em /images/trainers/" + trainer.slug + ".jpg</small></div>" +
                "<div class='trainer-card-body'>" +
                    "<h3>" + trainer.name + "</h3>" +
                    "<p class='specialization'>" + trainer.specialization + "</p>" +
                    "<p class='experience'>" + Number(trainer.experience || 0) + " anos de experiencia</p>" +
                    "<p class='description'>" + desc + "</p>" +
                    "<div class='trainer-tags'>" + tags.map(function (tag) { return "<span>" + tag + "</span>"; }).join("") + "</div>" +
                    "<div class='trainer-stats'>" +
                        "<span>" + Number(trainer.rating || 0).toFixed(1) + "/5</span>" +
                        "<span>+" + Number(trainer.clients || 0) + " clientes</span>" +
                    "</div>" +
                    "<div class='trainer-actions'>" +
                        "<a class='btn' href='" + profileUrl + "'>Ver Perfil</a>" +
                        "<a class='btn secondary' href='" + bookingUrl + "'>Marcar Sessao</a>" +
                    "</div>" +
                "</div>" +
            "</article>"
        );
    }

    function renderGrid(trainers) {
        var grid = document.getElementById("trainers-grid");
        if (!grid) {
            return;
        }

        grid.innerHTML = trainers.map(cardTemplate).join("");
        bindTrainerImages(grid);
    }

    function bindTrainerImages(scope) {
        Array.prototype.slice.call(scope.querySelectorAll(".trainer-photo-real")).forEach(function (image) {
            var raw = image.getAttribute("data-image-candidates");
            var candidates = [];
            var index = 0;

            try {
                candidates = JSON.parse(decodeURIComponent(raw || ""));
            } catch (error) {
                candidates = [];
            }

            function tryNext() {
                index += 1;
                if (index >= candidates.length) {
                    image.style.display = "none";
                    if (image.nextElementSibling) {
                        image.nextElementSibling.style.display = "grid";
                    }
                    return;
                }

                image.src = candidates[index];
            }

            image.onerror = tryNext;
        });
    }

    async function init() {
        try {
            var trainers = await readTrainers();
            renderKpis(trainers);
            renderGrid(trainers);
        } catch (error) {
            renderKpis([]);
            renderGrid([]);
        }
    }

    init();
})();
