(function () {
    "use strict";

    var state = {
        classes: [],
        search: "",
        day: "all",
        status: "all",
        editingId: null
    };

    var refs = {
        tbody: document.getElementById("classes-tbody"),
        searchInput: document.getElementById("search-classes"),
        dayFilter: document.getElementById("filter-day"),
        statusFilter: document.getElementById("filter-class-status"),
        addBtn: document.getElementById("add-class-btn"),
        modal: document.getElementById("class-modal"),
        modalTitle: document.getElementById("class-modal-title"),
        closeModalBtn: document.getElementById("close-class-modal"),
        cancelModalBtn: document.getElementById("cancel-class-modal"),
        form: document.getElementById("class-form"),
        inputTitle: document.getElementById("class-title"),
        inputCategory: document.getElementById("class-category"),
        inputTrainer: document.getElementById("class-trainer"),
        inputLocation: document.getElementById("class-location"),
        inputDay: document.getElementById("class-day"),
        inputTime: document.getElementById("class-time"),
        inputDuration: document.getElementById("class-duration"),
        inputCapacity: document.getElementById("class-capacity"),
        inputEnrolled: document.getElementById("class-enrolled"),
        inputStatus: document.getElementById("class-status"),
        inputDescription: document.getElementById("class-description"),
        summaryTotal: document.getElementById("summary-total-classes"),
        summaryActive: document.getElementById("summary-active-classes"),
        summaryInactive: document.getElementById("summary-inactive-classes"),
        summaryCapacity: document.getElementById("summary-capacity-classes")
    };

    function normalizeText(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    async function syncFromApi() {
        state.classes = await window.BeastCenterApi.getClasses();
    }

    function getFilteredClasses() {
        return state.classes.filter(function (classItem) {
            var search = normalizeText(state.search);
            var matchesSearch = !search ||
                normalizeText(classItem.title).indexOf(search) !== -1 ||
                normalizeText(classItem.trainerName).indexOf(search) !== -1;
            var matchesDay = state.day === "all" || classItem.dayOfWeek === state.day;
            var matchesStatus = state.status === "all" || classItem.status === state.status;
            return matchesSearch && matchesDay && matchesStatus;
        });
    }

    function renderSummary() {
        refs.summaryTotal.textContent = String(state.classes.length);
        refs.summaryActive.textContent = String(state.classes.filter(function (item) { return item.status === "ativa"; }).length);
        refs.summaryInactive.textContent = String(state.classes.filter(function (item) { return item.status === "inativa"; }).length);
        refs.summaryCapacity.textContent = String(state.classes.reduce(function (acc, item) { return acc + Number(item.capacity || 0); }, 0));
    }

    function renderRows() {
        var rows = getFilteredClasses();
        if (rows.length === 0) {
            refs.tbody.innerHTML = "<tr><td colspan='8' class='empty-table'>Sem aulas para mostrar.</td></tr>";
            return;
        }

        refs.tbody.innerHTML = rows.map(function (item) {
            return (
                "<tr>" +
                    "<td>" + item.title + "</td>" +
                    "<td><span class='badge-plan basico'>" + item.category + "</span></td>" +
                    "<td>" + item.trainerName + "</td>" +
                    "<td>" + item.dayOfWeek + "</td>" +
                    "<td>" + item.time + "</td>" +
                    "<td>" + item.enrolledCount + "/" + item.capacity + "</td>" +
                    "<td><span class='status-badge " + (item.status === "ativa" ? "active" : "inactive") + "'>" + (item.status === "ativa" ? "Ativa" : "Inativa") + "</span></td>" +
                    "<td><div class='action-buttons'>" +
                        "<button class='btn-icon' data-action='edit' data-id='" + item._id + "'>Editar</button>" +
                        "<button class='btn-icon " + (item.status === "ativa" ? "danger" : "success") + "' data-action='toggle' data-id='" + item._id + "'>" + (item.status === "ativa" ? "Desativar" : "Ativar") + "</button>" +
                        "<button class='btn-icon danger' data-action='delete' data-id='" + item._id + "'>Remover</button>" +
                    "</div></td>" +
                "</tr>"
            );
        }).join("");
    }

    function render() {
        renderSummary();
        renderRows();
    }

    function openModal(classItem) {
        refs.form.reset();
        if (classItem) {
            state.editingId = classItem._id;
            refs.modalTitle.textContent = "Editar Aula";
            refs.inputTitle.value = classItem.title;
            refs.inputCategory.value = classItem.category;
            refs.inputTrainer.value = classItem.trainerName;
            refs.inputLocation.value = classItem.location || "";
            refs.inputDay.value = classItem.dayOfWeek;
            refs.inputTime.value = classItem.time;
            refs.inputDuration.value = classItem.duration;
            refs.inputCapacity.value = classItem.capacity;
            refs.inputEnrolled.value = classItem.enrolledCount;
            refs.inputStatus.value = classItem.status;
            refs.inputDescription.value = classItem.description || "";
        } else {
            state.editingId = null;
            refs.modalTitle.textContent = "Adicionar Aula";
            refs.inputDay.value = "segunda";
            refs.inputStatus.value = "ativa";
        }
        refs.modal.style.display = "flex";
    }

    function closeModal() {
        refs.modal.style.display = "none";
    }

    async function handleSubmit(event) {
        event.preventDefault();

        var payload = {
            title: refs.inputTitle.value.trim(),
            category: refs.inputCategory.value.trim().toLowerCase(),
            trainerName: refs.inputTrainer.value.trim(),
            location: refs.inputLocation.value.trim(),
            dayOfWeek: refs.inputDay.value,
            time: refs.inputTime.value,
            duration: Number(refs.inputDuration.value),
            capacity: Number(refs.inputCapacity.value),
            enrolledCount: Number(refs.inputEnrolled.value),
            status: refs.inputStatus.value,
            description: refs.inputDescription.value.trim()
        };

        if (state.editingId) {
            await window.BeastCenterApi.updateClass(state.editingId, payload);
        } else {
            await window.BeastCenterApi.createClass(payload);
        }

        await syncFromApi();
        closeModal();
        render();
    }

    async function handleTableClick(event) {
        var button = event.target.closest("button[data-action]");
        if (!button) {
            return;
        }

        var action = button.getAttribute("data-action");
        var id = button.getAttribute("data-id");
        var classItem = state.classes.find(function (item) { return item._id === id; });
        if (!classItem) {
            return;
        }

        if (action === "edit") {
            openModal(classItem);
            return;
        }

        if (action === "toggle") {
            await window.BeastCenterApi.updateClass(id, {
                status: classItem.status === "ativa" ? "inativa" : "ativa"
            });
            await syncFromApi();
            render();
            return;
        }

        if (action === "delete") {
            if (!confirm("Remover a aula " + classItem.title + "?")) {
                return;
            }
            await window.BeastCenterApi.deleteClass(id);
            await syncFromApi();
            render();
        }
    }

    function bindEvents() {
        refs.searchInput.addEventListener("input", function (event) {
            state.search = event.target.value || "";
            renderRows();
        });
        refs.dayFilter.addEventListener("change", function (event) {
            state.day = event.target.value;
            renderRows();
        });
        refs.statusFilter.addEventListener("change", function (event) {
            state.status = event.target.value;
            renderRows();
        });
        refs.addBtn.addEventListener("click", function () { openModal(null); });
        refs.closeModalBtn.addEventListener("click", closeModal);
        refs.cancelModalBtn.addEventListener("click", closeModal);
        refs.form.addEventListener("submit", function (event) {
            handleSubmit(event).catch(function (error) {
                alert(error.message || "Falha ao guardar aula.");
            });
        });
        refs.tbody.addEventListener("click", function (event) {
            handleTableClick(event).catch(function (error) {
                alert(error.message || "Falha ao atualizar aula.");
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
        await syncFromApi();
        render();
        var params = new URLSearchParams(window.location.search);
        if (params.get("action") === "create") {
            openModal(null);
        }
    }

    init().catch(function (error) {
        refs.tbody.innerHTML = "<tr><td colspan='8' class='empty-table'>Falha a carregar aulas.</td></tr>";
    });
})();
