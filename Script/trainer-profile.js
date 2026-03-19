(function () {
    "use strict";

    function getTrainerSlug() {
        var params = new URLSearchParams(window.location.search);
        return params.get("trainer") || "";
    }

    function setText(id, value) {
        var element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    function getBookingUrl(trainer) {
        return "marcar-sessao.html?trainer=" + encodeURIComponent(trainer.slug);
    }

    function renderTrainer(trainer) {
        document.title = trainer.name + " - BeastCenter";
        setText("trainer-profile-name", trainer.name);
        setText("trainer-profile-specialization", trainer.specialization);
        setText("trainer-profile-description", trainer.description);
        setText("trainer-profile-bio", trainer.description + " Trabalha com foco em consistencia, tecnica e resultados sustentaveis.");

        var stats = document.getElementById("trainer-profile-stats");
        if (stats) {
            stats.innerHTML = [
                "<div><strong>" + trainer.experience + "</strong><span>anos de experiencia</span></div>",
                "<div><strong>" + Number(trainer.rating).toFixed(1) + "/5</strong><span>avaliacao media</span></div>",
                "<div><strong>+" + trainer.clients + "</strong><span>clientes acompanhados</span></div>"
            ].join("");
        }

        var tags = document.getElementById("trainer-profile-tags");
        if (tags) {
            tags.innerHTML = (trainer.tags || []).map(function (tag) {
                return "<span>" + tag + "</span>";
            }).join("");
        }

        var focus = document.getElementById("trainer-profile-focus");
        if (focus) {
            focus.innerHTML = (trainer.tags || []).map(function (tag) {
                return "<li>" + tag + "</li>";
            }).join("");
        }

        var image = document.getElementById("trainer-profile-image");
        var fallback = document.getElementById("trainer-profile-fallback");
        var path = document.getElementById("trainer-profile-photo-path");

        if (path) {
            path.textContent = "/images/trainers/" + trainer.slug + ".jpg";
        }

        if (image) {
            var candidates = Array.isArray(trainer.profileImageCandidates) ? trainer.profileImageCandidates.slice() : ["../../images/trainers/" + trainer.slug + ".jpg"];
            var index = 0;

            image.src = candidates[0];
            image.alt = trainer.name;
            image.onerror = function () {
                index += 1;
                if (index < candidates.length) {
                    image.src = candidates[index];
                    return;
                }

                image.style.display = "none";
                if (fallback) {
                    fallback.style.display = "grid";
                }
            };
        }

        var bookLink = document.getElementById("trainer-book-link");
        if (bookLink) {
            var bookingUrl = getBookingUrl(trainer);
            bookLink.href = bookingUrl;
            bookLink.addEventListener("click", function (event) {
                event.preventDefault();
                window.location.href = bookingUrl;
            });
        }
    }

    async function init() {
        var slug = getTrainerSlug();
        if (!slug || !window.BeastCenterTrainersData) {
            window.location.href = "../trainers.html";
            return;
        }

        var trainer = await window.BeastCenterTrainersData.readTrainerBySlug(slug);
        if (!trainer) {
            window.location.href = "../trainers.html";
            return;
        }

        renderTrainer(trainer);
    }

    init();
})();
