(function () {
    "use strict";

    var STORAGE_KEY = "beastcenter_admin_trainers";

    var state = {
        trainers: [],
        search: "",
        status: "all",
        editingKey: ""
    };

    var refs = {
        tbody: document.getElementById("trainers-tbody"),
        searchInput: document.getElementById("search-trainers"),
        statusFilter: document.getElementById("filter-status"),
        addBtn: document.getElementById("add-trainer-btn"),
        exportBtn: document.getElementById("export-trainers-btn"),
        modal: document.getElementById("trainer-modal"),
        modalTitle: document.getElementById("trainer-modal-title"),
        closeModalBtn: document.getElementById("close-trainer-modal"),
        cancelModalBtn: document.getElementById("cancel-trainer-modal"),
        form: document.getElementById("trainer-form"),
        inputId: document.getElementById("trainer-id"),
        inputName: document.getElementById("trainer-name"),
        inputSpecialization: document.getElementById("trainer-specialization"),
        inputExperience: document.getElementById("trainer-experience"),
        inputClients: document.getElementById("trainer-clients"),
        inputRating: document.getElementById("trainer-rating"),
        inputStatus: document.getElementById("trainer-status"),
        inputImage: document.getElementById("trainer-image"),
        summaryTotal: document.getElementById("summary-total"),
        summaryActive: document.getElementById("summary-active"),
        summaryInactive: document.getElementById("summary-inactive"),
        summaryRating: document.getElementById("summary-rating")
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

    function normalizeText(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function slugify(value) {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, "");
    }

    function getInitials(name) {
        var pieces = (name || "").split(" ").filter(Boolean);
        if (pieces.length === 0) {
            return "PT";
        }
        if (pieces.length === 1) {
            return pieces[0].slice(0, 2).toUpperCase();
        }
        return (pieces[0][0] + pieces[pieces.length - 1][0]).toUpperCase();
    }

    function normalizeTrainer(trainer, index) {
        var apiId = String(trainer._id || trainer.apiId || "");
        var rowKey = trainer.rowKey || (apiId ? "api:" + apiId : "local:" + slugify(trainer.name || ("trainer-" + index)));

        return {
            id: Number(index) + 1,
            rowKey: rowKey,
            apiId: apiId,
            name: trainer.name || "",
            specialization: trainer.specialization || trainer.specialty || "",
            experience: Number(trainer.experience || 0),
            clients: Number(trainer.clients || 0),
            rating: Number(trainer.rating || 0),
            status: trainer.status || "ativo",
            image: trainer.image || trainer.publicImage || "",
            description: trainer.description || trainer.bio || "",
            tags: Array.isArray(trainer.tags) ? trainer.tags.slice() : []
        };
    }

    function assignDisplayIds(trainers) {
        return trainers.map(function (trainer, index) {
            return Object.assign({}, trainer, {
                id: index + 1
            });
        });
    }

    function persistLocal() {
        writeJson(STORAGE_KEY, state.trainers.map(function (trainer) {
            return {
                rowKey: trainer.rowKey,
                apiId: trainer.apiId,
                name: trainer.name,
                specialization: trainer.specialization,
                experience: trainer.experience,
                clients: trainer.clients,
                rating: trainer.rating,
                status: trainer.status,
                image: trainer.image,
                description: trainer.description,
                tags: trainer.tags
            };
        }));
    }

    function readStoredTrainers() {
        return assignDisplayIds(readJson(STORAGE_KEY, []).map(normalizeTrainer));
    }

    function getSeedTrainers() {
        if (window.BeastCenterTrainersData && Array.isArray(window.BeastCenterTrainersData.mockTrainers)) {
            return assignDisplayIds(window.BeastCenterTrainersData.mockTrainers.map(normalizeTrainer));
        }
        return [];
    }

    function ensureSeeded() {
        var stored = readStoredTrainers();
        var seeds;

        if (stored.length) {
            return stored;
        }

        seeds = getSeedTrainers();
        if (seeds.length) {
            state.trainers = seeds;
            persistLocal();
            return assignDisplayIds(state.trainers);
        }

        return [];
    }

    function mergeTrainers(apiTrainers, localTrainers) {
        var map = {};
        var order = [];

        localTrainers.forEach(function (trainer) {
            var key = normalizeText(trainer.name) || trainer.rowKey;
            if (!map[key]) {
                order.push(key);
            }
            map[key] = trainer;
        });

        apiTrainers.forEach(function (trainer) {
            var key = normalizeText(trainer.name) || trainer.rowKey;
            if (!map[key]) {
                order.push(key);
            }
            map[key] = Object.assign({}, map[key] || {}, trainer);
        });

        return assignDisplayIds(order.map(function (key) {
            return map[key];
        }));
    }

    async function syncFromApi() {
        var localTrainers = ensureSeeded();
        var apiTrainers;

        if (!window.BeastCenterApi) {
            state.trainers = localTrainers;
            return;
        }

        try {
            apiTrainers = await window.BeastCenterApi.getTrainers();
            state.trainers = mergeTrainers(apiTrainers.map(normalizeTrainer), localTrainers);
            persistLocal();
        } catch (error) {
            state.trainers = localTrainers;
        }
    }

    function getFilteredTrainers() {
        return state.trainers.filter(function (trainer) {
            var matchesSearch = normalizeText(trainer.name).indexOf(normalizeText(state.search)) !== -1;
            var matchesStatus = state.status === "all" || trainer.status === state.status;
            return matchesSearch && matchesStatus;
        });
    }

    function getTrainerByKey(key) {
        return state.trainers.find(function (trainer) {
            return trainer.rowKey === key;
        }) || null;
    }

    function renderSummary() {
        var total = state.trainers.length;
        var active = state.trainers.filter(function (t) { return t.status === "ativo"; }).length;
        var inactive = total - active;
        var avg = total > 0
            ? state.trainers.reduce(function (acc, trainer) { return acc + Number(trainer.rating || 0); }, 0) / total
            : 0;

        refs.summaryTotal.textContent = String(total);
        refs.summaryActive.textContent = String(active);
        refs.summaryInactive.textContent = String(inactive);
        refs.summaryRating.textContent = avg.toFixed(1);
    }

    function renderRows() {
        var filtered = getFilteredTrainers();

        if (filtered.length === 0) {
            refs.tbody.innerHTML = "<tr><td colspan='8' class='empty-table'>Sem trainers para mostrar.</td></tr>";
            return;
        }

        refs.tbody.innerHTML = filtered.map(function (trainer) {
            var fallback = getInitials(trainer.name);
            var imageHtml = trainer.image
                ? "<img src='" + trainer.image + "' alt='" + trainer.name + "' onerror=\"this.style.display='none';this.nextElementSibling.style.display='inline-flex';\">"
                : "";

            return (
                "<tr>" +
                    "<td>#" + trainer.id + "</td>" +
                    "<td><div class='user-cell trainer-cell'>" +
                        imageHtml +
                        "<span class='trainer-avatar-fallback' style='" + (trainer.image ? "display:none;" : "") + "'>" + fallback + "</span>" +
                        "<span>" + trainer.name + "</span>" +
                    "</div></td>" +
                    "<td>" + trainer.specialization + "</td>" +
                    "<td>" + trainer.experience + " anos</td>" +
                    "<td>" + trainer.clients + "</td>" +
                    "<td>" + Number(trainer.rating).toFixed(1) + "</td>" +
                    "<td><span class='status-badge " + (trainer.status === "ativo" ? "active" : "inactive") + "'>" + (trainer.status === "ativo" ? "Ativo" : "Inativo") + "</span></td>" +
                    "<td><div class='action-buttons'>" +
                        "<button class='btn-icon' data-action='edit' data-key='" + trainer.rowKey + "'>Editar</button>" +
                        "<button class='btn-icon " + (trainer.status === "ativo" ? "danger" : "success") + "' data-action='toggle' data-key='" + trainer.rowKey + "'>" + (trainer.status === "ativo" ? "Desativar" : "Ativar") + "</button>" +
                        "<button class='btn-icon danger' data-action='delete' data-key='" + trainer.rowKey + "'>Remover</button>" +
                    "</div></td>" +
                "</tr>"
            );
        }).join("");
    }

    function render() {
        renderSummary();
        renderRows();
    }

    function openModal(trainer) {
        refs.form.reset();

        if (trainer) {
            state.editingKey = trainer.rowKey;
            refs.modalTitle.textContent = "Editar Trainer";
            refs.inputId.value = trainer.rowKey;
            refs.inputName.value = trainer.name;
            refs.inputSpecialization.value = trainer.specialization;
            refs.inputExperience.value = String(trainer.experience);
            refs.inputClients.value = String(trainer.clients);
            refs.inputRating.value = String(trainer.rating);
            refs.inputStatus.value = trainer.status;
            refs.inputImage.value = trainer.image || "";
        } else {
            state.editingKey = "";
            refs.modalTitle.textContent = "Adicionar Trainer";
            refs.inputId.value = "";
            refs.inputStatus.value = "ativo";
        }

        refs.modal.style.display = "flex";
    }

    function closeModal() {
        refs.modal.style.display = "none";
    }

    function updateLocalTrainer(rowKey, payload) {
        state.trainers = assignDisplayIds(state.trainers.map(function (trainer) {
            if (trainer.rowKey !== rowKey) {
                return trainer;
            }
            return Object.assign({}, trainer, payload);
        }));
        persistLocal();
    }

    function removeLocalTrainer(rowKey) {
        state.trainers = assignDisplayIds(state.trainers.filter(function (trainer) {
            return trainer.rowKey !== rowKey;
        }));
        persistLocal();
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        var trainer = {
            name: refs.inputName.value.trim(),
            specialization: refs.inputSpecialization.value.trim(),
            experience: Number(refs.inputExperience.value),
            clients: Number(refs.inputClients.value),
            rating: Number(refs.inputRating.value),
            status: refs.inputStatus.value,
            image: refs.inputImage.value.trim()
        };
        var current;

        if (!trainer.name || !trainer.specialization) {
            alert("Preenche nome e especializacao.");
            return;
        }

        if (state.editingKey) {
            current = getTrainerByKey(state.editingKey);
            if (current && current.apiId && window.BeastCenterApi) {
                await window.BeastCenterApi.updateTrainer(current.apiId, trainer);
                await syncFromApi();
            } else {
                updateLocalTrainer(state.editingKey, trainer);
            }
        } else if (window.BeastCenterApi) {
            try {
                await window.BeastCenterApi.createTrainer(trainer);
                await syncFromApi();
            } catch (error) {
                state.trainers = assignDisplayIds(state.trainers.concat([normalizeTrainer(Object.assign({}, trainer, {
                    rowKey: "local:" + slugify(trainer.name) + "-" + Date.now()
                }), state.trainers.length)]));
                persistLocal();
            }
        } else {
            state.trainers = assignDisplayIds(state.trainers.concat([normalizeTrainer(Object.assign({}, trainer, {
                rowKey: "local:" + slugify(trainer.name) + "-" + Date.now()
            }), state.trainers.length)]));
            persistLocal();
        }

        closeModal();
        render();
    }

    async function handleRowAction(event) {
        var button = event.target.closest("button[data-action]");
        var action;
        var trainer;

        if (!button) {
            return;
        }

        action = button.getAttribute("data-action");
        trainer = getTrainerByKey(button.getAttribute("data-key"));

        if (!trainer) {
            return;
        }

        if (action === "edit") {
            openModal(trainer);
            return;
        }

        if (action === "toggle") {
            if (trainer.apiId && window.BeastCenterApi) {
                await window.BeastCenterApi.updateTrainer(trainer.apiId, {
                    status: trainer.status === "ativo" ? "inativo" : "ativo"
                });
                await syncFromApi();
            } else {
                updateLocalTrainer(trainer.rowKey, {
                    status: trainer.status === "ativo" ? "inativo" : "ativo"
                });
            }
            render();
            return;
        }

        if (action === "delete") {
            if (!confirm("Remover o trainer " + trainer.name + "?")) {
                return;
            }

            if (trainer.apiId && window.BeastCenterApi) {
                await window.BeastCenterApi.deleteTrainer(trainer.apiId);
                await syncFromApi();
            } else {
                removeLocalTrainer(trainer.rowKey);
            }
            render();
        }
    }

    function exportJson() {
        var blob = new Blob([JSON.stringify(state.trainers, null, 2)], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "trainers-admin-export.json";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }

    function bindEvents() {
        refs.searchInput.addEventListener("input", function (event) {
            state.search = event.target.value || "";
            renderRows();
        });

        refs.statusFilter.addEventListener("change", function (event) {
            state.status = event.target.value;
            renderRows();
        });

        refs.addBtn.addEventListener("click", function () {
            openModal(null);
        });

        refs.exportBtn.addEventListener("click", exportJson);
        refs.closeModalBtn.addEventListener("click", closeModal);
        refs.cancelModalBtn.addEventListener("click", closeModal);
        refs.form.addEventListener("submit", function (event) {
            handleFormSubmit(event).catch(function (error) {
                alert(error.message || "Falha ao guardar trainer.");
            });
        });
        refs.tbody.addEventListener("click", function (event) {
            handleRowAction(event).catch(function (error) {
                alert(error.message || "Falha ao atualizar trainer.");
            });
        });

        refs.modal.addEventListener("click", function (event) {
            if (event.target === refs.modal) {
                closeModal();
            }
        });
    }

    async function init() {
        bindEvents();
        ensureSeeded();
        await syncFromApi();
        render();

        var params = new URLSearchParams(window.location.search);
        if (params.get("action") === "add") {
            openModal(null);
        }
    }

    init();
})();
