(function () {
    "use strict";

    var STORAGE_KEY = "beastcenter_admin_trainers";

    var state = {
        trainers: [],
        search: "",
        status: "all",
        editingId: null
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

    function persistLocal() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.trainers));
    }

    function normalizeText(value) {
        return (value || "").toString().trim().toLowerCase();
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
        return {
            id: index + 1,
            apiId: String(trainer._id || trainer.id || ""),
            name: trainer.name || "",
            specialization: trainer.specialization || "",
            experience: Number(trainer.experience || 0),
            clients: Number(trainer.clients || 0),
            rating: Number(trainer.rating || 0),
            status: trainer.status || "ativo",
            image: trainer.image || "",
            description: trainer.description || "",
            tags: Array.isArray(trainer.tags) ? trainer.tags : []
        };
    }

    async function syncFromApi() {
        if (!window.BeastCenterApi) {
            return;
        }

        var trainers = await window.BeastCenterApi.getTrainers();
        state.trainers = trainers.map(normalizeTrainer);
        persistLocal();
    }

    function getFilteredTrainers() {
        return state.trainers.filter(function (trainer) {
            var matchesSearch = normalizeText(trainer.name).indexOf(normalizeText(state.search)) !== -1;
            var matchesStatus = state.status === "all" || trainer.status === state.status;
            return matchesSearch && matchesStatus;
        });
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
                        "<button class='btn-icon' data-action='edit' data-id='" + trainer.id + "'>Editar</button>" +
                        "<button class='btn-icon " + (trainer.status === "ativo" ? "danger" : "success") + "' data-action='toggle' data-id='" + trainer.id + "'>" + (trainer.status === "ativo" ? "Desativar" : "Ativar") + "</button>" +
                        "<button class='btn-icon danger' data-action='delete' data-id='" + trainer.id + "'>Remover</button>" +
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
            state.editingId = trainer.id;
            refs.modalTitle.textContent = "Editar Trainer";
            refs.inputId.value = String(trainer.id);
            refs.inputName.value = trainer.name;
            refs.inputSpecialization.value = trainer.specialization;
            refs.inputExperience.value = String(trainer.experience);
            refs.inputClients.value = String(trainer.clients);
            refs.inputRating.value = String(trainer.rating);
            refs.inputStatus.value = trainer.status;
            refs.inputImage.value = trainer.image || "";
        } else {
            state.editingId = null;
            refs.modalTitle.textContent = "Adicionar Trainer";
            refs.inputStatus.value = "ativo";
        }

        refs.modal.style.display = "flex";
    }

    function closeModal() {
        refs.modal.style.display = "none";
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

        if (!trainer.name || !trainer.specialization) {
            alert("Preenche nome e especializacao.");
            return;
        }

        if (state.editingId) {
            var current = state.trainers.find(function (item) { return item.id === state.editingId; });
            await window.BeastCenterApi.updateTrainer(current.apiId, trainer);
        } else {
            await window.BeastCenterApi.createTrainer(trainer);
        }

        await syncFromApi();
        closeModal();
        render();
    }

    async function handleRowAction(event) {
        var button = event.target.closest("button[data-action]");
        if (!button) {
            return;
        }

        var action = button.getAttribute("data-action");
        var trainer = state.trainers.find(function (item) {
            return item.id === Number(button.getAttribute("data-id"));
        });

        if (!trainer) {
            return;
        }

        if (action === "edit") {
            openModal(trainer);
            return;
        }

        if (action === "toggle") {
            await window.BeastCenterApi.updateTrainer(trainer.apiId, {
                status: trainer.status === "ativo" ? "inativo" : "ativo"
            });
            await syncFromApi();
            render();
            return;
        }

        if (action === "delete") {
            if (!confirm("Remover o trainer " + trainer.name + "?")) {
                return;
            }
            await window.BeastCenterApi.deleteTrainer(trainer.apiId);
            await syncFromApi();
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
        refs.form.addEventListener("submit", handleFormSubmit);
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
        try {
            await syncFromApi();
        } catch (error) {
            state.trainers = [];
        }
        render();

        var params = new URLSearchParams(window.location.search);
        if (params.get("action") === "add") {
            openModal(null);
        }
    }

    init();
})();
