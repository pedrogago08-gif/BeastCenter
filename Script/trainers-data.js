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

    function withDerivedFields(trainer) {
        var slug = slugify(trainer.name);
        return Object.assign({}, trainer, {
            slug: slug,
            image: trainer.image || "../../images/trainers/" + slug + ".jpg",
            publicImage: trainer.image || "../images/trainers/" + slug + ".jpg"
        });
    }

    async function readPublicTrainers() {
        if (!window.BeastCenterApi) {
            return mockTrainers.map(withDerivedFields);
        }

        try {
            var trainers = await window.BeastCenterApi.getTrainers();
            var active = trainers.filter(function (trainer) {
                return trainer.status === "ativo";
            });

            return (active.length > 0 ? active : mockTrainers).map(withDerivedFields);
        } catch (error) {
            return mockTrainers.map(withDerivedFields);
        }
    }

    async function readTrainerBySlug(slug) {
        var trainers = await readPublicTrainers();
        return trainers.find(function (trainer) {
            return trainer.slug === slug;
        }) || null;
    }

    window.BeastCenterTrainersData = {
        slugify: slugify,
        mockTrainers: mockTrainers.map(withDerivedFields),
        readPublicTrainers: readPublicTrainers,
        readTrainerBySlug: readTrainerBySlug
    };
})();
