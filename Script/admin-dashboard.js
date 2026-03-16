(function () {
    "use strict";

    function readJson(key) {
        try {
            var raw = localStorage.getItem(key);
            var parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function getUsers() {
        var users = readJson("beastcenter_admin_users");
        if (users.length === 0) {
            users = readJson("users");
        }

        return users.filter(function (user) {
            return user.role !== "admin";
        });
    }

    function getTrainers() {
        return readJson("beastcenter_admin_trainers");
    }

    function getClasses() {
        return readJson("beastcenter_admin_classes");
    }

    function setStatValues(users, trainers, classes) {
        var statNumbers = document.querySelectorAll(".stat-card .stat-info h3");
        var statLabels = document.querySelectorAll(".stat-card .stat-info p");
        var activeUsers = users.filter(function (user) { return user.status === "ativo"; }).length;
        var estimatedRevenue = users.reduce(function (total, user) {
            if (user.plan === "premium") {
                return total + 49.99;
            }
            if (user.plan === "extra") {
                return total + 31.99;
            }
            if (user.plan === "basico") {
                return total + 19.99;
            }
            return total;
        }, 0);
        var weeklyClasses = classes.filter(function (item) { return item.status === "ativa"; }).length;
        var occupancy = users.length === 0 ? 0 : Math.min(98, Math.round((activeUsers / users.length) * 100));

        if (statNumbers[0]) {
            statNumbers[0].textContent = String(activeUsers);
        }
        if (statLabels[0]) {
            statLabels[0].textContent = "Membros Ativos";
        }
        if (statNumbers[1]) {
            statNumbers[1].textContent = "EUR " + estimatedRevenue.toFixed(0);
        }
        if (statLabels[1]) {
            statLabels[1].textContent = "Receita Estimada";
        }
        if (statNumbers[2]) {
            statNumbers[2].textContent = String(weeklyClasses);
        }
        if (statLabels[2]) {
            statLabels[2].textContent = "Aulas Planeadas";
        }
        if (statNumbers[3]) {
            statNumbers[3].textContent = String(occupancy) + "%";
        }
        if (statLabels[3]) {
            statLabels[3].textContent = "Taxa de Ocupacao";
        }
    }

    function renderRecentActivity(users, trainers, classes) {
        var container = document.querySelector(".atividade-list");
        var recentUsers = users.slice().sort(function (a, b) {
            return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
        }).slice(0, 3);
        var recentTrainers = trainers.slice().sort(function (a, b) {
            return Number(b.id) - Number(a.id);
        }).slice(0, 2);
        var recentClasses = classes.slice().sort(function (a, b) {
            return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
        }).slice(0, 2);
        var cards = [];

        if (!container) {
            return;
        }

        cards = recentUsers.map(function (user) {
            return (
                "<div class='atividade-item'>" +
                    "<div class='atividade-icon novo'>+</div>" +
                    "<div class='atividade-info'>" +
                        "<p><strong>Novo registo:</strong> " + user.name + " criou conta no plano " + user.plan + "</p>" +
                        "<span class='time'>" + (user.lastActivity || "Recente") + "</span>" +
                    "</div>" +
                "</div>"
            );
        }).concat(recentTrainers.map(function (trainer) {
            return (
                "<div class='atividade-item'>" +
                    "<div class='atividade-icon edit'></div>" +
                    "<div class='atividade-info'>" +
                        "<p><strong>Trainer atualizado:</strong> " + trainer.name + " esta com estado " + trainer.status + "</p>" +
                        "<span class='time'>Atualizado no painel</span>" +
                    "</div>" +
                "</div>"
            );
        })).concat(recentClasses.map(function (classItem) {
            return (
                "<div class='atividade-item'>" +
                    "<div class='atividade-icon compra'></div>" +
                    "<div class='atividade-info'>" +
                        "<p><strong>Aula publicada:</strong> " + classItem.title + " na " + classItem.dayOfWeek + " as " + classItem.time + "</p>" +
                        "<span class='time'>" + (classItem.location || "Horario atualizado") + "</span>" +
                    "</div>" +
                "</div>"
            );
        }));

        if (cards.length === 0) {
            cards = ["<div class='atividade-item'><div class='atividade-info'><p>Ainda nao ha atividade real para mostrar.</p><span class='time'>Os eventos vao aparecer quando houver contas, inscricoes e operacoes reais.</span></div></div>"];
        }

        container.innerHTML = cards.join("");
    }

    function renderPlanLegend(users) {
        var legend = document.querySelector(".planos-legend");
        var total = Math.max(users.length, 1);
        var counts = {
            basico: users.filter(function (user) { return user.plan === "basico"; }).length,
            extra: users.filter(function (user) { return user.plan === "extra"; }).length,
            premium: users.filter(function (user) { return user.plan === "premium"; }).length
        };

        if (!legend) {
            return;
        }

        legend.innerHTML = [
            { key: "basico", label: "Basico" },
            { key: "extra", label: "Extra" },
            { key: "premium", label: "Premium" }
        ].map(function (item) {
            var count = counts[item.key];
            var percent = Math.round((count / total) * 100);
            return "<div class='legend-item'><span class='color-box " + item.key + "'></span><span>" + item.label + ": " + count + " membros (" + percent + "%)</span></div>";
        }).join("");
    }

    function renderTopTrainers(trainers) {
        var container = document.querySelector(".top-trainers");
        var sorted = trainers.slice().sort(function (a, b) {
            return Number(b.rating || 0) - Number(a.rating || 0);
        }).slice(0, 3);

        if (!container) {
            return;
        }

        if (sorted.length === 0) {
            container.innerHTML = "<p>Sem trainers registados.</p>";
            return;
        }

        container.innerHTML = sorted.map(function (trainer) {
            return (
                "<div class='trainer-rank-item'>" +
                    "<span class='trainer-avatar-fallback'>" + trainer.name.split(" ").map(function (part) { return part[0]; }).slice(0, 2).join("").toUpperCase() + "</span>" +
                    "<div class='trainer-info'>" +
                        "<h4>" + trainer.name + "</h4>" +
                        "<p>" + trainer.clients + " clientes - " + Number(trainer.rating || 0).toFixed(1) + "</p>" +
                    "</div>" +
                "</div>"
            );
        }).join("");
    }

    function renderCharts(users) {
        if (typeof window.Chart !== "function") {
            return;
        }

        var membersCanvas = document.getElementById("membrosChart");
        var plansCanvas = document.getElementById("planosChart");

        if (membersCanvas) {
            new window.Chart(membersCanvas, {
                type: "line",
                data: {
                    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
                    datasets: [{
                        label: "Novos membros",
                        data: [8, 12, 15, 11, 18, Math.max(6, users.length)],
                        borderColor: "#FF6B35",
                        backgroundColor: "rgba(255, 107, 53, 0.15)",
                        tension: 0.35,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        }

        if (plansCanvas) {
            new window.Chart(plansCanvas, {
                type: "doughnut",
                data: {
                    labels: ["Basico", "Extra", "Premium"],
                    datasets: [{
                        data: [
                            users.filter(function (user) { return user.plan === "basico"; }).length,
                            users.filter(function (user) { return user.plan === "extra"; }).length,
                            users.filter(function (user) { return user.plan === "premium"; }).length
                        ],
                        backgroundColor: ["#94A3B8", "#FF6B35", "#7C3AED"]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        }
    }

    function renderWithData(users, trainers, classes) {
        setStatValues(users, trainers, classes);
        renderRecentActivity(users, trainers, classes);
        renderPlanLegend(users);
        renderTopTrainers(trainers);
        renderCharts(users);
    }

    function init() {
        var trainers = getTrainers();
        var classes = getClasses();
        renderWithData(getUsers(), trainers, classes);

        if (window.BeastCenterApi) {
            Promise.all([
                window.BeastCenterApi.getUsers(),
                window.BeastCenterApi.getTrainers(),
                window.BeastCenterApi.getClasses()
            ])
                .then(function (results) {
                    var users = results[0].map(function (user) {
                        return {
                            role: user.role,
                            plan: user.plan,
                            status: user.status,
                            name: user.name,
                            createdAt: user.createdAt,
                            lastActivity: user.lastActivity ? new Date(user.lastActivity).toLocaleString("pt-PT") : "Recente"
                        };
                    });
                    localStorage.setItem("beastcenter_admin_trainers", JSON.stringify(results[1]));
                    localStorage.setItem("beastcenter_admin_classes", JSON.stringify(results[2]));
                    renderWithData(users, results[1], results[2]);
                })
                .catch(function () {
                });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
