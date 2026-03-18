(function () {
    "use strict";

    var CLASSES_KEY = "beastcenter_mock_classes_v2";

    var trainers = [
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
            }
        ];
    }

    function ensureSeeded() {
        var classes = readJson(CLASSES_KEY, null);
        if (!Array.isArray(classes) || classes.length === 0) {
            classes = buildMockClasses();
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
