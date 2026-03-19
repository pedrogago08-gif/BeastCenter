(function () {
    "use strict";

    var CLASSES_KEY = "beastcenter_mock_classes_v3";
    var LEGACY_CLASSES_KEYS = ["beastcenter_mock_classes_v2"];

    var rawTrainers = [
        {
            id: "trainer-tiago-rocha",
            name: "Tiago Rocha",
            specialty: "Cross Training",
            bio: "Especialista em performance, condicionamento e treino em grupo de alta intensidade.",
            initials: "TR"
        },
        {
            id: "trainer-mariana-sousa",
            name: "Mariana Sousa",
            specialty: "Yoga & Mobilidade",
            bio: "Focada em mobilidade, controlo corporal e bem-estar, com abordagem tecnica e progressiva.",
            initials: "MS"
        },
        {
            id: "trainer-diogo-martins",
            name: "Diogo Martins",
            specialty: "Spinning & HIIT",
            bio: "Conduz aulas energeticas com foco em resistencia cardiovascular e queima calorica.",
            initials: "DM"
        },
        {
            id: "trainer-ines-almeida",
            name: "Ines Almeida",
            specialty: "Pilates & Core",
            bio: "Trabalha postura, estabilidade e reforco do core com aulas acessiveis e tecnicas.",
            initials: "IA"
        },
        {
            id: "trainer-joao-freitas",
            name: "Joao Freitas",
            specialty: "Musculacao & Funcional",
            bio: "Ajuda membros a ganhar forca e consistencia com treino funcional e fundamentos solidos.",
            initials: "JF"
        },
        {
            id: "trainer-rafael-pinto",
            name: "Rafael Pinto",
            specialty: "Boxe Fitness",
            bio: "Mestre em aulas dinamicas com saco, coordenacao e trabalho tecnico de combate adaptado.",
            initials: "RP"
        }
    ];

    function slugify(value) {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, "");
    }

    function buildImageCandidates(name) {
        var slug = slugify(name);
        var titleSlug = String(name || "")
            .trim()
            .split(/\s+/)
            .map(function (part) {
                return part.charAt(0).toUpperCase() + part.slice(1);
            })
            .join("-");

        return [
            "../images/trainers/" + slug + ".jpg",
            "../images/trainers/" + slug + ".png",
            "../images/trainers/" + slug + ".jpg.png",
            "../images/trainers/" + titleSlug + ".jpg",
            "../images/trainers/" + titleSlug + ".png",
            "../images/trainers/" + titleSlug + ".jpg.png"
        ];
    }

    function withTrainerMedia(trainer) {
        var slug = slugify(trainer.name);
        return Object.assign({}, trainer, {
            slug: slug,
            imageCandidates: buildImageCandidates(trainer.name),
            profileImageCandidates: buildImageCandidates(trainer.name).map(function (path) {
                return path.replace("../images/", "../../images/");
            })
        });
    }

    var trainers = rawTrainers.map(withTrainerMedia);

    function readJson(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function writeJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function readCurrentUser() {
        return readJson("currentUser", null);
    }

    function getUserKey(user) {
        if (!user) {
            return "";
        }

        return String(user.id || user._id || user.email || "").trim().toLowerCase();
    }

    function hasActivePlan(user) {
        return !!(user && user.role === "cliente" && user.planStatus === "active" && user.paymentStatus === "paid" && user.plan && user.plan !== "none");
    }

    function nextDateForWeekday(targetWeekday, hour, minute) {
        var now = new Date();
        var currentWeekday = now.getDay();
        var normalizedTarget = Number(targetWeekday);
        var diff = normalizedTarget - currentWeekday;

        if (diff < 0) {
            diff += 7;
        }

        var date = new Date(now);
        date.setHours(hour, minute, 0, 0);
        date.setDate(now.getDate() + diff);

        if (date.getTime() <= now.getTime()) {
            date.setDate(date.getDate() + 7);
        }

        return date.toISOString();
    }

    function buildMockClasses() {
        return [
            {
                id: "class-musculacao-prime",
                title: "Musculacao Prime",
                type: "musculacao",
                description: "Sessao orientada para tecnica, progressao de carga e ganho de forca em circuito supervisionado.",
                date: nextDateForWeekday(1, 7, 30),
                time: "07:30",
                duration: 60,
                capacity: 14,
                trainerId: "trainer-joao-freitas",
                location: "Sala Strength",
                level: "Todos os niveis",
                bookedUserKeys: []
            },
            {
                id: "class-yoga-desk-reset",
                title: "Yoga Desk Reset",
                type: "yoga",
                description: "Sessao curta para mobilidade da coluna, respiracao e alivio de tensao acumulada durante o dia.",
                date: nextDateForWeekday(1, 12, 45),
                time: "12:45",
                duration: 40,
                capacity: 18,
                trainerId: "trainer-mariana-sousa",
                location: "Studio Zen",
                level: "Todos os niveis",
                bookedUserKeys: []
            },
            {
                id: "class-crossfit-engine",
                title: "Crossfit Engine",
                type: "crossfit",
                description: "WOD completo com tecnica de levantamento, bloco metabolico e finalizacao intensa.",
                date: nextDateForWeekday(1, 19, 0),
                time: "19:00",
                duration: 55,
                capacity: 18,
                trainerId: "trainer-tiago-rocha",
                location: "Box Arena",
                level: "Intermedio",
                bookedUserKeys: []
            },
            {
                id: "class-hiit-express",
                title: "HIIT Express",
                type: "hiit",
                description: "Treino rapido antes do trabalho com foco em pulso alto, potencia e trabalho metabolico.",
                date: nextDateForWeekday(2, 7, 15),
                time: "07:15",
                duration: 30,
                capacity: 16,
                trainerId: "trainer-diogo-martins",
                location: "Sala Pulse",
                level: "Todos os niveis",
                bookedUserKeys: []
            },
            {
                id: "class-yoga-flow",
                title: "Yoga Flow",
                type: "yoga",
                description: "Sequencia focada em respiracao, mobilidade global e equilibrio para recuperar do treino.",
                date: nextDateForWeekday(2, 18, 30),
                time: "18:30",
                duration: 50,
                capacity: 20,
                trainerId: "trainer-mariana-sousa",
                location: "Studio Zen",
                level: "Todos os niveis",
                bookedUserKeys: []
            },
            {
                id: "class-boxe-technique",
                title: "Boxe Technique",
                type: "boxe",
                description: "Combinacoes tecnicas, deslocamentos e rounds controlados para melhorar coordenacao e ritmo.",
                date: nextDateForWeekday(2, 20, 0),
                time: "20:00",
                duration: 50,
                capacity: 18,
                trainerId: "trainer-rafael-pinto",
                location: "Fight Lab",
                level: "Todos os niveis",
                bookedUserKeys: []
            },
            {
                id: "class-hiit-burn",
                title: "HIIT Burn",
                type: "hiit",
                description: "Blocos curtos de trabalho e recuperacao para elevar pulso, resistencia e explosao.",
                date: nextDateForWeekday(3, 7, 0),
                time: "07:00",
                duration: 35,
                capacity: 16,
                trainerId: "trainer-diogo-martins",
                location: "Sala Pulse",
                level: "Todos os niveis",
                bookedUserKeys: []
            },
            {
                id: "class-pilates-lunch",
                title: "Pilates Lunch Reset",
                type: "pilates",
                description: "Sessao ao meio-dia para ativar o core, melhorar postura e sair com mais energia.",
                date: nextDateForWeekday(3, 13, 0),
                time: "13:00",
                duration: 45,
                capacity: 14,
                trainerId: "trainer-ines-almeida",
                location: "Studio Core",
                level: "Todos os niveis",
                bookedUserKeys: []
            },
            {
                id: "class-spinning-rush",
                title: "Spinning Rush",
                type: "spinning",
                description: "Aula ritmada com picos de intensidade, subidas simuladas e trabalho cardio continuo.",
                date: nextDateForWeekday(3, 19, 30),
                time: "19:30",
                duration: 45,
                capacity: 22,
                trainerId: "trainer-diogo-martins",
                location: "Cycling Room",
                level: "Todos os niveis",
                bookedUserKeys: []
            },
            {
                id: "class-musculacao-technique",
                title: "Musculacao Technique",
                type: "musculacao",
                description: "Bloco tecnico focado em execucao, estabilidade e forca base para continuares a evoluir.",
                date: nextDateForWeekday(4, 8, 0),
                time: "08:00",
                duration: 55,
                capacity: 12,
                trainerId: "trainer-joao-freitas",
                location: "Sala Strength",
                level: "Iniciacao",
                bookedUserKeys: []
            },
            {
                id: "class-pilates-control",
                title: "Pilates Control",
                type: "pilates",
                description: "Trabalho de postura, respiracao e estabilidade para reforcar o core com controlo total.",
                date: nextDateForWeekday(4, 12, 30),
                time: "12:30",
                duration: 50,
                capacity: 14,
                trainerId: "trainer-ines-almeida",
                location: "Studio Core",
                level: "Todos os niveis",
                bookedUserKeys: []
            },
            {
                id: "class-cross-training-power",
                title: "Cross Training Power",
                type: "crossfit",
                description: "Sessao explosiva com sled, kettlebell e rounds de alta intensidade em equipa.",
                date: nextDateForWeekday(4, 18, 45),
                time: "18:45",
                duration: 55,
                capacity: 16,
                trainerId: "trainer-tiago-rocha",
                location: "Box Arena",
                level: "Intermedio",
                bookedUserKeys: []
            },
            {
                id: "class-funcional-360",
                title: "Treino Funcional 360",
                type: "funcional",
                description: "Circuito dinamico com peso corporal, kettlebells e estacoes para performance total.",
                date: nextDateForWeekday(5, 18, 0),
                time: "18:00",
                duration: 50,
                capacity: 20,
                trainerId: "trainer-joao-freitas",
                location: "Zona Performance",
                level: "Todos os niveis",
                bookedUserKeys: []
            },
            {
                id: "class-boxe-conditioning",
                title: "Boxe Conditioning",
                type: "boxe",
                description: "Rounds de saco, corda e trabalho tecnico para fechar a semana com intensidade.",
                date: nextDateForWeekday(5, 19, 15),
                time: "19:15",
                duration: 45,
                capacity: 16,
                trainerId: "trainer-rafael-pinto",
                location: "Fight Lab",
                level: "Todos os niveis",
                bookedUserKeys: []
            },
            {
                id: "class-yoga-recovery",
                title: "Yoga Recovery",
                type: "yoga",
                description: "Fluxo mais calmo ao sabado para desbloquear ancas, respiracao e mobilidade global.",
                date: nextDateForWeekday(6, 9, 0),
                time: "09:00",
                duration: 45,
                capacity: 18,
                trainerId: "trainer-mariana-sousa",
                location: "Studio Zen",
                level: "Todos os niveis",
                bookedUserKeys: []
            },
            {
                id: "class-boxe-fitness-power",
                title: "Boxe Fitness Power",
                type: "boxe",
                description: "Rounds tecnicos e cardio com saco, pads e combinacoes para descarga e coordenacao.",
                date: nextDateForWeekday(6, 10, 0),
                time: "10:00",
                duration: 45,
                capacity: 18,
                trainerId: "trainer-rafael-pinto",
                location: "Fight Lab",
                level: "Iniciacao",
                bookedUserKeys: []
            },
            {
                id: "class-musculacao-weekend",
                title: "Musculacao Weekend",
                type: "musculacao",
                description: "Treino orientado de fim de semana com foco em tecnica, full body e reforco de base.",
                date: nextDateForWeekday(6, 11, 30),
                time: "11:30",
                duration: 60,
                capacity: 14,
                trainerId: "trainer-joao-freitas",
                location: "Sala Strength",
                level: "Todos os niveis",
                bookedUserKeys: []
            },
            {
                id: "class-mobility-sunday",
                title: "Mobility Flow Sunday",
                type: "funcional",
                description: "Sessao de mobilidade ativa, estabilidade e trabalho corporal para recuperares em movimento.",
                date: nextDateForWeekday(0, 10, 30),
                time: "10:30",
                duration: 40,
                capacity: 18,
                trainerId: "trainer-mariana-sousa",
                location: "Studio Zen",
                level: "Todos os niveis",
                bookedUserKeys: []
            },
            {
                id: "class-spinning-endurance",
                title: "Spinning Endurance",
                type: "spinning",
                description: "Sessao de resistencia continua para trabalhares ritmo, cadencia e capacidade aerobica.",
                date: nextDateForWeekday(0, 11, 45),
                time: "11:45",
                duration: 50,
                capacity: 20,
                trainerId: "trainer-diogo-martins",
                location: "Cycling Room",
                level: "Todos os niveis",
                bookedUserKeys: []
            }
        ];
    }

    function mergeLegacyBookings(classes) {
        var legacyClasses = [];

        LEGACY_CLASSES_KEYS.forEach(function (key) {
            var current = readJson(key, []);
            if (Array.isArray(current) && current.length) {
                legacyClasses = legacyClasses.concat(current);
            }
        });

        if (!legacyClasses.length) {
            return classes;
        }

        return classes.map(function (item) {
            var legacy = legacyClasses.find(function (entry) {
                return entry.id === item.id;
            });

            if (!legacy || !Array.isArray(legacy.bookedUserKeys)) {
                return item;
            }

            return Object.assign({}, item, {
                bookedUserKeys: legacy.bookedUserKeys.slice()
            });
        });
    }

    function ensureSeeded() {
        var classes = readJson(CLASSES_KEY, null);
        if (!Array.isArray(classes) || classes.length === 0) {
            classes = mergeLegacyBookings(buildMockClasses());
            writeJson(CLASSES_KEY, classes);
        }
        return classes;
    }

    function enrichClass(rawClass) {
        var trainer = trainers.find(function (item) {
            return item.id === rawClass.trainerId;
        }) || null;
        var bookedUserKeys = Array.isArray(rawClass.bookedUserKeys) ? rawClass.bookedUserKeys : [];
        var availableSlots = Math.max(Number(rawClass.capacity || 0) - bookedUserKeys.length, 0);

        return Object.assign({}, rawClass, {
            trainer: trainer,
            trainerName: trainer ? trainer.name : "Trainer BeastCenter",
            trainerSpecialty: trainer ? trainer.specialty : "",
            trainerBio: trainer ? trainer.bio : "",
            trainerInitials: trainer ? trainer.initials : "BC",
            trainerSlug: trainer ? trainer.slug : "",
            trainerImageCandidates: trainer ? trainer.imageCandidates : [],
            bookedUserKeys: bookedUserKeys,
            availableSlots: availableSlots
        });
    }

    function getAllClasses() {
        return ensureSeeded().map(enrichClass).sort(function (left, right) {
            return new Date(left.date).getTime() - new Date(right.date).getTime();
        });
    }

    function saveAllClasses(classes) {
        writeJson(CLASSES_KEY, classes.map(function (item) {
            return {
                id: item.id,
                title: item.title,
                type: item.type,
                description: item.description,
                date: item.date,
                time: item.time,
                duration: item.duration,
                capacity: item.capacity,
                trainerId: item.trainerId,
                location: item.location,
                level: item.level,
                bookedUserKeys: Array.isArray(item.bookedUserKeys) ? item.bookedUserKeys : []
            };
        }));
    }

    function getById(classId) {
        return getAllClasses().find(function (item) {
            return item.id === classId;
        }) || null;
    }

    function getUserBookings(user) {
        var userKey = getUserKey(user);
        if (!userKey) {
            return [];
        }

        return getAllClasses().filter(function (item) {
            return item.bookedUserKeys.indexOf(userKey) !== -1;
        });
    }

    function filterClasses(filters) {
        var data = getAllClasses();
        var normalized = filters || {};

        return data.filter(function (item) {
            if (normalized.type && normalized.type !== "all" && item.type !== normalized.type) {
                return false;
            }

            if (normalized.trainer && normalized.trainer !== "all" && item.trainerId !== normalized.trainer) {
                return false;
            }

            if (normalized.timeOfDay && normalized.timeOfDay !== "all") {
                var hour = Number(String(item.time).split(":")[0] || 0);
                var period = hour < 12 ? "manha" : (hour < 18 ? "tarde" : "noite");
                if (period !== normalized.timeOfDay) {
                    return false;
                }
            }

            return true;
        });
    }

    function bookClass(classId, user) {
        var currentUser = user || readCurrentUser();
        var userKey = getUserKey(currentUser);
        var classes = getAllClasses();
        var target = classes.find(function (item) {
            return item.id === classId;
        });

        if (!currentUser || !userKey) {
            return { ok: false, reason: "auth_required", message: "Precisas de iniciar sessao para marcar aulas." };
        }

        if (!hasActivePlan(currentUser)) {
            return { ok: false, reason: "plan_required", message: "Precisas de um plano ativo para marcar aulas." };
        }

        if (!target) {
            return { ok: false, reason: "not_found", message: "A aula nao foi encontrada." };
        }

        if (target.bookedUserKeys.indexOf(userKey) !== -1) {
            return { ok: false, reason: "already_booked", message: "Esta aula ja esta na tua agenda." };
        }

        if (target.availableSlots <= 0) {
            return { ok: false, reason: "full", message: "Esta aula ja esgotou as vagas disponiveis." };
        }

        target.bookedUserKeys.push(userKey);
        saveAllClasses(classes);

        return {
            ok: true,
            classItem: enrichClass(target),
            message: "Aula marcada com sucesso."
        };
    }

    function cancelBooking(classId, user) {
        var currentUser = user || readCurrentUser();
        var userKey = getUserKey(currentUser);
        var classes = getAllClasses();
        var target = classes.find(function (item) {
            return item.id === classId;
        });

        if (!currentUser || !userKey) {
            return { ok: false, reason: "auth_required", message: "Sessao invalida." };
        }

        if (!target) {
            return { ok: false, reason: "not_found", message: "A aula nao foi encontrada." };
        }

        target.bookedUserKeys = target.bookedUserKeys.filter(function (entry) {
            return entry !== userKey;
        });

        saveAllClasses(classes);

        return {
            ok: true,
            classItem: enrichClass(target),
            message: "Marcacao cancelada com sucesso."
        };
    }

    function formatDate(dateString) {
        try {
            return new Intl.DateTimeFormat("pt-PT", {
                weekday: "long",
                day: "2-digit",
                month: "long"
            }).format(new Date(dateString));
        } catch (error) {
            return dateString;
        }
    }

    function formatShortDate(dateString) {
        try {
            return new Intl.DateTimeFormat("pt-PT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }).format(new Date(dateString));
        } catch (error) {
            return dateString;
        }
    }

    window.BeastCenterClasses = {
        trainers: trainers.slice(),
        readCurrentUser: readCurrentUser,
        getUserKey: getUserKey,
        hasActivePlan: hasActivePlan,
        getAllClasses: getAllClasses,
        getClassById: getById,
        getUserBookings: getUserBookings,
        filterClasses: filterClasses,
        bookClass: bookClass,
        cancelBooking: cancelBooking,
        formatDate: formatDate,
        formatShortDate: formatShortDate
    };
})();
