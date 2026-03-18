(function () {
    "use strict";

    function readCurrentUser() {
        return window.BeastCenterClasses.readCurrentUser();
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function renderSummary(bookings) {
        var summary = byId("client-bookings-summary");
        if (!summary) {
            return;
        }

        var minutes = bookings.reduce(function (sum, item) {
            return sum + Number(item.duration || 0);
        }, 0);
        var trainers = {};
        bookings.forEach(function (item) {
            trainers[item.trainerName] = true;
        });

        summary.innerHTML = [
            "<li><strong>Aulas futuras</strong><span>" + bookings.length + "</span></li>",
            "<li><strong>Total de minutos</strong><span>" + minutes + "</span></li>",
            "<li><strong>Trainers envolvidos</strong><span>" + Object.keys(trainers).length + "</span></li>"
        ].join("");
    }

    function renderBookings(bookings) {
        var container = byId("client-bookings-list");
        var badge = byId("client-bookings-badge");

        if (badge) {
            badge.textContent = String(bookings.length);
        }

        if (!container) {
            return;
        }

        if (bookings.length === 0) {
            container.innerHTML = (
                "<div class='empty-state-block'>" +
                    "<h3>Sem aulas reservadas</h3>" +
                    "<p>Assim que marcares uma aula na pagina de Aulas, ela aparece aqui com data, hora e trainer.</p>" +
                "</div>"
            );
            return;
        }

        container.innerHTML = bookings.map(function (item) {
            return (
                "<article class='booking-card'>" +
                    "<div class='booking-card-head'>" +
                        "<div>" +
                            "<span class='status-pill'>Confirmada</span>" +
                            "<h3>" + item.title + "</h3>" +
                            "<p>" + item.description + "</p>" +
                        "</div>" +
                        "<button class='btn secondary booking-cancel-btn' type='button' data-class-id='" + item.id + "'>Cancelar marcacao</button>" +
                    "</div>" +
                    "<div class='booking-meta-grid'>" +
                        "<div><strong>Data</strong><span>" + window.BeastCenterClasses.formatDate(item.date) + "</span></div>" +
                        "<div><strong>Hora</strong><span>" + item.time + "</span></div>" +
                        "<div><strong>Duracao</strong><span>" + item.duration + " min</span></div>" +
                        "<div><strong>Trainer</strong><span>" + item.trainerName + "</span></div>" +
                    "</div>" +
                "</article>"
            );
        }).join("");

        Array.prototype.slice.call(document.querySelectorAll(".booking-cancel-btn")).forEach(function (button) {
            button.addEventListener("click", function () {
                var user = readCurrentUser();
                if (!user) {
                    window.location.href = "../login.html";
                    return;
                }

                if (!window.confirm("Queres mesmo cancelar esta aula?")) {
                    return;
                }

                var result = window.BeastCenterClasses.cancelBooking(button.getAttribute("data-class-id"), user);
                if (!result.ok) {
                    window.alert(result.message);
                    return;
                }

                renderPage();
                if (typeof window.showToast === "function") {
                    window.showToast("Marcacao cancelada com sucesso.", "success");
                }
            });
        });
    }

    function renderPage() {
        var user = readCurrentUser();
        if (!user) {
            window.location.href = "../login.html";
            return;
        }

        var bookings = window.BeastCenterClasses.getUserBookings(user);
        renderBookings(bookings);
        renderSummary(bookings);
    }

    renderPage();
})();
