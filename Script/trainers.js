(function () {
    "use strict";

    var mockTrainers = [
        {
            name: "Tiago Rocha",
            specialization: "Hipertrofia e Performance",
            experience: 8,
            description: "Especialista em ganho de massa muscular, progressao de carga e periodizacao para resultados consistentes.",
            rating: 4.9,
            clients: 48,
            status: "ativo",
            tags: ["Hipertrofia", "Forca", "Performance"]
        },
        {
            name: "Mariana Sousa",
            specialization: "Emagrecimento e Mobilidade",
            experience: 6,
            description: "Trabalha recomposicao corporal, mobilidade e aderencia ao treino com abordagem proxima e tecnica.",
            rating: 4.8,
            clients: 39,
            status: "ativo",
            tags: ["Emagrecimento", "Mobilidade", "Bem-estar"]
        },
        {
            name: "Diogo Martins",
            specialization: "Condicionamento Fisico",
            experience: 7,
            description: "Focado em resistencia, condicionamento e preparacao fisica geral para membros de todos os niveis.",
            rating: 4.7,
            clients: 44,
            status: "ativo",
            tags: ["Cardio", "HIIT", "Condicao Fisica"]
        },
        {
            name: "Ines Almeida",
            specialization: "Pilates e Core",
            experience: 5,
            description: "Ajuda a melhorar postura, estabilidade e controlo corporal com acompanhamento personalizado.",
            rating: 4.9,
            clients: 31,
            status: "ativo",
            tags: ["Pilates", "Core", "Postura"]
        },
        {
            name: "Joao Freitas",
            specialization: "Forca e Treino Funcional",
            experience: 9,
            description: "Especialista em progressao de forca, tecnica de base e treino funcional aplicado ao dia a dia.",
            rating: 4.8,
            clients: 52,
            status: "ativo",
            tags: ["Forca", "Funcional", "Tecnica"]
        },
        {
            name: "Rafael Pinto",
            specialization: "Boxe Fitness e Agilidade",
            experience: 6,
            description: "Conduz sessoes intensas com foco em coordenacao, explosao, resistencia e tecnica de combate adaptada.",
            rating: 4.7,
            clients: 37,
            status: "ativo",
            tags: ["Boxe", "Agilidade", "Cardio"]
        },
        {
            name: "Sofia Carvalho",
            specialization: "Recomposicao Corporal",
            experience: 5,
            description: "Ajuda membros a perder gordura e ganhar definicao com planos ajustados a rotina e experiencia.",
            rating: 4.8,
            clients: 33,
            status: "ativo",
            tags: ["Definicao", "Motivacao", "Resultados"]
        },
        {
            name: "Pedro Nunes",
            specialization: "Preparacao Atletica",
            experience: 10,
            description: "Focado em velocidade, potencia e performance para praticantes que querem subir de nivel fisico.",
            rating: 4.9,
            clients: 41,
            status: "ativo",
            tags: ["Potencia", "Velocidade", "Atletico"]
        }
    ];

    function slugify(value) {
        return (value || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, "");
    }

    async function readTrainers() {
        if (!window.BeastCenterApi) {
            return mockTrainers;
        }

        try {
            var trainers = await window.BeastCenterApi.getTrainers();
            var active = trainers.filter(function (trainer) {
                return trainer.status === "ativo";
            });

            return active.length > 0 ? active : mockTrainers;
        } catch (error) {
            return mockTrainers;
        }
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
                    : "<div class='trainer-photo-slot' role='img' aria-label='Espaco para foto do treinador " + trainer.name + "'><span>Espaco para Foto</span><small>Coloca a imagem em /images/trainers/" + nameSlug + ".jpg</small></div>"
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
