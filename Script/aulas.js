(function () {
    "use strict";

    var filters = {
        type: "all",
        trainer: "all",
        timeOfDay: "all"
    };
    var NO_SHOW_FEE = 5;
    var pendingBookingClassId = "";

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

    function weekdayKey(dateString) {
        var date = new Date(dateString);
        var day = date.getDay();
        return day === 0 ? 7 : day;
    }

    function formatDayNumber(dateString) {
        try {
            return new Intl.DateTimeFormat("pt-PT", {
                day: "2-digit",
                month: "2-digit"
            }).format(new Date(dateString));
        } catch (error) {
            return dateString;
        }
    }

    function formatPrice(value) {
        return Number(value || 0).toFixed(2).replace(".", ",") + " EUR";
    }

    function setText(id, value) {
        var node = byId(id);
        if (node) {
            node.textContent = value;
        }
    }

    function setStatusBanner(message, type) {
        var banner = byId("aulas-status-banner");
        if (!banner) {
            return;
        }

        banner.className = "aulas-status-banner" + (type ? " " + type : "");
        banner.textContent = message;
    }

    function hasActiveFilters() {
        return filters.type !== "all" || filters.trainer !== "all" || filters.timeOfDay !== "all";
    }

    function matchesFilters(item) {
        if (filters.type !== "all" && item.type !== filters.type) {
            return false;
        }

        if (filters.trainer !== "all" && item.trainerId !== filters.trainer) {
            return false;
        }

        if (filters.timeOfDay !== "all" && timeOfDayLabel(item.time).toLowerCase() !== filters.timeOfDay) {
            return false;
        }

        return true;
    }

    function bindImageFallbacks(scope, imageSelector, fallbackSelector) {
        if (!scope) {
            return;
        }

        Array.prototype.slice.call(scope.querySelectorAll(imageSelector)).forEach(function (image) {
            var raw = image.getAttribute("data-image-candidates");
            var candidates = [];
            var index = 0;

            try {
                candidates = JSON.parse(decodeURIComponent(raw || ""));
            } catch (error) {
                candidates = [];
            }

            image.onerror = function () {
                index += 1;
                if (index < candidates.length) {
                    image.src = candidates[index];
                    return;
                }

                image.style.display = "none";
                var fallback = image.parentElement ? image.parentElement.querySelector(fallbackSelector) : null;
                if (fallback) {
                    fallback.style.display = "grid";
                }
            };
        });
    }

    function openBookingModal(item) {
        var modal = byId("class-booking-modal");
        var summary = byId("class-booking-summary");

        if (!modal || !item) {
            return;
        }

        pendingBookingClassId = item.id;

        if (summary) {
            summary.textContent = item.title + " | " + getHelpers().formatShortDate(item.date) + " as " + item.time + " | " + item.trainerName + ".";
        }

        modal.hidden = false;
        document.body.classList.add("modal-open");
    }

    function closeBookingModal() {
        var modal = byId("class-booking-modal");
        pendingBookingClassId = "";

        if (!modal) {
            return;
        }

        modal.hidden = true;
        document.body.classList.remove("modal-open");
    }

    function renderStats(classes) {
        setText("aulas-stat-total", String(classes.length));
        setText("aulas-stat-vagas", String(classes.reduce(function (sum, item) {
            return sum + Number(item.availableSlots || 0);
        }, 0)));
        setText("aulas-stat-trainers", String(getHelpers().trainers.length));
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

        grid.innerHTML = classes.filter(function (item) {
            if (seen[item.type]) {
                return false;
            }
            seen[item.type] = true;
            return true;
        }).map(function (item) {
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
                        "<img class='aulas-trainer-photo-real' src='" + (trainer.imageCandidates && trainer.imageCandidates[0] ? trainer.imageCandidates[0] : "") + "' alt='" + trainer.name + "' data-image-candidates='" + encodeURIComponent(JSON.stringify(trainer.imageCandidates || [])) + "'>" +
                        "<div class='aulas-trainer-photo-fallback' style='display:none;'>" +
                            "<span>" + trainer.initials + "</span>" +
                        "</div>" +
                    "</div>" +
                    "<div class='aulas-trainer-body'>" +
                        "<h3>" + trainer.name + "</h3>" +
                        "<p class='trainer-specialty'>" + trainer.specialty + "</p>" +
                        "<p>" + trainer.bio + "</p>" +
                    "</div>" +
                "</article>"
            );
        }).join("");

        bindImageFallbacks(grid, ".aulas-trainer-photo-real", ".aulas-trainer-photo-fallback");
    }

    function renderWeeklySchedule(classes) {
        var grid = byId("aulas-week-grid");
        var dayLabels = {
            1: "Segunda",
            2: "Terca",
            3: "Quarta",
            4: "Quinta",
            5: "Sexta",
            6: "Sabado",
            7: "Domingo"
        };
        var grouped = {
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: [],
            7: []
        };
        var dayOrder = [1, 2, 3, 4, 5, 6, 7];

        if (!grid) {
            return;
        }

        classes.forEach(function (item) {
            grouped[weekdayKey(item.date)].push(item);
        });

        grid.innerHTML = dayOrder.map(function (dayKey) {
            var items = grouped[dayKey];
            var firstDate = items[0] ? formatDayNumber(items[0].date) : "";

            return (
                "<article class='aulas-week-day'>" +
                    "<div class='aulas-week-head'>" +
                        "<h3>" + dayLabels[dayKey] + "</h3>" +
                        "<span>" + (firstDate || "Sem data") + "</span>" +
                    "</div>" +
                    "<div class='aulas-week-list'>" +
                        (
                            items.length
                                ? items.map(function (item) {
                                    var isMatch = !hasActiveFilters() || matchesFilters(item);
                                    var isDisabled = hasActiveFilters() && !isMatch;

                                    return (
                                        "<button type='button' class='aulas-week-item aulas-week-item-button" + (isMatch ? " is-match" : " is-muted") + "' data-class-id='" + item.id + "'" + (isDisabled ? " disabled aria-disabled='true'" : "") + ">" +
                                            "<div class='aulas-week-item-top'>" +
                                                "<strong>" + item.time + "</strong>" +
                                                "<span>" + item.availableSlots + " vagas</span>" +
                                            "</div>" +
                                            "<h4>" + item.title + "</h4>" +
                                            "<p>" + item.trainerName + "</p>" +
                                            "<div class='aulas-week-item-footer'>" +
                                                "<span>Clica para reservar</span>" +
                                                "<strong>Marcar aula</strong>" +
                                            "</div>" +
                                        "</button>"
                                    );
                                }).join("")
                                : "<div class='aulas-week-empty'>Sem aulas agendadas neste dia.</div>"
                        ) +
                    "</div>" +
                "</article>"
            );
        }).join("");
    }

    function redirectToLogin() {
        setStatusBanner("Precisas de iniciar sessao para marcares uma vaga nesta aula.", "warning");
        window.location.href = "login.html";
    }

    function redirectToPlans() {
        setStatusBanner("Precisas de um plano ativo para reservares esta aula.", "warning");
        window.location.href = "planos.html";
    }

    function bindWeeklyBookings() {
        Array.prototype.slice.call(document.querySelectorAll(".aulas-week-item-button")).forEach(function (button) {
            button.addEventListener("click", function () {
                var classId = button.getAttribute("data-class-id");
                var item = getHelpers().getClassById(classId);
                var currentUser = getHelpers().readCurrentUser();

                if (!item) {
                    return;
                }

                if (!currentUser) {
                    redirectToLogin();
                    return;
                }

                if (!getHelpers().hasActivePlan(currentUser)) {
                    redirectToPlans();
                    return;
                }

                openBookingModal(item);
            });
        });
    }

    function bindBookingModal() {
        var cancelButton = byId("class-booking-cancel");
        var confirmButton = byId("class-booking-confirm");
        var backdrop = byId("class-booking-backdrop");

        if (cancelButton) {
            cancelButton.addEventListener("click", function () {
                closeBookingModal();
            });
        }

        if (backdrop) {
            backdrop.addEventListener("click", function () {
                closeBookingModal();
            });
        }

        if (confirmButton) {
            confirmButton.addEventListener("click", function () {
                var classId = pendingBookingClassId;

                if (!classId) {
                    closeBookingModal();
                    return;
                }

                closeBookingModal();
                handleBooking(classId);
            });
        }

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeBookingModal();
            }
        });
    }

    function updateBannerByUser() {
        var currentUser = getHelpers().readCurrentUser();

        if (!currentUser) {
            setStatusBanner("Sem sessao iniciada: podes consultar toda a agenda, mas a marcacao so fica disponivel depois de iniciares sessao e ativares um plano.", "");
            return;
        }

        if (!getHelpers().hasActivePlan(currentUser)) {
            setStatusBanner("Tens sessao iniciada, mas ainda precisas de escolher e ativar um plano para reservar vagas nas aulas.", "warning");
            return;
        }

        setStatusBanner("Ja tens acesso completo. Clica numa aula do horario para reservares a tua vaga. Se faltares sem desmarcar, aplica-se multa de " + formatPrice(NO_SHOW_FEE) + ".", "success");
    }

    function handleBooking(classId) {
        var currentUser = getHelpers().readCurrentUser();
        var result;

        if (!currentUser) {
            redirectToLogin();
            return;
        }

        if (!getHelpers().hasActivePlan(currentUser)) {
            redirectToPlans();
            return;
        }

        result = getHelpers().bookClass(classId, currentUser);
        if (!result.ok) {
            setStatusBanner(result.message, "warning");
            if (typeof window.showToast === "function") {
                window.showToast(result.message, "warning");
            }
            return;
        }

        setStatusBanner("Aula marcada com sucesso. Ja aparece em 'Minhas Aulas' no teu dashboard.", "success");
        if (typeof window.showToast === "function") {
            window.showToast("Aula marcada com sucesso.", "success");
        }

        renderStats(getHelpers().getAllClasses());
        rerender();
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

    function rerender() {
        var classes = getHelpers().getAllClasses();
        renderWeeklySchedule(classes);
        updateBannerByUser();
        bindWeeklyBookings();
    }

    function init() {
        var allClasses = getHelpers().getAllClasses();

        closeBookingModal();
        renderStats(allClasses);
        renderFilterOptions(allClasses);
        renderTypeCards(allClasses);
        renderTrainerCards();
        bindFilters();
        bindBookingModal();
        rerender();
    }

    init();
})();
