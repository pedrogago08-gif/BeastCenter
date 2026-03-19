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

    function weekdayKey(dateString) {
        var date = new Date(dateString);
        var day = date.getDay();
        return day === 0 ? 7 : day;
    }

    function formatWeekdayLabel(dateString) {
        try {
            return new Intl.DateTimeFormat("pt-PT", {
                weekday: "long"
            }).format(new Date(dateString));
        } catch (error) {
            return "";
        }
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
        return Number(value || 0).toFixed(2).replace(".", ",") + "€";
    }

    function setStatusBanner(message, type) {
        var banner = byId("aulas-status-banner");
        if (!banner) {
            return;
        }

        banner.className = "aulas-status-banner" + (type ? " " + type : "");
        banner.textContent = message;
    }

    function getDashboardUrl() {
        return "cliente/dashboard.html";
    }

    function updateCtaByUser() {
        var user = getHelpers().readCurrentUser();
        var title = byId("aulas-cta-title");
        var copy = byId("aulas-cta-copy");
        var button = byId("aulas-cta-button");

        if (!title || !copy || !button) {
            return;
        }

        if (!user) {
            title.textContent = "A tua agenda comeca aqui";
            copy.textContent = "Cria conta, escolhe um plano e reserva as aulas que melhor encaixam na tua semana.";
            button.textContent = "Criar conta";
            button.onclick = function () {
                window.location.href = "login.html";
            };
            return;
        }

        if (!getHelpers().hasActivePlan(user)) {
            title.textContent = "Ativa o teu plano para reservar";
            copy.textContent = "Ja tens conta iniciada. Falta so ativares um plano para começares a marcar as aulas da semana.";
            button.textContent = "Ver Planos";
            button.onclick = function () {
                window.location.href = "planos.html";
            };
            return;
        }

        title.textContent = "Ja tens acesso completo";
        copy.textContent = "O teu plano esta ativo. Marca aulas acima e acompanha tudo no teu dashboard pessoal.";
        button.textContent = "Abrir Dashboard";
        button.onclick = function () {
            window.location.href = getDashboardUrl();
        };
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

        if (filters.timeOfDay !== "all") {
            var hour = Number(String(item.time).split(":")[0] || 0);
            var period = hour < 12 ? "manha" : (hour < 18 ? "tarde" : "noite");
            if (period !== filters.timeOfDay) {
                return false;
            }
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
                                    return (
                                        "<button type='button' class='aulas-week-item aulas-week-item-button" + (isMatch ? " is-match" : " is-muted") + "' data-class-id='" + item.id + "'>" +
                                            "<div class='aulas-week-item-top'>" +
                                                "<strong>" + item.time + "</strong>" +
                                                "<span>" + item.availableSlots + " vagas</span>" +
                                            "</div>" +
                                            "<h4>" + item.title + "</h4>" +
                                            "<p>" + item.trainerName + "</p>" +
                                            "<div class='aulas-week-item-footer'>" +
                                                "<span>Taxa " + formatPrice(item.bookingFee || 5) + "</span>" +
                                                "<strong>Marcar vaga</strong>" +
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
                    setStatusBanner("Precisas de iniciar sessao para marcares uma vaga nesta aula.", "warning");
                    window.alert("Precisas de iniciar sessao para marcares uma vaga nesta aula.");
                    window.location.href = "login.html";
                    return;
                }

                if (!getHelpers().hasActivePlan(currentUser)) {
                    setStatusBanner("Precisas de um plano ativo para reservares esta aula.", "warning");
                    window.alert("Precisas de um plano ativo para marcar uma vaga nesta aula.");
                    window.location.href = "planos.html";
                    return;
                }

                if (!window.confirm("Queres marcar uma vaga para " + item.title + " em " + getHelpers().formatShortDate(item.date) + " às " + item.time + "?\n\nTaxa de reserva: " + formatPrice(item.bookingFee || 5))) {
                    return;
                }

                handleBooking(classId);
            });
        });
    }

    function renderClassCards(classes) {
        var grid = byId("aulas-cards-grid");
        var currentUser = getHelpers().readCurrentUser();
        var hasPlanAccess = getHelpers().hasActivePlan(currentUser);
        var bookedMap = {};

        if (!grid) {
            return;
        }

        getHelpers().getUserBookings(currentUser).forEach(function (item) {
            bookedMap[item.id] = true;
        });

        grid.innerHTML = classes.map(function (item) {
            var isBooked = !!bookedMap[item.id];
            var isMatch = !hasActiveFilters() || matchesFilters(item);
            var actionMarkup = "";

            if (!currentUser) {
                actionMarkup = "<span class='class-action-note'>Inicia sessao para marcares esta aula.</span>";
            } else if (!hasPlanAccess) {
                actionMarkup = "<span class='class-action-note warning'>Precisas de um plano ativo para reservar vaga.</span>";
            } else {
                actionMarkup = "<button class='btn class-book-btn' data-class-id='" + item.id + "' " + (isBooked ? "disabled" : "") + ">" + (isBooked ? "Ja marcada" : "Marcar aula") + "</button>";
            }

            return (
                "<article class='aulas-class-card" + (isMatch ? " is-match" : " is-muted") + "'>" +
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
                        "<div class='trainer-mini-avatar'>" +
                            "<img class='trainer-mini-avatar-image' src='" + (item.trainerImageCandidates && item.trainerImageCandidates[0] ? item.trainerImageCandidates[0] : "") + "' alt='" + item.trainerName + "' data-image-candidates='" + encodeURIComponent(JSON.stringify(item.trainerImageCandidates || [])) + "'>" +
                            "<span class='trainer-mini-avatar-fallback' style='display:none;'>" + item.trainerInitials + "</span>" +
                        "</div>" +
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
                        actionMarkup +
                    "</div>" +
                "</article>"
            );
        }).join("");

        bindImageFallbacks(grid, ".trainer-mini-avatar-image", ".trainer-mini-avatar-fallback");
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

        setStatusBanner("Ja tens acesso completo. Escolhe uma aula e confirma a tua vaga.", "success");
    }

    function rerender() {
        var classes = getHelpers().getAllClasses();
        renderWeeklySchedule(classes);
        renderClassCards(classes);
        updateBannerByUser();
        updateCtaByUser();
        bindBookingButtons();
        bindWeeklyBookings();
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
        updateCtaByUser();
        rerender();
    }

    init();
})();
