(function () {
    "use strict";

    var STORAGE_KEY = "beastcenter_pt_sessions_v1";
    var PRICING = {
        basico: 29.99,
        extra: 19.99,
        premium: 17.99
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

    function readCurrentUser() {
        return readJson("currentUser", null);
    }

    function getUserKey(user) {
        if (!user) {
            return "";
        }

        return String(user.id || user._id || user.email || "").trim().toLowerCase();
    }

    function hasActivePaidPlan(user) {
        return !!(user && user.role === "cliente" && user.planStatus === "active" && user.paymentStatus === "paid" && user.plan && user.plan !== "none");
    }

    function getSessions() {
        return readJson(STORAGE_KEY, []);
    }

    function saveSessions(sessions) {
        writeJson(STORAGE_KEY, sessions);
    }

    function getUserSessions(user) {
        var userKey = getUserKey(user);
        if (!userKey) {
            return [];
        }

        return getSessions().filter(function (item) {
            return item.userKey === userKey;
        }).sort(function (left, right) {
            return new Date(left.sessionDate).getTime() - new Date(right.sessionDate).getTime();
        });
    }

    function getMonthToken(dateValue) {
        var date = dateValue ? new Date(dateValue) : new Date();
        return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
    }

    function getPremiumFreeUsage(user, dateValue) {
        return getUserSessions(user).filter(function (session) {
            return session.paymentType === "premium_free" && session.monthToken === getMonthToken(dateValue);
        }).length;
    }

    function getSessionOffer(user, dateValue) {
        if (!user) {
            return {
                allowed: false,
                reason: "auth_required",
                title: "Precisas de iniciar sessao",
                description: "Inicia sessao para poderes pedir uma sessao com personal trainer."
            };
        }

        if (!hasActivePaidPlan(user)) {
            return {
                allowed: false,
                reason: "plan_required",
                title: "Precisas de um plano ativo",
                description: "Ativa primeiro um plano BeastCenter para marcares sessoes de personal trainer."
            };
        }

        if (user.plan === "premium") {
            var freeUsed = getPremiumFreeUsage(user, dateValue);
            if (freeUsed < 2) {
                return {
                    allowed: true,
                    requiresPayment: false,
                    paymentType: "premium_free",
                    title: "Sessao incluida no Premium",
                    description: "Ainda tens " + (2 - freeUsed) + " sessao(oes) gratuita(s) este mes.",
                    price: 0
                };
            }

            return {
                allowed: true,
                requiresPayment: true,
                paymentType: "premium_paid",
                title: "Limite mensal gratuito atingido",
                description: "Ja usaste as 2 sessoes gratuitas deste mes. As proximas ficam a " + PRICING.premium.toFixed(2).replace(".", ",") + " EUR.",
                price: PRICING.premium
            };
        }

        if (user.plan === "basico") {
            return {
                allowed: true,
                requiresPayment: true,
                paymentType: "basico_paid",
                title: "Sessao paga no Plano Basico",
                description: "No Plano Basico as sessoes de PT sao pagas a " + PRICING.basico.toFixed(2).replace(".", ",") + " EUR.",
                price: PRICING.basico
            };
        }

        return {
            allowed: true,
            requiresPayment: true,
            paymentType: "extra_paid",
            title: "Sessao paga no Plano Extra",
            description: "No Plano Extra as sessoes de PT sao pagas a " + PRICING.extra.toFixed(2).replace(".", ",") + " EUR.",
            price: PRICING.extra
        };
    }

    function bookSession(payload) {
        var user = readCurrentUser();
        var userKey = getUserKey(user);
        var offer = getSessionOffer(user, payload.sessionDate);

        if (!offer.allowed) {
            return {
                ok: false,
                reason: offer.reason,
                message: offer.description
            };
        }

        var sessions = getSessions();
        var record = {
            id: "pt-" + Date.now(),
            userKey: userKey,
            trainerSlug: payload.trainerSlug,
            trainerName: payload.trainerName,
            goal: payload.goal,
            sessionDate: payload.sessionDate,
            sessionTime: payload.sessionTime,
            notes: payload.notes || "",
            createdAt: new Date().toISOString(),
            monthToken: getMonthToken(payload.sessionDate),
            paymentType: offer.paymentType,
            paymentMethod: payload.paymentMethod || "",
            amountPaid: offer.price,
            status: "confirmado"
        };

        sessions.push(record);
        saveSessions(sessions);

        return {
            ok: true,
            session: record,
            offer: offer
        };
    }

    function cancelSession(id, user) {
        var currentUser = user || readCurrentUser();
        var userKey = getUserKey(currentUser);
        var sessions = getSessions();
        var initial = sessions.length;

        sessions = sessions.filter(function (item) {
            return !(item.id === id && item.userKey === userKey);
        });

        saveSessions(sessions);

        return {
            ok: sessions.length !== initial
        };
    }

    function formatPrice(value) {
        return Number(value || 0).toFixed(2).replace(".", ",") + " EUR";
    }

    window.BeastCenterPtSessions = {
        readCurrentUser: readCurrentUser,
        hasActivePaidPlan: hasActivePaidPlan,
        getUserSessions: getUserSessions,
        getPremiumFreeUsage: getPremiumFreeUsage,
        getSessionOffer: getSessionOffer,
        bookSession: bookSession,
        cancelSession: cancelSession,
        formatPrice: formatPrice
    };
})();
