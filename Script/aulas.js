(function () {
    "use strict";

    var days = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
    var dayLabels = {
        segunda: "Segunda",
        terca: "Terca",
        quarta: "Quarta",
        quinta: "Quinta",
        sexta: "Sexta",
        sabado: "Sabado"
    };

    function getTypeCards(classes) {
        var seen = {};
        return classes.filter(function (item) {
            if (!item.category || seen[item.category]) {
                return false;
            }
            seen[item.category] = true;
            return true;
        });
    }

    function renderTypeCards(classes) {
        var grid = document.querySelector(".aulas-grid");
        if (!grid) {
            return;
        }

        var cards = getTypeCards(classes);
        if (cards.length === 0) {
            grid.innerHTML = "<p class='subtitle'>Sem aulas publicadas neste momento.</p>";
            return;
        }

        grid.innerHTML = cards.map(function (item) {
            return (
                "<div class='aula-tipo-card'>" +
                    "<div class='icon'></div>" +
                    "<h3>" + item.title + "</h3>" +
                    "<p>" + (item.description || "Aula disponivel para inscricoes.") + "</p>" +
                    "<span class='duracao'>" + Number(item.duration || 45) + " min</span>" +
                "</div>"
            );
        }).join("");
    }

    function renderSchedule(classes) {
        var tbody = document.getElementById("classes-schedule-body");
        if (!tbody) {
            return;
        }

        var activeClasses = classes.filter(function (item) {
            return item.status === "ativa";
        });
        var timeMap = {};

        activeClasses.forEach(function (item) {
            if (!timeMap[item.time]) {
                timeMap[item.time] = {};
            }
            timeMap[item.time][item.dayOfWeek] = item;
        });

        var times = Object.keys(timeMap).sort();
        if (times.length === 0) {
            tbody.innerHTML = "<tr><td colspan='7'>Sem aulas publicadas neste momento.</td></tr>";
            return;
        }

        tbody.innerHTML = times.map(function (time) {
            var cells = days.map(function (day) {
                var item = timeMap[time][day];
                if (!item) {
                    return "<td></td>";
                }
                return "<td class='aula-cell " + item.category + "'>" + item.title + "<br><small>" + item.trainerName + "</small></td>";
            }).join("");

            return "<tr><td>" + time + "</td>" + cells + "</tr>";
        }).join("");
    }

    async function init() {
        try {
            var classes = await window.BeastCenterApi.getClasses();
            renderTypeCards(classes);
            renderSchedule(classes);
        } catch (error) {
            renderTypeCards([]);
            renderSchedule([]);
        }
    }

    init();
})();
