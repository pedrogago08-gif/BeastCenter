(function () {
    "use strict";

    function slugify(value) {
        return (value || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, "");
    }

    async function readTrainers() {
        if (!window.BeastCenterApi) {
            return [];
        }

        var trainers = await window.BeastCenterApi.getTrainers();
        return trainers.filter(function (trainer) {
            return trainer.status === "ativo";
        });
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
        var hasImage = !!trainer.image;
        var nameSlug = slugify(trainer.name);
        var profileUrl = "trainers/perfil-" + nameSlug + ".html";
        var bookingUrl = "trainers/marcar-sessao.html?trainer=" + encodeURIComponent(nameSlug);
        var desc = trainer.description || "Acompanhamento personalizado para evolucao segura e consistente.";
        var tags = Array.isArray(trainer.tags) && trainer.tags.length > 0
            ? trainer.tags.slice(0, 3)
            : ["Treino", "Performance", "Resultados"];

        return (
            "<article class='trainer-card'>" +
                (hasImage
                    ? "<img class='trainer-photo-real' src='" + trainer.image + "' alt='" + trainer.name + "' onerror=\"this.style.display='none';this.nextElementSibling.style.display='grid';\">" +
                      "<div class='trainer-photo-slot' role='img' aria-label='Espaco para foto do treinador " + trainer.name + "' style='display:none;'><span>Espaco para Foto</span><small>" + trainer.image + "</small></div>"
                    : "<div class='trainer-photo-slot' role='img' aria-label='Espaco para foto do treinador " + trainer.name + "'><span>Espaco para Foto</span><small>/images/trainers/" + nameSlug + ".jpg</small></div>"
                ) +
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
                        "<button class='btn' onclick=\"window.location.href='" + profileUrl + "'\">Ver Perfil</button>" +
                        "<button class='btn secondary' onclick=\"window.location.href='" + bookingUrl + "'\">Marcar Sessao</button>" +
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

        if (trainers.length === 0) {
            grid.innerHTML = "<p class='subtitle'>Sem trainers ativos neste momento.</p>";
            return;
        }

        grid.innerHTML = trainers.map(cardTemplate).join("");
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
