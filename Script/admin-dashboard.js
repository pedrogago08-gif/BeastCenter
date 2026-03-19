(function () {
    "use strict";

    var PLAN_PRICES = {
        basico: 19.99,
        extra: 31.99,
        premium: 49.99
    };

    var CHARTS = {
        growth: null,
        plans: null
    };
    var dashboardState = {
        data: null
    };

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

    function setText(id, value) {
        var node = document.getElementById(id);
        if (node) {
            node.textContent = value;
        }
    }

    function formatCurrency(value) {
        return "EUR " + Number(value || 0).toFixed(2).replace(".", ",");
    }

    function formatDateTime(value) {
        if (!value) {
            return "Sem registo";
        }

        try {
            return new Intl.DateTimeFormat("pt-PT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }).format(new Date(value));
        } catch (error) {
            return String(value);
        }
    }

    function formatShortDate(value) {
        if (!value) {
            return "Sem data";
        }

        try {
            return new Intl.DateTimeFormat("pt-PT", {
                day: "2-digit",
                month: "2-digit"
            }).format(new Date(value));
        } catch (error) {
            return String(value);
        }
    }

    function monthKey(dateValue) {
        var date = new Date(dateValue);
        return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
    }

    function monthLabel(dateValue) {
        try {
            return new Intl.DateTimeFormat("pt-PT", {
                month: "short",
                year: "2-digit"
            }).format(new Date(dateValue));
        } catch (error) {
            return String(dateValue);
        }
    }

    function getInitials(name) {
        var parts = String(name || "").split(" ").filter(Boolean);
        if (!parts.length) {
            return "BC";
        }
        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    function normalizeApiUser(user, index) {
        return {
            id: String(user.id || user._id || 4000 + index),
            name: user.name || "Utilizador",
            email: user.email || "",
            role: user.role || "cliente",
            plan: user.plan || "none",
            status: user.status || "ativo",
            phone: user.phone || "",
            planStatus: user.planStatus || "",
            paymentStatus: user.paymentStatus || "",
            createdAt: user.createdAt || "",
            lastActivity: user.lastActivity || ""
        };
    }

    function normalizeLocalUser(user, index) {
        return {
            id: String(user.id || user._id || 2000 + index),
            name: user.name || "Utilizador",
            email: user.email || "",
            role: user.role || "cliente",
            plan: user.plan || "none",
            status: user.status || "ativo",
            phone: user.phone || "",
            planStatus: user.planStatus || "",
            paymentStatus: user.paymentStatus || "",
            createdAt: user.createdAt || "",
            lastActivity: user.lastActivity || ""
        };
    }

    function normalizeTrainer(trainer, index) {
        return {
            id: String(trainer._id || trainer.id || 5000 + index),
            name: trainer.name || "Trainer",
            specialization: trainer.specialization || trainer.specialty || "Performance",
            rating: Number(trainer.rating || 0),
            clients: Number(trainer.clients || 0),
            status: trainer.status || "ativo"
        };
    }

    function weekdayLabelFromDate(dateValue) {
        try {
            return new Intl.DateTimeFormat("pt-PT", { weekday: "long" }).format(new Date(dateValue));
        } catch (error) {
            return "sem data";
        }
    }

    function normalizePublicClass(item, index) {
        var booked = Array.isArray(item.bookedUserKeys) ? item.bookedUserKeys.length : Number(item.enrolledCount || 0);
        return {
            id: String(item.id || item._id || 7000 + index),
            title: item.title || "Aula",
            category: item.type || item.category || "geral",
            trainerName: item.trainerName || "Trainer BeastCenter",
            date: item.date || "",
            dayOfWeek: item.dayOfWeek || weekdayLabelFromDate(item.date),
            time: item.time || "",
            status: item.status || "ativa",
            capacity: Number(item.capacity || 0),
            enrolledCount: booked,
            availableSlots: typeof item.availableSlots === "number" ? item.availableSlots : Math.max(Number(item.capacity || 0) - booked, 0),
            location: item.location || ""
        };
    }

    function normalizeApiClass(item, index) {
        return {
            id: String(item._id || item.id || 8000 + index),
            title: item.title || "Aula",
            category: item.category || "geral",
            trainerName: item.trainerName || "Trainer BeastCenter",
            date: item.date || "",
            dayOfWeek: item.dayOfWeek || weekdayLabelFromDate(item.date),
            time: item.time || "",
            status: item.status || "ativa",
            capacity: Number(item.capacity || 0),
            enrolledCount: Number(item.enrolledCount || 0),
            availableSlots: Math.max(Number(item.capacity || 0) - Number(item.enrolledCount || 0), 0),
            location: item.location || ""
        };
    }

    function normalizeOrder(order, index) {
        var totals = order && order.totals ? order.totals : {};
        var user = order && order.user ? order.user : {};
        var payment = order && order.payment ? order.payment : {};

        return {
            id: order.id || "ORDER-" + (index + 1),
            createdAt: order.createdAt || "",
            customerName: user.name || (order.delivery ? order.delivery.name : "") || "Cliente BeastCenter",
            customerEmail: user.email || (order.delivery ? order.delivery.email : "") || "",
            total: Number(totals.total || 0),
            subtotal: Number(totals.subtotal || 0),
            paymentMethod: payment.method || "card",
            itemsCount: Array.isArray(order.items) ? order.items.reduce(function (sum, item) {
                return sum + Number(item.quantity || 0);
            }, 0) : 0
        };
    }

    function normalizePtSession(session, index) {
        return {
            id: session.id || "pt-" + (index + 1),
            trainerName: session.trainerName || "Trainer BeastCenter",
            userKey: session.userKey || "",
            createdAt: session.createdAt || "",
            sessionDate: session.sessionDate || "",
            sessionTime: session.sessionTime || "",
            amountPaid: Number(session.amountPaid || 0),
            paymentType: session.paymentType || "",
            status: session.status || "confirmado"
        };
    }

    function isClient(user) {
        return user && user.role !== "admin";
    }

    function hasActivePaidPlan(user) {
        if (!isClient(user)) {
            return false;
        }

        if (!user.plan || user.plan === "none") {
            return false;
        }

        if (user.planStatus || user.paymentStatus) {
            return user.planStatus === "active" && user.paymentStatus === "paid" && user.status !== "inativo";
        }

        return user.status !== "inativo";
    }

    function getPlanRevenue(users) {
        return users.filter(hasActivePaidPlan).reduce(function (sum, user) {
            return sum + Number(PLAN_PRICES[user.plan] || 0);
        }, 0);
    }

    function readLocalUsers() {
        var adminUsers = readJson("beastcenter_admin_users", []);
        var users = readJson("users", []);
        var merged = [].concat(Array.isArray(adminUsers) ? adminUsers : [], Array.isArray(users) ? users : []);
        var seen = {};

        return merged.map(normalizeLocalUser).filter(function (user) {
            var key = String(user.email || user.id || "").toLowerCase();
            if (!key || seen[key]) {
                return false;
            }
            seen[key] = true;
            return true;
        });
    }

    function readLocalTrainers() {
        return readJson("beastcenter_admin_trainers", []).map(normalizeTrainer);
    }

    function readLocalClassesWithSource() {
        var publicClasses = readJson("beastcenter_mock_classes_v3", []);
        var adminClasses = readJson("beastcenter_admin_classes", []);

        if (Array.isArray(publicClasses) && publicClasses.length) {
            return {
                source: "local-public",
                classes: publicClasses.map(normalizePublicClass)
            };
        }

        if (Array.isArray(adminClasses) && adminClasses.length) {
            return {
                source: "local-admin",
                classes: adminClasses.map(normalizeApiClass)
            };
        }

        return {
            source: "",
            classes: []
        };
    }

    function readShopOrders() {
        return readJson("shopOrders", []).map(normalizeOrder);
    }

    function readPtSessions() {
        return readJson("beastcenter_pt_sessions_v1", []).map(normalizePtSession);
    }

    function deriveTrainerList(trainers, classes, ptSessions) {
        var seen = {};
        var output = [];

        trainers.forEach(function (trainer) {
            if (!trainer.name || seen[trainer.name]) {
                return;
            }
            seen[trainer.name] = true;
            output.push(trainer);
        });

        classes.forEach(function (item) {
            if (!item.trainerName || seen[item.trainerName]) {
                return;
            }
            seen[item.trainerName] = true;
            output.push(normalizeTrainer({ name: item.trainerName }, output.length + 1));
        });

        ptSessions.forEach(function (item) {
            if (!item.trainerName || seen[item.trainerName]) {
                return;
            }
            seen[item.trainerName] = true;
            output.push(normalizeTrainer({ name: item.trainerName }, output.length + 1));
        });

        return output;
    }

    function getMonthlySeries(users, rangeValue) {
        var counts = {};
        var keys = [];
        var monthsBack = rangeValue === "all" ? 12 : Number(rangeValue || 6);
        var now = new Date();
        var cursor;

        for (var i = monthsBack - 1; i >= 0; i -= 1) {
            cursor = new Date(now.getFullYear(), now.getMonth() - i, 1);
            counts[monthKey(cursor)] = 0;
            keys.push(monthKey(cursor));
        }

        users.forEach(function (user) {
            if (!user.createdAt) {
                return;
            }
            var key = monthKey(user.createdAt);
            if (typeof counts[key] === "number") {
                counts[key] += 1;
            }
        });

        return {
            labels: keys.map(function (key) { return monthLabel(key + "-01"); }),
            values: keys.map(function (key) { return counts[key]; })
        };
    }

    function getClassOccupancy(item) {
        if (!item.capacity) {
            return 0;
        }
        return Math.round((Number(item.enrolledCount || 0) / Number(item.capacity || 1)) * 100);
    }

    function getPeakHourBuckets(classes) {
        var buckets = [
            { label: "06h-09h", from: 6, to: 9, value: 0 },
            { label: "09h-12h", from: 9, to: 12, value: 0 },
            { label: "12h-15h", from: 12, to: 15, value: 0 },
            { label: "15h-18h", from: 15, to: 18, value: 0 },
            { label: "18h-21h", from: 18, to: 21, value: 0 }
        ];

        classes.forEach(function (item) {
            var hour = Number(String(item.time || "0").split(":")[0] || 0);
            var booked = Number(item.enrolledCount || 0);

            buckets.forEach(function (bucket) {
                if (hour >= bucket.from && hour < bucket.to) {
                    bucket.value += booked;
                }
            });
        });

        var max = buckets.reduce(function (highest, bucket) {
            return Math.max(highest, bucket.value);
        }, 0);

        return buckets.map(function (bucket) {
            return {
                label: bucket.label,
                value: bucket.value,
                width: max ? Math.round((bucket.value / max) * 100) : 0,
                isPeak: max > 0 && bucket.value === max
            };
        });
    }

    function buildTrainerPerformance(trainers, classes, ptSessions) {
        var map = {};

        trainers.forEach(function (trainer) {
            map[trainer.name] = {
                name: trainer.name,
                specialization: trainer.specialization || "Performance",
                rating: Number(trainer.rating || 0),
                clients: Number(trainer.clients || 0),
                classesLed: 0,
                classBookings: 0,
                ptSessions: 0
            };
        });

        classes.forEach(function (item) {
            var current = map[item.trainerName] || {
                name: item.trainerName,
                specialization: "Aulas",
                rating: 0,
                clients: 0,
                classesLed: 0,
                classBookings: 0,
                ptSessions: 0
            };

            current.classesLed += 1;
            current.classBookings += Number(item.enrolledCount || 0);
            map[item.trainerName] = current;
        });

        ptSessions.forEach(function (item) {
            var current = map[item.trainerName] || {
                name: item.trainerName,
                specialization: "PT",
                rating: 0,
                clients: 0,
                classesLed: 0,
                classBookings: 0,
                ptSessions: 0
            };

            current.ptSessions += 1;
            map[item.trainerName] = current;
        });

        return Object.keys(map).map(function (name) {
            var current = map[name];
            current.score = current.classBookings + (current.ptSessions * 3) + current.classesLed;
            return current;
        }).sort(function (left, right) {
            return right.score - left.score;
        });
    }

    function renderStats(data) {
        var users = data.users.filter(isClient);
        var activePlanUsers = users.filter(hasActivePaidPlan);
        var noPlanUsers = users.filter(function (user) { return !hasActivePaidPlan(user); });
        var classes = data.classes;
        var classBookings = classes.reduce(function (sum, item) {
            return sum + Number(item.enrolledCount || 0);
        }, 0);
        var avgOccupancy = classes.length ? Math.round(classes.reduce(function (sum, item) {
            return sum + getClassOccupancy(item);
        }, 0) / classes.length) : 0;
        var ptSessions = data.ptSessions;
        var paidPtSessions = ptSessions.filter(function (item) {
            return Number(item.amountPaid || 0) > 0;
        });
        var orders = data.orders;
        var shopRevenue = orders.reduce(function (sum, order) {
            return sum + Number(order.total || 0);
        }, 0);
        var ptRevenue = ptSessions.reduce(function (sum, session) {
            return sum + Number(session.amountPaid || 0);
        }, 0);
        var planRevenue = getPlanRevenue(users);
        var totalRevenue = planRevenue + ptRevenue + shopRevenue;

        setText("stat-users-total", String(users.length));
        setText("stat-users-meta", activePlanUsers.length + " com plano ativo");
        setText("stat-active-plans", String(activePlanUsers.length));
        setText("stat-plans-meta", noPlanUsers.length + " sem plano ativo");
        setText("stat-class-bookings", String(classBookings));
        setText("stat-classes-meta", classes.length + " aulas / " + avgOccupancy + "% ocupacao media");
        setText("stat-pt-sessions", String(ptSessions.length));
        setText("stat-pt-meta", paidPtSessions.length + " pagas / " + (ptSessions.length - paidPtSessions.length) + " incluidas");
        setText("stat-shop-orders", String(orders.length));
        setText("stat-shop-meta", formatCurrency(shopRevenue) + " em vendas");
        setText("stat-total-revenue", formatCurrency(totalRevenue));
        setText("stat-revenue-meta", formatCurrency(planRevenue) + " planos | " + formatCurrency(ptRevenue) + " PT | " + formatCurrency(shopRevenue) + " loja");
    }

    function renderGrowthChart(users) {
        if (typeof window.Chart !== "function") {
            return;
        }

        var canvas = document.getElementById("membrosChart");
        var range = document.getElementById("dashboard-growth-range");
        var series;

        if (!canvas) {
            return;
        }

        series = getMonthlySeries(users.filter(isClient), range ? range.value : "6");

        if (CHARTS.growth) {
            CHARTS.growth.destroy();
        }

        CHARTS.growth = new window.Chart(canvas, {
            type: "line",
            data: {
                labels: series.labels,
                datasets: [{
                    label: "Novos registos",
                    data: series.values,
                    borderColor: "#E41E2B",
                    backgroundColor: "rgba(228, 30, 43, 0.10)",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
    }

    function renderRecentActivity(data) {
        var container = document.getElementById("admin-recent-activity");
        var items = [];

        if (!container) {
            return;
        }

        items = items.concat(data.users.filter(isClient).map(function (user) {
            return {
                date: user.createdAt || user.lastActivity || "",
                title: "Novo registo",
                description: user.name + " criou conta" + (user.plan && user.plan !== "none" ? " com plano " + user.plan : " sem plano ativo"),
                icon: "+"
            };
        }));

        items = items.concat(data.ptSessions.map(function (session) {
            return {
                date: session.createdAt || session.sessionDate || "",
                title: "Sessao PT marcada",
                description: session.trainerName + " recebeu uma nova sessao para " + formatShortDate(session.sessionDate) + " as " + (session.sessionTime || "--:--"),
                icon: "PT"
            };
        }));

        items = items.concat(data.orders.map(function (order) {
            return {
                date: order.createdAt || "",
                title: "Nova encomenda",
                description: order.customerName + " finalizou " + order.id + " no valor de " + formatCurrency(order.total),
                icon: "EUR"
            };
        }));

        items.sort(function (left, right) {
            return new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime();
        });

        if (!items.length) {
            container.innerHTML = "<div class='atividade-item'><div class='atividade-info'><p>Ainda nao ha atividade relevante para mostrar.</p><span class='time'>O historico vai surgir conforme existirem operacoes no site.</span></div></div>";
            return;
        }

        container.innerHTML = items.slice(0, 6).map(function (item) {
            return (
                "<div class='atividade-item'>" +
                    "<div class='atividade-icon'>" + item.icon + "</div>" +
                    "<div class='atividade-info'>" +
                        "<p><strong>" + item.title + ":</strong> " + item.description + "</p>" +
                        "<span class='time'>" + formatDateTime(item.date) + "</span>" +
                    "</div>" +
                "</div>"
            );
        }).join("");
    }

    function renderPopularClasses(classes) {
        var container = document.getElementById("admin-popular-classes");

        if (!container) {
            return;
        }

        if (!classes.length) {
            container.innerHTML = "<div class='aula-rank-item'><span class='rank'>-</span><div class='aula-info'><h4>Sem aulas ativas</h4><p>Assim que houver horario e reservas, o ranking aparece aqui.</p></div><div class='aula-stats'><span class='attendance'>0%</span></div></div>";
            return;
        }

        container.innerHTML = classes.slice().sort(function (left, right) {
            return getClassOccupancy(right) - getClassOccupancy(left);
        }).slice(0, 4).map(function (item, index) {
            return (
                "<div class='aula-rank-item'>" +
                    "<span class='rank'>" + (index + 1) + "</span>" +
                    "<div class='aula-info'>" +
                        "<h4>" + item.title + "</h4>" +
                        "<p>" + item.trainerName + " | " + (item.dayOfWeek || formatShortDate(item.date)) + " | " + item.time + "</p>" +
                    "</div>" +
                    "<div class='aula-stats'>" +
                        "<span class='attendance'>" + getClassOccupancy(item) + "% ocupacao</span>" +
                    "</div>" +
                "</div>"
            );
        }).join("");
    }

    function renderScheduleList(classes) {
        var container = document.getElementById("admin-schedule-list");

        if (!container) {
            return;
        }

        if (!classes.length) {
            container.innerHTML = "<div class='dashboard-schedule-item is-empty'><div><strong>Sem horario publicado</strong><span>As aulas do site vao aparecer aqui quando existirem no horario atual.</span></div></div>";
            return;
        }

        container.innerHTML = classes.slice().sort(function (left, right) {
            if ((left.dayOfWeek || "") === (right.dayOfWeek || "")) {
                return String(left.time || "").localeCompare(String(right.time || ""));
            }
            return String(left.dayOfWeek || "").localeCompare(String(right.dayOfWeek || ""));
        }).map(function (item) {
            return (
                "<div class='dashboard-schedule-item'>" +
                    "<div class='dashboard-schedule-main'>" +
                        "<strong>" + item.title + "</strong>" +
                        "<span>" + item.dayOfWeek + " | " + item.time + " | " + item.trainerName + "</span>" +
                        "<small>" + item.enrolledCount + "/" + item.capacity + " inscritos | " + (item.location || "Sem local definido") + "</small>" +
                    "</div>" +
                    "<div class='dashboard-schedule-actions'>" +
                        "<span class='status-badge " + (item.status === "ativa" ? "active" : "inactive") + "'>" + (item.status === "ativa" ? "Ativa" : "Inativa") + "</span>" +
                        "<button class='btn-small danger-outline' type='button' data-schedule-remove='" + item.id + "'>Retirar</button>" +
                    "</div>" +
                "</div>"
            );
        }).join("");
    }

    function removeLocalClass(storageKey, classId) {
        var current = readJson(storageKey, []);
        var next = Array.isArray(current) ? current.filter(function (item) {
            return String(item.id || item._id || "") !== String(classId);
        }) : [];

        writeJson(storageKey, next);
    }

    async function removeDashboardClass(classId) {
        if (!dashboardState.data) {
            return;
        }

        if (dashboardState.data.classSource === "local-public") {
            removeLocalClass("beastcenter_mock_classes_v3", classId);
        } else if (dashboardState.data.classSource === "local-admin") {
            removeLocalClass("beastcenter_admin_classes", classId);
        } else if (window.BeastCenterApi) {
            await window.BeastCenterApi.deleteClass(classId);
        }

        dashboardState.data = await buildDashboardData();
        renderDashboard(dashboardState.data);
    }

    function renderLatestOrders(orders) {
        var container = document.getElementById("admin-latest-orders");

        if (!container) {
            return;
        }

        if (!orders.length) {
            container.innerHTML = "<div class='dashboard-order-item is-empty'><div><strong>Sem encomendas registadas</strong><span>As compras da loja vao aparecer aqui depois do checkout.</span></div></div>";
            return;
        }

        container.innerHTML = orders.slice().sort(function (left, right) {
            return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
        }).slice(0, 4).map(function (order) {
            return (
                "<div class='dashboard-order-item'>" +
                    "<div class='dashboard-order-main'>" +
                        "<strong>" + order.id + "</strong>" +
                        "<span>" + order.customerName + " | " + order.itemsCount + " item(ns) | " + formatDateTime(order.createdAt) + "</span>" +
                    "</div>" +
                    "<div class='dashboard-order-side'>" +
                        "<strong>" + formatCurrency(order.total) + "</strong>" +
                        "<span>" + order.paymentMethod + "</span>" +
                    "</div>" +
                "</div>"
            );
        }).join("");
    }

    function renderAlerts(data) {
        var container = document.getElementById("admin-alerts-list");
        var users = data.users.filter(isClient);
        var noPlanUsers = users.filter(function (user) { return !hasActivePaidPlan(user); }).length;
        var nearFullClasses = data.classes.filter(function (item) { return item.availableSlots <= 3; }).length;
        var paidPtSessions = data.ptSessions.filter(function (item) { return Number(item.amountPaid || 0) > 0; }).length;
        var alerts = [];

        if (!container) {
            return;
        }

        if (noPlanUsers > 0) {
            alerts.push({
                level: "warning",
                title: "Contas sem plano ativo",
                description: noPlanUsers + " utilizadores ainda nao ativaram um plano pago.",
                href: "usuarios.html"
            });
        }

        if (nearFullClasses > 0) {
            alerts.push({
                level: "critical",
                title: "Aulas perto de esgotar",
                description: nearFullClasses + " aulas estao com 3 ou menos vagas livres.",
                href: "aulas.html"
            });
        }

        if (data.orders.length > 0) {
            alerts.push({
                level: "info",
                title: "Encomendas por acompanhar",
                description: data.orders.length + " encomendas mock registadas no checkout da loja.",
                href: "loja.html"
            });
        }

        if (paidPtSessions > 0) {
            alerts.push({
                level: "warning",
                title: "Sessoes PT pagas",
                description: paidPtSessions + " sessoes PT foram cobradas alem dos beneficios incluidos.",
                href: "trainers.html"
            });
        }

        if (!alerts.length) {
            container.innerHTML = "<div class='alert-item info'><div class='alert-info'><h4>Sem alertas criticos</h4><p>O sistema esta estavel neste momento.</p></div></div>";
            return;
        }

        container.innerHTML = alerts.slice(0, 4).map(function (alert) {
            return (
                "<div class='alert-item " + alert.level + "'>" +
                    "<div class='alert-info'>" +
                        "<h4>" + alert.title + "</h4>" +
                        "<p>" + alert.description + "</p>" +
                    "</div>" +
                    "<a class='btn-small' href='" + alert.href + "'>Ver</a>" +
                "</div>"
            );
        }).join("");
    }

    function renderPlanDistribution(users) {
        var canvas = document.getElementById("planosChart");
        var legend = document.getElementById("admin-plan-legend");
        var activeUsers = users.filter(hasActivePaidPlan);
        var counts = {
            basico: activeUsers.filter(function (user) { return user.plan === "basico"; }).length,
            extra: activeUsers.filter(function (user) { return user.plan === "extra"; }).length,
            premium: activeUsers.filter(function (user) { return user.plan === "premium"; }).length
        };
        var total = counts.basico + counts.extra + counts.premium;

        if (legend) {
            legend.innerHTML = [
                { key: "basico", label: "Basico" },
                { key: "extra", label: "Extra" },
                { key: "premium", label: "Premium" }
            ].map(function (item) {
                var count = counts[item.key];
                var percent = total ? Math.round((count / total) * 100) : 0;
                return "<div class='legend-item'><span class='color-box " + item.key + "'></span><span>" + item.label + ": " + count + " (" + percent + "%)</span></div>";
            }).join("");
        }

        if (typeof window.Chart !== "function" || !canvas) {
            return;
        }

        if (CHARTS.plans) {
            CHARTS.plans.destroy();
        }

        CHARTS.plans = new window.Chart(canvas, {
            type: "doughnut",
            data: {
                labels: ["Basico", "Extra", "Premium"],
                datasets: [{
                    data: [counts.basico, counts.extra, counts.premium],
                    backgroundColor: ["#111111", "#E41E2B", "#8B0000"],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    function renderTopTrainers(data) {
        var container = document.getElementById("admin-top-trainers");
        var ranking = buildTrainerPerformance(data.trainers, data.classes, data.ptSessions);

        if (!container) {
            return;
        }

        if (!ranking.length) {
            container.innerHTML = "<div class='trainer-rank-item'><span class='trainer-avatar-fallback'>--</span><div class='trainer-info'><h4>Sem trainers ativos</h4><p>Assim que houver atividade de PT ou aulas, aparece aqui.</p></div></div>";
            return;
        }

        container.innerHTML = ranking.slice(0, 4).map(function (trainer) {
            return (
                "<div class='trainer-rank-item'>" +
                    "<span class='trainer-avatar-fallback'>" + getInitials(trainer.name) + "</span>" +
                    "<div class='trainer-info'>" +
                        "<h4>" + trainer.name + "</h4>" +
                        "<p>" + trainer.specialization + "</p>" +
                    "</div>" +
                    "<div class='trainer-metrics'>" +
                        "<strong>" + trainer.ptSessions + " PT</strong>" +
                        "<span>" + trainer.classBookings + " reservas aula</span>" +
                    "</div>" +
                "</div>"
            );
        }).join("");
    }

    function renderMiniKpis(data) {
        var container = document.getElementById("admin-mini-kpis");
        var users = data.users.filter(isClient);
        var noPlanUsers = users.filter(function (user) { return !hasActivePaidPlan(user); }).length;
        var freePremiumSessions = data.ptSessions.filter(function (item) { return item.paymentType === "premium_free"; }).length;
        var avgOrder = data.orders.length ? data.orders.reduce(function (sum, order) {
            return sum + Number(order.total || 0);
        }, 0) / data.orders.length : 0;
        var avgOccupancy = data.classes.length ? Math.round(data.classes.reduce(function (sum, item) {
            return sum + getClassOccupancy(item);
        }, 0) / data.classes.length) : 0;

        if (!container) {
            return;
        }

        container.innerHTML = [
            { label: "Sem plano", value: noPlanUsers, note: "contas por ativar" },
            { label: "Premium gratis", value: freePremiumSessions, note: "sessoes PT incluidas" },
            { label: "Ticket medio", value: formatCurrency(avgOrder), note: "media loja" },
            { label: "Ocupacao media", value: avgOccupancy + "%", note: "nas aulas" }
        ].map(function (item) {
            return (
                "<div class='mini-kpi-card'>" +
                    "<strong>" + item.value + "</strong>" +
                    "<span>" + item.label + "</span>" +
                    "<small>" + item.note + "</small>" +
                "</div>"
            );
        }).join("");
    }

    function renderRevenueBreakdown(data) {
        var container = document.getElementById("admin-revenue-breakdown");
        var planRevenue = getPlanRevenue(data.users.filter(isClient));
        var ptRevenue = data.ptSessions.reduce(function (sum, session) {
            return sum + Number(session.amountPaid || 0);
        }, 0);
        var shopRevenue = data.orders.reduce(function (sum, order) {
            return sum + Number(order.total || 0);
        }, 0);

        if (!container) {
            return;
        }

        container.innerHTML = [
            { label: "Planos ativos", value: formatCurrency(planRevenue), hint: "estimativa mensal" },
            { label: "Sessoes PT", value: formatCurrency(ptRevenue), hint: "cobrancas locais" },
            { label: "Loja online", value: formatCurrency(shopRevenue), hint: "checkout registado" }
        ].map(function (item) {
            return (
                "<div class='dashboard-breakdown-item'>" +
                    "<div>" +
                        "<strong>" + item.label + "</strong>" +
                        "<span>" + item.hint + "</span>" +
                    "</div>" +
                    "<b>" + item.value + "</b>" +
                "</div>"
            );
        }).join("");
    }

    function renderPeakHours(classes) {
        var container = document.getElementById("admin-peak-hours");
        var buckets = getPeakHourBuckets(classes);

        if (!container) {
            return;
        }

        container.innerHTML = buckets.map(function (bucket) {
            return (
                "<div class='hour-bar" + (bucket.isPeak ? " peak" : "") + "'>" +
                    "<span class='hour'>" + bucket.label + "</span>" +
                    "<div class='bar-container'><div class='bar' style='width: " + bucket.width + "%'></div></div>" +
                    "<span class='percentage'>" + bucket.value + "</span>" +
                "</div>"
            );
        }).join("");
    }

    function bindGrowthFilter(users) {
        var select = document.getElementById("dashboard-growth-range");
        if (!select) {
            return;
        }

        select.addEventListener("change", function () {
            renderGrowthChart(users);
        });
    }

    async function loadApiData() {
        if (!window.BeastCenterApi) {
            return {
                users: [],
                trainers: [],
                classes: []
            };
        }

        var results = await Promise.allSettled([
            window.BeastCenterApi.getUsers(),
            window.BeastCenterApi.getTrainers(),
            window.BeastCenterApi.getClasses()
        ]);

        return {
            users: results[0].status === "fulfilled" ? results[0].value.map(normalizeApiUser) : [],
            trainers: results[1].status === "fulfilled" ? results[1].value.map(normalizeTrainer) : [],
            classes: results[2].status === "fulfilled" ? results[2].value.map(normalizeApiClass) : []
        };
    }

    async function buildDashboardData() {
        var apiData = await loadApiData();
        var ptSessions = readPtSessions();
        var users = apiData.users.length ? apiData.users : readLocalUsers();
        var localClassesResult = readLocalClassesWithSource();
        var classes = localClassesResult.classes.length ? localClassesResult.classes : apiData.classes;
        var trainers = deriveTrainerList(
            apiData.trainers.length ? apiData.trainers : readLocalTrainers(),
            classes,
            ptSessions
        );

        return {
            users: users,
            classes: classes,
            classSource: localClassesResult.classes.length ? localClassesResult.source : "api",
            trainers: trainers,
            orders: readShopOrders(),
            ptSessions: ptSessions
        };
    }

    function renderDashboard(data) {
        dashboardState.data = data;
        renderStats(data);
        renderGrowthChart(data.users);
        renderRecentActivity(data);
        renderPopularClasses(data.classes);
        renderScheduleList(data.classes);
        renderLatestOrders(data.orders);
        renderAlerts(data);
        renderPlanDistribution(data.users.filter(isClient));
        renderTopTrainers(data);
        renderMiniKpis(data);
        renderRevenueBreakdown(data);
        renderPeakHours(data.classes);
        bindGrowthFilter(data.users);
    }

    function bindScheduleActions() {
        var container = document.getElementById("admin-schedule-list");

        if (!container) {
            return;
        }

        container.addEventListener("click", function (event) {
            var button = event.target.closest("button[data-schedule-remove]");
            var classId;

            if (!button) {
                return;
            }

            classId = button.getAttribute("data-schedule-remove");
            if (!classId) {
                return;
            }

            if (!window.confirm("Retirar esta aula do horario atual?")) {
                return;
            }

            removeDashboardClass(classId).catch(function () {
                alert("Nao foi possivel retirar a aula do horario.");
            });
        });
    }

    async function init() {
        var data = await buildDashboardData();
        bindScheduleActions();
        renderDashboard(data);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            init().catch(function () {
            });
        });
    } else {
        init().catch(function () {
        });
    }
})();
