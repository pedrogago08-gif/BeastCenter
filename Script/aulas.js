(function () {
    "use strict";

    var filters = {
        type: "all",
        trainer: "all",
        timeOfDay: "all"
    };

    function getHelpers() {
        return window.BeastCenterClasses;
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function formatTypeLabel(type) {
        var labels = {
            musculacao: "Musculacao",
            crossfit: "Crossfit",
            yoga: "Yoga",
            hiit: "HIIT",
            spinning: "Spinning",
            pilates: "Pilates",
            funcional: "Treino Funcional",
            boxe: "Boxe Fitness"
        };
        return labels[type] || type;
    }

    function timeOfDayLabel(time) {
        var hour = Number(String(time).split(":")[0] || 0);
        if (hour < 12) {
            return "Manha";
        }
        if (hour < 18) {
            return "Tarde";
        }
        return "Noite";
    }

    function setStatusBanner(message, type) {
        var banner = byId("aulas-status-banner");
        if (!banner) {
            return;
        }

        banner.className = "aulas-status-banner" + (type ? " " + type : "");
        banner.textContent = message;
    }

    function renderStats(classes) {
        byId("aulas-stat-total").textContent = String(classes.length);
        byId("aulas-stat-vagas").textContent = String(classes.reduce(function (sum, item) {
            return sum + Number(item.availableSlots || 0);
        }, 0));
        byId("aulas-stat-trainers").textContent = String(getHelpers().trainers.length);
    }

    function renderFilterOptions(classes) {
        var typeSelect = byId("aulas-filter-type");
        var trainerSelect = byId("aulas-filter-trainer");
        var seenTypes = {};
        var seenTrainers = {};

        if (typeSelect) {
            typeSelect.innerHTML = "<option value='all'>Todas</option>" + classes.filter(function (item) {
                if (seenTypes[item.type]) {
                    return false;
                }
                seenTypes[item.type] = true;
                return true;
            }).map(function (item) {
                return "<option value='" + item.type + "'>" + formatTypeLabel(item.type) + "</option>";
            }).join("");
            typeSelect.value = filters.type;
        }

        if (trainerSelect) {
            trainerSelect.innerHTML = "<option value='all'>Todos</option>" + classes.filter(function (item) {
                if (seenTrainers[item.trainerId]) {
                    return false;
                }
                seenTrainers[item.trainerId] = true;
                return true;
            }).map(function (item) {
                return "<option value='" + item.trainerId + "'>" + item.trainerName + "</option>";
            }).join("");
            trainerSelect.value = filters.trainer;
        }
    }

    function renderTypeCards(classes) {
        var grid = byId("aulas-type-grid");
        var seen = {};

        if (!grid) {
            return;
        }

        var cards = classes.filter(function (item) {
            if (seen[item.type]) {
                return false;
            }
            seen[item.type] = true;
            return true;
        });

        grid.innerHTML = cards.map(function (item) {
            return (
                "<article class='aula-tipo-card'>" +
                    "<div class='icon'>" + item.trainerInitials + "</div>" +
                    "<h3>" + formatTypeLabel(item.type) + "</h3>" +
                    "<p>" + item.description + "</p>" +
                    "<span class='duracao'>" + Number(item.duration) + " min</span>" +
                "</article>"
            );
        }).join("");
    }

    function renderTrainerCards() {
        var grid = byId("aulas-trainers-grid");
        if (!grid) {
            return;
        }

        grid.innerHTML = getHelpers().trainers.map(function (trainer) {
            return (
                "<article class='aulas-trainer-card'>" +
                    "<div class='aulas-trainer-photo'>" +
                        "<span>" + trainer.initials + "</span>" +
                        "<small>Foto placeholder</small>" +
                    "</div>" +
                    "<div class='aulas-trainer-body'>" +
                        "<h3>" + trainer.name + "</h3>" +
                        "<p class='trainer-specialty'>" + trainer.specialty + "</p>" +
                        "<p>" + trainer.bio + "</p>" +
                    "</div>" +
                "</article>"
            );
        }).join("");
    }

    function renderClassCards(classes) {
        var grid = byId("aulas-cards-grid");
        var currentUser = getHelpers().readCurrentUser();
        var bookedMap = {};

        if (!grid) {
            return;
        }

        getHelpers().getUserBookings(currentUser).forEach(function (item) {
            bookedMap[item.id] = true;
        });

        if (classes.length === 0) {
            grid.innerHTML = (
                "<div class='aulas-empty-state'>" +
                    "<h3>Sem aulas para esse filtro</h3>" +
                    "<p>Ajusta os filtros para veres outras opcoes disponiveis.</p>" +
                "</div>"
            );
            return;
        }

        grid.innerHTML = classes.map(function (item) {
            var isBooked = !!bookedMap[item.id];
            return (
                "<article class='aulas-class-card'>" +
                    "<div class='aulas-class-top'>" +
                        "<div>" +
                            "<span class='class-type-pill'>" + formatTypeLabel(item.type) + "</span>" +
                            "<h3>" + item.title + "</h3>" +
                            "<p>" + item.description + "</p>" +
                        "</div>" +
                        "<div class='class-slot-badge'>" + item.availableSlots + " vagas</div>" +
                    "</div>" +
                    "<div class='aulas-class-meta'>" +
                        "<div><strong>Data</strong><span>" + getHelpers().formatDate(item.date) + "</span></div>" +
                        "<div><strong>Hora</strong><span>" + item.time + "</span></div>" +
                        "<div><strong>Duracao</strong><span>" + item.duration + " min</span></div>" +
                        "<div><strong>Local</strong><span>" + item.location + "</span></div>" +
                    "</div>" +
                    "<div class='aulas-trainer-strip'>" +
                        "<div class='trainer-mini-avatar'>" + item.trainerInitials + "</div>" +
                        "<div>" +
                            "<strong>" + item.trainerName + "</strong>" +
                            "<span>" + item.trainerSpecialty + "</span>" +
                        "</div>" +
                    "</div>" +
                    "<div class='aulas-class-footer'>" +
                        "<div class='class-extra'>" +
                            "<span>Nivel: " + item.level + "</span>" +
                            "<span>" + timeOfDayLabel(item.time) + "</span>" +
                        "</div>" +
                        "<button class='btn class-book-btn' data-class-id='" + item.id + "' " + (isBooked ? "disabled" : "") + ">" + (isBooked ? "Ja marcada" : "Marcar aula") + "</button>" +
                    "</div>" +
                "</article>"
            );
        }).join("");
    }

    function updateBannerByUser() {
        var currentUser = getHelpers().readCurrentUser();

        if (!currentUser) {
            setStatusBanner("Inicia sessao ou cria conta para comecares a marcar aulas.", "");
            return;
        }

        if (!getHelpers().hasActivePlan(currentUser)) {
            setStatusBanner("Tens sessao iniciada, mas precisas de um plano ativo para reservar vagas nas aulas.", "warning");
            return;
        }

        setStatusBanner("Ja tens acesso completo. Escolhe uma aula e confirma a tua vaga.", "success");
    }

    function rerender() {
        var classes = getHelpers().filterClasses(filters);
        renderClassCards(classes);
        updateBannerByUser();
        bindBookingButtons();
    }

    function handleBooking(classId) {
        var currentUser = getHelpers().readCurrentUser();

        if (!currentUser) {
            setStatusBanner("Precisas de iniciar sessao para marcar aulas.", "warning");
            window.alert("Precisas de iniciar sessao para marcar aulas.");
            window.location.href = "login.html";
            return;
        }

        if (!getHelpers().hasActivePlan(currentUser)) {
            setStatusBanner("Precisas de aderir a um plano para reservar vagas.", "warning");
            window.alert("Precisas de um plano ativo para marcar aulas.");
            window.location.href = "planos.html";
            return;
        }

        var result = getHelpers().bookClass(classId, currentUser);
        if (!result.ok) {
            setStatusBanner(result.message, "warning");
            window.alert(result.message);
            return;
        }

        setStatusBanner("Aula marcada com sucesso. Ja aparece em 'Minhas Aulas' no teu dashboard.", "success");
        if (typeof window.showToast === "function") {
            window.showToast("Aula marcada com sucesso.", "success");
        } else {
            window.alert("Aula marcada com sucesso.");
        }
        renderStats(getHelpers().getAllClasses());
        rerender();
    }

    function bindBookingButtons() {
        Array.prototype.slice.call(document.querySelectorAll(".class-book-btn")).forEach(function (button) {
            button.addEventListener("click", function () {
                handleBooking(button.getAttribute("data-class-id"));
            });
        });
    }

    function bindFilters() {
        var typeSelect = byId("aulas-filter-type");
        var trainerSelect = byId("aulas-filter-trainer");
        var timeSelect = byId("aulas-filter-time");

        if (typeSelect) {
            typeSelect.addEventListener("change", function () {
                filters.type = typeSelect.value;
                rerender();
            });
        }

        if (trainerSelect) {
            trainerSelect.addEventListener("change", function () {
                filters.trainer = trainerSelect.value;
                rerender();
            });
        }

        if (timeSelect) {
            timeSelect.addEventListener("change", function () {
                filters.timeOfDay = timeSelect.value;
                rerender();
            });
        }
    }

    function init() {
        var allClasses = getHelpers().getAllClasses();
        renderStats(allClasses);
        renderFilterOptions(allClasses);
        renderTypeCards(allClasses);
        renderTrainerCards();
        bindFilters();
        rerender();
    }

    init();
})();
