(function () {
    "use strict";

    var STORAGE_KEY = "beastcenter_admin_users";
    var PAGE_SIZE = 6;

    var defaultUsers = [];
    var demoEmails = {
        "joao.silva@email.com": true,
        "maria.santos@email.com": true,
        "pedro.costa@email.com": true,
        "ana.rodrigues@email.com": true,
        "carlos.mendes@email.com": true,
        "ines.ferreira@email.com": true,
        "rui.oliveira@email.com": true
    };

    var state = {
        users: [],
        search: "",
        plan: "all",
        status: "all",
        editingId: null,
        selectedIds: [],
        currentPage: 1,
        apiEnabled: !!window.BeastCenterApi
    };

    var refs = {
        tbody: document.getElementById("users-tbody"),
        searchInput: document.getElementById("search-users"),
        planFilter: document.getElementById("filter-plan"),
        statusFilter: document.getElementById("filter-status"),
        addBtn: document.getElementById("add-user-btn"),
        exportBtn: document.getElementById("export-users-btn"),
        selectAll: document.getElementById("select-all"),
        bulkActions: document.getElementById("bulk-actions"),
        selectedCount: document.getElementById("selected-count"),
        paginationNumbers: document.getElementById("pagination-numbers"),
        prevPageBtn: document.getElementById("previous-page-btn"),
        nextPageBtn: document.getElementById("next-page-btn"),
        modal: document.getElementById("user-modal"),
        detailsModal: document.getElementById("user-details-modal"),
        detailsContent: document.getElementById("user-details-content"),
        modalTitle: document.getElementById("user-modal-title"),
        closeModalBtn: document.getElementById("close-user-modal"),
        closeDetailsModalBtn: document.getElementById("close-user-details-modal"),
        cancelModalBtn: document.getElementById("cancel-user-modal"),
        form: document.getElementById("user-form"),
        inputId: document.getElementById("user-id"),
        inputName: document.getElementById("user-name"),
        inputEmail: document.getElementById("user-email"),
        inputPhone: document.getElementById("user-phone"),
        inputCreatedAt: document.getElementById("user-created-at"),
        inputPlan: document.getElementById("user-plan"),
        inputStatus: document.getElementById("user-status"),
        inputPassword: document.getElementById("user-password"),
        inputLastActivity: document.getElementById("user-last-activity"),
        summaryTotal: document.getElementById("summary-total-users"),
        summaryActive: document.getElementById("summary-active-users"),
        summaryInactive: document.getElementById("summary-inactive-users"),
        summaryNew: document.getElementById("summary-new-users"),
        alertCount: document.getElementById("users-alert-count")
    };

    function getLocalUsers() {
        try {
            var raw = localStorage.getItem("users");
            var parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function getAdminUsers() {
        try {
            var raw = localStorage.getItem("adminUsers");
            var parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function normalizeSeedUser(user) {
        return {
            id: Number(user.id),
            name: user.name,
            email: user.email,
            plan: user.plan || "none",
            status: user.status || "ativo",
            createdAt: user.createdAt || new Date().toISOString().slice(0, 10),
            lastActivity: user.lastActivity || "Sem atividade",
            phone: user.phone || "",
            password: user.password || "",
            role: user.role || "cliente"
        };
    }

    function normalizeRegisteredUser(user, index) {
        return {
            id: Number(user.id) || 2000 + index,
            name: user.name || "Utilizador",
            email: user.email || "sem-email@email.com",
            plan: user.plan || "none",
            status: user.status || "ativo",
            createdAt: (user.createdAt || new Date().toISOString()).slice(0, 10),
            lastActivity: user.lastActivity || "Recente",
            phone: user.phone || "",
            password: user.password || "",
            role: user.role || "cliente"
        };
    }

    function normalizeAdminUser(user, index) {
        return {
            id: 9000 + index,
            name: user.name || "Administrador",
            email: user.email || "admin@beastcenter.com",
            plan: "admin",
            status: "ativo",
            createdAt: new Date().toISOString().slice(0, 10),
            lastActivity: "Painel administrativo",
            phone: "",
            password: user.password || "",
            role: "admin",
            username: user.username || "admin"
        };
    }

    function isDemoUser(user) {
        var email = normalizeText(user && user.email);
        return !!demoEmails[email];
    }

    function loadUsers() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.filter(function (user) {
                        return !isDemoUser(user);
                    });
                }
            }
        } catch (error) {
        }

        var seeded = defaultUsers.map(normalizeSeedUser)
            .concat(getLocalUsers().map(normalizeRegisteredUser))
            .concat(getAdminUsers().map(normalizeAdminUser));

        return dedupeUsers(seeded).filter(function (user) {
            return !isDemoUser(user);
        });
    }

    function dedupeUsers(users) {
        var seen = {};
        return users.filter(function (user) {
            var key = String(user.email || user.id);
            if (seen[key]) {
                return false;
            }
            seen[key] = true;
            return true;
        });
    }

    function saveUsers() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.users));

        var regularUsers = state.users
            .filter(function (user) { return user.role !== "admin"; })
            .filter(function (user) { return !isDemoUser(user); })
            .map(function (user) {
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    password: user.password || "",
                    plan: user.plan,
                    status: user.status,
                    phone: user.phone || "",
                    lastActivity: user.lastActivity || "",
                    role: user.role || "cliente",
                    createdAt: user.createdAt
                };
            });

        localStorage.setItem("users", JSON.stringify(regularUsers));
    }

    function normalizeApiUser(user, index) {
        return {
            id: Number(user.id) || 3000 + index,
            apiId: user.id,
            name: user.name || "Utilizador",
            email: user.email || "",
            phone: user.phone || "",
            createdAt: user.createdAt ? String(user.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
            plan: user.plan || "none",
            status: user.status || "ativo",
            password: "",
            lastActivity: user.lastActivity ? new Date(user.lastActivity).toLocaleString("pt-PT") : "Sem atividade",
            role: user.role || "cliente",
            username: user.username || ""
        };
    }

    async function syncUsersFromApi() {
        if (!state.apiEnabled) {
            return false;
        }

        try {
            var apiUsers = await window.BeastCenterApi.getUsers();
            state.users = apiUsers.map(normalizeApiUser).filter(function (user) {
                return !isDemoUser(user);
            });
            saveUsers();
            return true;
        } catch (error) {
            console.error("Falha a carregar utilizadores da API:", error.message);
            return false;
        }
    }

    function normalizeText(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function formatPlanLabel(plan) {
        var labels = {
            none: "Sem plano",
            basico: "Basico",
            extra: "Extra",
            premium: "Premium",
            admin: "Admin"
        };
        return labels[plan] || "Sem plano";
    }

    function formatDate(dateText) {
        if (!dateText) {
            return "-";
        }

        var parts = dateText.split("-");
        if (parts.length !== 3) {
            return dateText;
        }

        return parts[2] + "/" + parts[1] + "/" + parts[0];
    }

    function getInitials(name) {
        var parts = (name || "").split(" ").filter(Boolean);
        if (parts.length === 0) {
            return "MB";
        }
        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    function getFilteredUsers() {
        return state.users.filter(function (user) {
            var search = normalizeText(state.search);
            var matchesSearch = !search ||
                normalizeText(user.name).indexOf(search) !== -1 ||
                normalizeText(user.email).indexOf(search) !== -1;
            var matchesPlan = state.plan === "all" || user.plan === state.plan;
            var matchesStatus = state.status === "all" || user.status === state.status;
            return matchesSearch && matchesPlan && matchesStatus;
        });
    }

    function getPaginatedUsers() {
        var filtered = getFilteredUsers();
        var start = (state.currentPage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }

    function getPageCount() {
        return Math.max(1, Math.ceil(getFilteredUsers().length / PAGE_SIZE));
    }

    function clampPage() {
        state.currentPage = Math.min(Math.max(1, state.currentPage), getPageCount());
    }

    function renderSummary() {
        var total = state.users.filter(function (user) { return user.role !== "admin"; }).length;
        var active = state.users.filter(function (user) { return user.status === "ativo" && user.role !== "admin"; }).length;
        var inactive = state.users.filter(function (user) { return user.status === "inativo" && user.role !== "admin"; }).length;
        var now = new Date();
        var newUsers = state.users.filter(function (user) {
            if (!user.createdAt || user.role === "admin") {
                return false;
            }
            var created = new Date(user.createdAt);
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length;
        var alerts = state.users.filter(function (user) { return user.status === "suspenso"; }).length;

        refs.summaryTotal.textContent = String(total);
        refs.summaryActive.textContent = String(active);
        refs.summaryInactive.textContent = String(inactive);
        refs.summaryNew.textContent = String(newUsers);
        refs.alertCount.textContent = String(alerts);
    }

    function renderRows() {
        clampPage();

        var paginated = getPaginatedUsers();
        if (paginated.length === 0) {
            refs.tbody.innerHTML = "<tr><td colspan='9' class='empty-table'>Sem utilizadores para mostrar.</td></tr>";
            return;
        }

        refs.tbody.innerHTML = paginated.map(function (user) {
            var selected = state.selectedIds.indexOf(user.id) !== -1 ? "checked" : "";
            var statusClass = user.status === "ativo" ? "active" : (user.status === "inativo" ? "inactive" : "suspended");
            var statusLabel = user.status.charAt(0).toUpperCase() + user.status.slice(1);
            var planClass = user.plan === "basico" ? "basico" : (user.plan === "extra" ? "extra" : (user.plan === "premium" ? "premium" : (user.plan === "admin" ? "admin" : "basico")));
            var toggleAction = user.status === "ativo" ? "deactivate" : "activate";
            var toggleLabel = user.status === "ativo" ? "Desativar" : "Ativar";
            var initials = getInitials(user.name);

            return (
                "<tr>" +
                    "<td><input type='checkbox' class='row-checkbox' data-id='" + user.id + "' " + selected + "></td>" +
                    "<td>#" + user.id + "</td>" +
                    "<td><div class='user-cell trainer-cell'><span class='trainer-avatar-fallback'>" + initials + "</span><span>" + user.name + "</span></div></td>" +
                    "<td>" + user.email + "</td>" +
                    "<td><span class='badge-plan " + planClass + "'>" + formatPlanLabel(user.plan) + "</span></td>" +
                    "<td><span class='status-badge " + statusClass + "'>" + statusLabel + "</span></td>" +
                    "<td>" + formatDate(user.createdAt) + "</td>" +
                    "<td>" + (user.lastActivity || "-") + "</td>" +
                    "<td>" +
                        "<div class='action-buttons'>" +
                            "<button class='btn-icon' data-action='view' data-id='" + user.id + "'>Ver</button>" +
                            "<button class='btn-icon' data-action='edit' data-id='" + user.id + "'>Editar</button>" +
                            "<button class='btn-icon " + (toggleAction === "deactivate" ? "danger" : "success") + "' data-action='" + toggleAction + "' data-id='" + user.id + "'>" + toggleLabel + "</button>" +
                        "</div>" +
                    "</td>" +
                "</tr>"
            );
        }).join("");
    }

    function renderPagination() {
        var pageCount = getPageCount();
        var html = "";
        var page;

        for (page = 1; page <= pageCount; page += 1) {
            html += "<button class='pagination-number " + (page === state.currentPage ? "active" : "") + "' data-page='" + page + "'>" + page + "</button>";
        }

        refs.paginationNumbers.innerHTML = html;
        refs.prevPageBtn.disabled = state.currentPage <= 1;
        refs.nextPageBtn.disabled = state.currentPage >= pageCount;
    }

    function renderBulkActions() {
        refs.selectedCount.textContent = String(state.selectedIds.length);
        refs.bulkActions.style.display = state.selectedIds.length > 0 ? "flex" : "none";
        refs.selectAll.checked = getPaginatedUsers().length > 0 && getPaginatedUsers().every(function (user) {
            return state.selectedIds.indexOf(user.id) !== -1;
        });
    }

    function render() {
        renderSummary();
        renderRows();
        renderPagination();
        renderBulkActions();
    }

    function openModal(user) {
        refs.form.reset();
        refs.inputId.value = "";
        refs.inputPassword.required = false;

        if (user) {
            state.editingId = user.id;
            refs.modalTitle.textContent = "Editar Utilizador";
            refs.inputId.value = String(user.id);
            refs.inputName.value = user.name;
            refs.inputEmail.value = user.email;
            refs.inputPhone.value = user.phone || "";
            refs.inputCreatedAt.value = user.createdAt || "";
            refs.inputPlan.value = user.plan === "admin" ? "premium" : user.plan;
            refs.inputStatus.value = user.status;
            refs.inputPassword.value = user.password || "";
            refs.inputLastActivity.value = user.lastActivity || "";
        } else {
            state.editingId = null;
            refs.modalTitle.textContent = "Adicionar Novo Utilizador";
            refs.inputCreatedAt.value = new Date().toISOString().slice(0, 10);
            refs.inputStatus.value = "ativo";
            refs.inputPlan.value = "none";
            refs.inputPassword.required = true;
        }

        refs.modal.style.display = "flex";
    }

    function closeModal() {
        refs.modal.style.display = "none";
    }

    function openDetails(user) {
        refs.detailsContent.innerHTML = [
            { label: "Nome", value: user.name },
            { label: "Email", value: user.email },
            { label: "Telefone", value: user.phone || "Sem telefone" },
            { label: "Plano", value: formatPlanLabel(user.plan) },
            { label: "Status", value: user.status },
            { label: "Criado em", value: formatDate(user.createdAt) },
            { label: "Ultima atividade", value: user.lastActivity || "-" },
            { label: "Perfil", value: user.role === "admin" ? "Administrador" : "Cliente" }
        ].map(function (item) {
            return "<div class='detail-item'><span>" + item.label + "</span><strong>" + item.value + "</strong></div>";
        }).join("");

        refs.detailsModal.style.display = "flex";
    }

    function closeDetailsModal() {
        refs.detailsModal.style.display = "none";
    }

    function getNextId() {
        return state.users.reduce(function (acc, user) {
            return Math.max(acc, Number(user.id) || 0);
        }, 1000) + 1;
    }

    function emailExists(email, editingId) {
        var target = normalizeText(email);
        return state.users.some(function (user) {
            return normalizeText(user.email) === target && user.id !== editingId;
        });
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        var payload = {
            id: state.editingId || getNextId(),
            name: refs.inputName.value.trim(),
            email: refs.inputEmail.value.trim(),
            phone: refs.inputPhone.value.trim(),
            createdAt: refs.inputCreatedAt.value || new Date().toISOString().slice(0, 10),
            plan: refs.inputPlan.value,
            status: refs.inputStatus.value,
            password: refs.inputPassword.value.trim(),
            lastActivity: refs.inputLastActivity.value.trim() || "Agora mesmo",
            role: "cliente"
        };

        if (!payload.name || !payload.email) {
            alert("Preenche nome e email.");
            return;
        }

        if (emailExists(payload.email, state.editingId)) {
            alert("Ja existe um utilizador com esse email.");
            return;
        }

        if (!state.editingId && payload.password.length < 8) {
            alert("A password deve ter pelo menos 8 caracteres.");
            return;
        }

        if (state.editingId) {
            var existingUser = state.users.find(function (user) {
                return user.id === state.editingId;
            });

            state.users = state.users.map(function (user) {
                if (user.id !== state.editingId) {
                    return user;
                }
                payload.password = payload.password || user.password || "";
                payload.role = user.role || "cliente";
                if (user.role === "admin") {
                    payload.plan = "admin";
                    payload.status = "ativo";
                    payload.role = "admin";
                }
                return payload;
            });

            if (state.apiEnabled && existingUser && existingUser.apiId) {
                try {
                    await window.BeastCenterApi.updateUser(existingUser.apiId, {
                        name: payload.name,
                        email: payload.email,
                        phone: payload.phone,
                        plan: payload.plan,
                        status: payload.status,
                        password: payload.password || undefined,
                        lastActivity: new Date().toISOString()
                    });
                    await syncUsersFromApi();
                } catch (error) {
                    alert(error.message || "Falha ao atualizar utilizador na base de dados.");
                    return;
                }
            }
        } else {
            if (state.apiEnabled) {
                try {
                    await window.BeastCenterApi.createUser({
                        name: payload.name,
                        email: payload.email,
                        phone: payload.phone,
                        plan: payload.plan,
                        status: payload.status,
                        password: payload.password
                    });
                    await syncUsersFromApi();
                } catch (error) {
                    alert(error.message || "Falha ao criar utilizador na base de dados.");
                    return;
                }
            } else {
                state.users.push(payload);
            }
        }

        saveUsers();
        closeModal();
        render();
    }

    function updateSelection(id, checked) {
        if (checked) {
            if (state.selectedIds.indexOf(id) === -1) {
                state.selectedIds.push(id);
            }
            return;
        }

        state.selectedIds = state.selectedIds.filter(function (value) {
            return value !== id;
        });
    }

    async function handleTableClick(event) {
        var actionButton = event.target.closest("button[data-action]");
        var checkbox = event.target.closest("input.row-checkbox");
        var user;
        var action;
        var id;

        if (checkbox) {
            updateSelection(Number(checkbox.getAttribute("data-id")), checkbox.checked);
            renderBulkActions();
            return;
        }

        if (!actionButton) {
            return;
        }

        action = actionButton.getAttribute("data-action");
        id = Number(actionButton.getAttribute("data-id"));
        user = state.users.find(function (item) { return item.id === id; });

        if (!user) {
            return;
        }

        if (action === "view") {
            openDetails(user);
            return;
        }

        if (action === "edit") {
            openModal(user);
            return;
        }

        if (action === "deactivate") {
            if (user.role === "admin") {
                alert("O administrador principal nao pode ser desativado.");
                return;
            }
            user.status = "inativo";
            user.lastActivity = "Conta desativada";
            if (state.apiEnabled && user.apiId) {
                await window.BeastCenterApi.updateUser(user.apiId, {
                    status: "inativo",
                    lastActivity: new Date().toISOString()
                });
                await syncUsersFromApi();
            }
            saveUsers();
            render();
            return;
        }

        if (action === "activate") {
            user.status = "ativo";
            user.lastActivity = "Reativado agora";
            if (state.apiEnabled && user.apiId) {
                await window.BeastCenterApi.updateUser(user.apiId, {
                    status: "ativo",
                    lastActivity: new Date().toISOString()
                });
                await syncUsersFromApi();
            }
            saveUsers();
            render();
        }
    }

    function handleSelectAll(event) {
        getPaginatedUsers().forEach(function (user) {
            updateSelection(user.id, event.target.checked);
        });
        renderBulkActions();
        renderRows();
    }

    async function handleBulkAction(event) {
        var button = event.target.closest("button[data-bulk-action]");
        var selectedUsers;
        var nextPlan;

        if (!button) {
            return;
        }

        selectedUsers = state.users.filter(function (user) {
            return state.selectedIds.indexOf(user.id) !== -1;
        });

        if (selectedUsers.length === 0) {
            return;
        }

        if (button.getAttribute("data-bulk-action") === "email") {
            alert("A enviar campanha para " + selectedUsers.length + " utilizadores.");
            return;
        }

        if (button.getAttribute("data-bulk-action") === "plan") {
            nextPlan = prompt("Novo plano para os selecionados (basico, extra ou premium):", "extra");
            if (!nextPlan || ["basico", "extra", "premium"].indexOf(nextPlan) === -1) {
                return;
            }
            state.users.forEach(function (user) {
                if (state.selectedIds.indexOf(user.id) !== -1 && user.role !== "admin") {
                    user.plan = nextPlan;
                }
            });
            if (state.apiEnabled) {
                for (var i = 0; i < state.users.length; i += 1) {
                    if (state.selectedIds.indexOf(state.users[i].id) !== -1 && state.users[i].role !== "admin" && state.users[i].apiId) {
                        await window.BeastCenterApi.updateUser(state.users[i].apiId, {
                            plan: nextPlan
                        });
                    }
                }
                await syncUsersFromApi();
            }
            saveUsers();
            render();
            return;
        }

        if (button.getAttribute("data-bulk-action") === "export") {
            exportCsv(selectedUsers);
            return;
        }

        if (button.getAttribute("data-bulk-action") === "deactivate") {
            state.users.forEach(function (user) {
                if (state.selectedIds.indexOf(user.id) !== -1 && user.role !== "admin") {
                    user.status = "inativo";
                }
            });
            if (state.apiEnabled) {
                for (var j = 0; j < state.users.length; j += 1) {
                    if (state.selectedIds.indexOf(state.users[j].id) !== -1 && state.users[j].role !== "admin" && state.users[j].apiId) {
                        await window.BeastCenterApi.updateUser(state.users[j].apiId, {
                            status: "inativo"
                        });
                    }
                }
                await syncUsersFromApi();
            }
            saveUsers();
            render();
        }
    }

    function exportCsv(source) {
        var rows = source || state.users;
        var csv = [
            ["id", "nome", "email", "plano", "status", "data_inscricao", "ultima_atividade"].join(",")
        ].concat(rows.map(function (user) {
            return [
                user.id,
                "\"" + user.name.replace(/"/g, "\"\"") + "\"",
                user.email,
                user.plan,
                user.status,
                user.createdAt,
                "\"" + (user.lastActivity || "").replace(/"/g, "\"\"") + "\""
            ].join(",");
        })).join("\n");

        var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        var url = URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "utilizadores-admin.csv";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }

    function goToPage(page) {
        state.currentPage = page;
        clampPage();
        render();
    }

    function bindEvents() {
        refs.searchInput.addEventListener("input", function (event) {
            state.search = event.target.value || "";
            state.currentPage = 1;
            render();
        });

        refs.planFilter.addEventListener("change", function (event) {
            state.plan = event.target.value;
            state.currentPage = 1;
            render();
        });

        refs.statusFilter.addEventListener("change", function (event) {
            state.status = event.target.value;
            state.currentPage = 1;
            render();
        });

        refs.addBtn.addEventListener("click", function () {
            openModal(null);
        });

        refs.exportBtn.addEventListener("click", function () {
            exportCsv(state.users);
        });

        refs.selectAll.addEventListener("change", handleSelectAll);
        refs.tbody.addEventListener("click", handleTableClick);
        refs.bulkActions.addEventListener("click", handleBulkAction);

        refs.paginationNumbers.addEventListener("click", function (event) {
            var button = event.target.closest("button[data-page]");
            if (button) {
                goToPage(Number(button.getAttribute("data-page")));
            }
        });

        refs.prevPageBtn.addEventListener("click", function () {
            goToPage(state.currentPage - 1);
        });

        refs.nextPageBtn.addEventListener("click", function () {
            goToPage(state.currentPage + 1);
        });

        refs.form.addEventListener("submit", handleFormSubmit);
        refs.closeModalBtn.addEventListener("click", closeModal);
        refs.cancelModalBtn.addEventListener("click", closeModal);
        refs.closeDetailsModalBtn.addEventListener("click", closeDetailsModal);

        refs.modal.addEventListener("click", function (event) {
            if (event.target === refs.modal) {
                closeModal();
            }
        });

        refs.detailsModal.addEventListener("click", function (event) {
            if (event.target === refs.detailsModal) {
                closeDetailsModal();
            }
        });
    }

    async function init() {
        state.users = loadUsers();
        saveUsers();
        bindEvents();
        await syncUsersFromApi();
        render();

        var params = new URLSearchParams(window.location.search);
        if (params.get("action") === "add") {
            openModal(null);
        }
    }

    init();
})();
