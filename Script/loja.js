(function () {
    "use strict";

    var CART_KEY = "cart";
    var COUPON_KEY = "appliedCoupon";
    var ORDERS_KEY = "shopOrders";
    var IMAGE_BASE = "../../images/products/";
    var PAYMENT_METHODS = ["card", "mbway", "paypal", "multibanco"];
    var COUPONS = {
        BEAST10: 0.10,
        BEAST20: 0.20,
        WELCOME: 0.15
    };

    var PRODUCTS = {
        "tshirt-black": {
            id: "tshirt-black",
            name: "T-shirt BeastCenter Preta",
            shortName: "T-shirt Preta",
            price: 24.99,
            imageNames: ["tshirt-black"],
            placeholder: "Merch"
        },
        "hoodie-grey": {
            id: "hoodie-grey",
            name: "Hoodie BeastCenter Cinza",
            shortName: "Hoodie Cinza",
            price: 49.99,
            imageNames: ["hoodie-grey"],
            placeholder: "Hoodie"
        },
        bottle: {
            id: "bottle",
            name: "Garrafa BeastCenter 1L",
            shortName: "Garrafa",
            price: 14.99,
            imageNames: ["bottle"],
            placeholder: "1L"
        },
        towel: {
            id: "towel",
            name: "Toalha BeastCenter",
            shortName: "Toalha",
            price: 9.99,
            imageNames: ["towel"],
            placeholder: "Gym"
        },
        "whey-vanilla": {
            id: "whey-vanilla",
            name: "Whey Protein Baunilha 1kg",
            shortName: "Whey",
            price: 39.99,
            imageNames: ["whey-vanilla", "whey-vanilla2"],
            placeholder: "Whey"
        },
        creatina: {
            id: "creatina",
            name: "Creatina Monohidratada 300g",
            shortName: "Creatina",
            price: 24.99,
            imageNames: ["creatina", "creatina2"],
            placeholder: "Cr"
        },
        bcaa: {
            id: "bcaa",
            name: "BCAA 2:1:1 Limao 500g",
            shortName: "BCAA",
            price: 29.99,
            imageNames: ["bcaa", "bcaa2"],
            placeholder: "BCAA"
        },
        preworkout: {
            id: "preworkout",
            name: "Pre-Workout Extreme 300g",
            shortName: "Pre",
            price: 34.99,
            imageNames: ["preworkout", "preworkout2"],
            placeholder: "Pre"
        },
        proteinbar: {
            id: "proteinbar",
            name: "Barras de Proteina Pack 12",
            shortName: "Bars",
            price: 19.99,
            imageNames: ["proteinbar", "proteinbar2"],
            placeholder: "Bar"
        }
    };

    var cart = readCart();
    var selectedPaymentMethod = "";

    function storageGet(key) {
        try {
            var value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            return null;
        }
    }

    function storageSet(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function storageRemove(key) {
        localStorage.removeItem(key);
    }

    function readCart() {
        var raw = storageGet(CART_KEY);
        if (!Array.isArray(raw)) {
            return [];
        }

        return raw.map(function (item) {
            var product = getProduct(item.id, item.name, item.price);
            return {
                id: product.id,
                name: product.name,
                shortName: product.shortName,
                price: Number(item.price || product.price || 0),
                quantity: Math.max(1, Number(item.quantity || 1))
            };
        });
    }

    function writeCart(nextCart) {
        cart = nextCart.slice();
        storageSet(CART_KEY, cart);
        updateCartCount();
    }

    function readCurrentUser() {
        return storageGet("currentUser");
    }

    function getAbsoluteUrl(path) {
        return "/" + String(path || "").replace(/^\/+/, "");
    }

    function getHomeUrl() {
        return getAbsoluteUrl("Index.html");
    }

    function getLoginUrl() {
        return getAbsoluteUrl("login.html");
    }

    function getStoreUrl() {
        return getAbsoluteUrl("loja/produtos.html");
    }

    function getCartUrl() {
        return getAbsoluteUrl("loja/carrinho.html");
    }

    function getCheckoutUrl() {
        return getAbsoluteUrl("loja/checkout.html");
    }

    function getDashboardUrl() {
        var user = readCurrentUser();
        if (!user) {
            return getLoginUrl();
        }

        return user.role === "admin"
            ? getAbsoluteUrl("admin/dashboard.html")
            : getAbsoluteUrl("cliente/dashboard.html");
    }

    function formatPriceLocal(value) {
        return Number(value || 0).toFixed(2).replace(".", ",") + "€";
    }

    function toastLocal(message, type) {
        if (typeof window.showToast === "function") {
            window.showToast(message, type || "info");
            return;
        }

        window.alert(message);
    }

    function getProduct(productId, fallbackName, fallbackPrice) {
        var product = PRODUCTS[productId];
        if (!product) {
            return {
                id: productId,
                name: fallbackName || "Produto BeastCenter",
                shortName: fallbackName || "Produto",
                price: Number(fallbackPrice || 0),
                imageCandidateGroups: [],
                imageCandidates: [],
                placeholder: "BC"
            };
        }

        var imageCandidateGroups = buildImageCandidateGroups(product.imageNames || []);

        return Object.assign({}, product, {
            imageCandidateGroups: imageCandidateGroups,
            imageCandidates: flattenImageCandidateGroups(imageCandidateGroups)
        });
    }

    function buildImageCandidateGroups(names) {
        var extensions = ["jpg", "png", "jpeg", "webp", "jpg.png"];
        return names.map(function (name) {
            return extensions.map(function (extension) {
                return IMAGE_BASE + name + "." + extension;
            });
        });
    }

    function flattenImageCandidateGroups(groups) {
        var candidates = [];

        groups.forEach(function (group) {
            group.forEach(function (candidate) {
                if (candidates.indexOf(candidate) === -1) {
                    candidates.push(candidate);
                }
            });
        });

        return candidates;
    }

    function createFallbackMarkup(product, compact) {
        return (
            "<div class='product-media-fallback" + (compact ? " compact" : "") + "'>" +
                "<span>" + product.placeholder + "</span>" +
                "<small>" + product.shortName + "</small>" +
            "</div>"
        );
    }

    function installImageWithFallback(image, candidates, fallbackTarget, product, compact) {
        if (!image) {
            if (fallbackTarget && !fallbackTarget.querySelector(".product-media-fallback")) {
                fallbackTarget.insertAdjacentHTML("beforeend", createFallbackMarkup(product, compact));
            }
            return;
        }

        var fallback = fallbackTarget.querySelector(".product-media-fallback");
        var index = 0;

        if (!fallback) {
            fallbackTarget.insertAdjacentHTML("beforeend", createFallbackMarkup(product, compact));
            fallback = fallbackTarget.querySelector(".product-media-fallback");
        }

        function showFallback() {
            image.style.display = "none";
            if (fallback) {
                fallback.hidden = false;
                fallback.style.display = "grid";
            }
        }

        if (!Array.isArray(candidates) || candidates.length === 0) {
            showFallback();
            return;
        }

        if (fallback) {
            fallback.hidden = true;
            fallback.style.display = "none";
        }

        image.onerror = function () {
            index += 1;
            if (index < candidates.length) {
                image.src = candidates[index];
                return;
            }
            showFallback();
        };

        image.src = candidates[0];
    }

    function bindStoreProductMedia() {
        Array.prototype.slice.call(document.querySelectorAll(".produto-card[data-product-id]")).forEach(function (card) {
            var productId = card.getAttribute("data-product-id");
            var product = getProduct(productId);
            var gallery = card.querySelector(".produto-gallery");
            var thumbsStrip = card.querySelector(".produto-thumbs");
            var mainContainer = card.querySelector(".produto-main") || card.querySelector(".produto-image");
            var mainImage = card.querySelector(".produto-main img") || card.querySelector(".produto-image > img");
            var thumbImages = Array.prototype.slice.call(card.querySelectorAll(".produto-thumbs img"));
            var galleryGroups = Array.isArray(product.imageCandidateGroups) ? product.imageCandidateGroups.slice() : [];

            if (gallery) {
                gallery.classList.add("is-gallery-ready");
            }

            function refreshThumbsStrip() {
                if (!gallery || !thumbsStrip) {
                    return;
                }

                var visibleThumbs = thumbImages.filter(function (thumb) {
                    return thumb.style.display !== "none";
                });

                thumbsStrip.style.display = visibleThumbs.length ? "flex" : "none";
                gallery.classList.toggle("is-no-thumbs", visibleThumbs.length === 0);
            }

            if (mainContainer) {
                installImageWithFallback(mainImage, product.imageCandidates || [], mainContainer, product, false);
            }

            thumbImages.forEach(function (thumb, index) {
                var thumbCandidates = galleryGroups[index] || [];
                var resolvedThumb = "";

                if (!thumbCandidates.length) {
                    thumb.style.display = "none";
                    refreshThumbsStrip();
                    return;
                }

                thumb.onerror = function () {
                    var nextIndex = Number(thumb.dataset.candidateIndex || 0) + 1;

                    if (nextIndex < thumbCandidates.length) {
                        thumb.dataset.candidateIndex = String(nextIndex);
                        thumb.src = thumbCandidates[nextIndex];
                        return;
                    }

                    thumb.style.display = "none";
                    refreshThumbsStrip();
                };

                thumb.onload = function () {
                    resolvedThumb = thumb.currentSrc || thumb.src;
                };

                thumb.dataset.candidateIndex = "0";
                thumb.src = thumbCandidates[0];
                thumb.addEventListener("click", function () {
                    if (mainImage) {
                        mainImage.style.display = "";
                        if (resolvedThumb) {
                            mainImage.src = resolvedThumb;
                        } else {
                            installImageWithFallback(mainImage, thumbCandidates, mainContainer, product, false);
                        }
                    }
                });
            });

            refreshThumbsStrip();
        });
    }

    function updateCartCount() {
        var cartCount = document.getElementById("cart-count");
        if (!cartCount) {
            return;
        }

        cartCount.textContent = String(cart.reduce(function (sum, item) {
            return sum + Number(item.quantity || 0);
        }, 0));
    }

    function syncLocalOrder(order) {
        var orders = storageGet(ORDERS_KEY);
        if (!Array.isArray(orders)) {
            orders = [];
        }

        orders.unshift(order);
        storageSet(ORDERS_KEY, orders);
    }

    function addToCart(productId, productName, price) {
        var product = getProduct(productId, productName, price);
        var existingItem = cart.find(function (item) {
            return item.id === productId;
        });

        if (existingItem) {
            existingItem.quantity += 1;
            toastLocal(product.name + " - quantidade atualizada.", "success");
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                shortName: product.shortName,
                price: Number(price || product.price || 0),
                quantity: 1
            });
            toastLocal(product.name + " adicionado ao carrinho.", "success");
        }

        writeCart(cart);

        if (isCartPage()) {
            renderCart();
            updateCartTotals();
        }
    }

    function removeFromCart(productId) {
        writeCart(cart.filter(function (item) {
            return item.id !== productId;
        }));

        toastLocal("Produto removido do carrinho.", "info");

        if (isCartPage()) {
            renderCart();
            updateCartTotals();
        }
    }

    function updateQuantity(productId, change) {
        var nextCart = cart.map(function (item) {
            if (item.id !== productId) {
                return item;
            }

            return Object.assign({}, item, {
                quantity: Math.max(1, Math.min(10, Number(item.quantity || 1) + Number(change || 0)))
            });
        });

        writeCart(nextCart);

        if (isCartPage()) {
            renderCart();
            updateCartTotals();
        }
    }

    function getAppliedCoupon() {
        var coupon = storageGet(COUPON_KEY);
        return typeof coupon === "string" ? coupon : "";
    }

    function calculateTotals() {
        var subtotal = cart.reduce(function (sum, item) {
            return sum + Number(item.price || 0) * Number(item.quantity || 0);
        }, 0);
        var appliedCoupon = getAppliedCoupon();
        var discountRate = COUPONS[appliedCoupon] || 0;
        var discount = subtotal * discountRate;
        var shipping = subtotal === 0 ? 0 : (subtotal >= 50 ? 0 : 5.99);
        var total = Math.max(subtotal - discount + shipping, 0);

        return {
            subtotal: subtotal,
            shipping: shipping,
            discount: discount,
            total: total,
            itemCount: cart.reduce(function (sum, item) {
                return sum + Number(item.quantity || 0);
            }, 0),
            appliedCoupon: appliedCoupon
        };
    }

    function updateCartTotals() {
        var totals = calculateTotals();
        var subtotalEl = document.getElementById("subtotal");
        var shippingEl = document.getElementById("envio");
        var totalEl = document.getElementById("total");
        var itemsCountEl = document.getElementById("cart-items-count");
        var discountRow = document.getElementById("desconto-row");
        var discountEl = document.getElementById("desconto");
        var discountInfo = document.querySelector(".desconto-info span");
        var checkoutButton = document.getElementById("start-checkout-btn");

        if (subtotalEl) {
            subtotalEl.textContent = formatPriceLocal(totals.subtotal);
        }

        if (shippingEl) {
            shippingEl.textContent = totals.shipping === 0 ? "Gratis" : formatPriceLocal(totals.shipping);
        }

        if (totalEl) {
            totalEl.textContent = formatPriceLocal(totals.total);
        }

        if (itemsCountEl) {
            itemsCountEl.textContent = String(totals.itemCount);
        }

        if (discountRow && discountEl) {
            if (totals.discount > 0) {
                discountRow.style.display = "flex";
                discountEl.textContent = "- " + formatPriceLocal(totals.discount);
            } else {
                discountRow.style.display = "none";
            }
        }

        if (discountInfo) {
            if (totals.itemCount === 0) {
                discountInfo.innerHTML = "Adiciona produtos para calculares portes e descontos.";
            } else if (totals.shipping === 0) {
                discountInfo.innerHTML = "<strong>Portes gratis!</strong>";
            } else {
                discountInfo.innerHTML = "Faltam <strong>" + formatPriceLocal(50 - totals.subtotal) + "</strong> para portes gratis!";
            }
        }

        if (checkoutButton) {
            checkoutButton.disabled = totals.itemCount === 0;
        }
    }

    function applyCoupon() {
        var couponInput = document.getElementById("cupao-code");
        var code = couponInput ? couponInput.value.trim().toUpperCase() : "";

        if (!code) {
            toastLocal("Por favor, insere um codigo.", "warning");
            return;
        }

        if (!COUPONS[code]) {
            toastLocal("Cupao invalido.", "error");
            return;
        }

        storageSet(COUPON_KEY, code);
        toastLocal("Cupao aplicado com sucesso.", "success");
        updateCartTotals();
    }

    function renderCart() {
        var container = document.getElementById("cart-items");
        if (!container) {
            return;
        }

        if (!Array.isArray(cart) || cart.length === 0) {
            container.innerHTML = "<div class='empty-cart'><h3>O teu carrinho esta vazio</h3><p>Quando adicionares produtos, eles vao aparecer aqui com o resumo completo da encomenda.</p></div>";
            return;
        }

        container.innerHTML = cart.map(function (item) {
            var product = getProduct(item.id, item.name, item.price);
            var candidates = encodeURIComponent(JSON.stringify(product.imageCandidates || []));

            return (
                "<article class='carrinho-item'>" +
                    "<div class='cart-media-frame'>" +
                        "<img class='cart-product-image' src='' alt='" + product.name + "' data-image-candidates='" + candidates + "' data-product-id='" + product.id + "'>" +
                    "</div>" +
                    "<div class='item-info'>" +
                        "<h3>" + product.name + "</h3>" +
                        "<p class='item-details'>Entrega estimada em 24-48h uteis.</p>" +
                        "<button class='remove-btn' type='button' onclick=\"removeFromCart('" + product.id + "')\">Remover</button>" +
                    "</div>" +
                    "<div class='item-quantity'>" +
                        "<button type='button' onclick=\"updateQuantity('" + product.id + "', -1)\">-</button>" +
                        "<input type='number' value='" + item.quantity + "' min='1' max='10' readonly>" +
                        "<button type='button' onclick=\"updateQuantity('" + product.id + "', 1)\">+</button>" +
                    "</div>" +
                    "<div class='item-price'>" +
                        "<span class='price'>" + formatPriceLocal(item.price * item.quantity) + "</span>" +
                        "<small class='price-unit'>" + formatPriceLocal(item.price) + " cada</small>" +
                    "</div>" +
                "</article>"
            );
        }).join("");

        bindCartImages(container);
    }

    function bindCartImages(scope) {
        Array.prototype.slice.call(scope.querySelectorAll(".cart-product-image")).forEach(function (image) {
            var product = getProduct(image.getAttribute("data-product-id"));
            var raw = image.getAttribute("data-image-candidates");
            var candidates = [];

            try {
                candidates = JSON.parse(decodeURIComponent(raw || ""));
            } catch (error) {
                candidates = product.imageCandidates || [];
            }

            installImageWithFallback(image, candidates, image.parentElement, product, true);
        });
    }

    function bindCategoryFilters() {
        Array.prototype.slice.call(document.querySelectorAll(".category-btn")).forEach(function (button) {
            button.addEventListener("click", function () {
                var category = button.getAttribute("data-category");

                Array.prototype.slice.call(document.querySelectorAll(".category-btn")).forEach(function (item) {
                    item.classList.remove("active");
                });
                button.classList.add("active");

                Array.prototype.slice.call(document.querySelectorAll(".produto-card")).forEach(function (card) {
                    var matches = category === "all" || card.getAttribute("data-category") === category;
                    card.style.display = matches ? "" : "none";
                });
            });
        });
    }

    function bindSorting() {
        var sortSelect = document.getElementById("sort-select");
        var productGrid = document.querySelector(".produtos-grid");

        if (!sortSelect || !productGrid) {
            return;
        }

        sortSelect.addEventListener("change", function () {
            var products = Array.prototype.slice.call(productGrid.querySelectorAll(".produto-card"));

            products.sort(function (left, right) {
                var priceLeft = Number(left.getAttribute("data-price") || 0);
                var priceRight = Number(right.getAttribute("data-price") || 0);

                if (sortSelect.value === "preco-asc") {
                    return priceLeft - priceRight;
                }

                if (sortSelect.value === "preco-desc") {
                    return priceRight - priceLeft;
                }

                if (sortSelect.value === "popular") {
                    return String(left.querySelector(".produto-rating") ? left.querySelector(".produto-rating").textContent : "").localeCompare(
                        String(right.querySelector(".produto-rating") ? right.querySelector(".produto-rating").textContent : "")
                    ) * -1;
                }

                return 0;
            });

            products.forEach(function (product) {
                productGrid.appendChild(product);
            });
        });
    }

    function isCartPage() {
        return window.location.pathname.indexOf("carrinho.html") !== -1;
    }

    function isCheckoutPage() {
        return window.location.pathname.indexOf("checkout.html") !== -1;
    }

    function initDashboardShortcut() {
        var link = document.getElementById("shop-dashboard-link");
        var user = readCurrentUser();

        if (!link) {
            return;
        }

        link.hidden = false;
        if (user) {
            link.href = getDashboardUrl();
            link.textContent = "Voltar ao dashboard";
            return;
        }

        link.href = getLoginUrl();
        link.textContent = "Iniciar sessao";
    }

    function initStoreLinks() {
        Array.prototype.slice.call(document.querySelectorAll(".navbar .cart-btn")).forEach(function (button) {
            button.onclick = function () {
                window.location.href = getCartUrl();
            };
        });

        Array.prototype.slice.call(document.querySelectorAll(".navbar .login-btn")).forEach(function (button) {
            button.onclick = function () {
                window.location.href = getLoginUrl();
            };
        });

        Array.prototype.slice.call(document.querySelectorAll(".continue-shopping .btn")).forEach(function (button) {
            button.onclick = function () {
                window.location.href = getStoreUrl();
            };
        });

        Array.prototype.slice.call(document.querySelectorAll("a[href='carrinho.html']")).forEach(function (anchor) {
            anchor.href = getCartUrl();
        });

        Array.prototype.slice.call(document.querySelectorAll("a[href='produtos.html']")).forEach(function (anchor) {
            anchor.href = getStoreUrl();
        });

        Array.prototype.slice.call(document.querySelectorAll("#checkout-success-dashboard")).forEach(function (anchor) {
            anchor.href = getDashboardUrl();
            if (!readCurrentUser()) {
                anchor.hidden = true;
            }
        });
    }

    function startCheckout() {
        if (!cart.length) {
            toastLocal("Adiciona pelo menos um produto antes de continuares.", "warning");
            return;
        }

        window.location.href = getCheckoutUrl();
    }

    function renderCheckoutSummary() {
        var itemsContainer = document.getElementById("checkout-items");
        var subtotalEl = document.getElementById("checkout-subtotal");
        var shippingEl = document.getElementById("checkout-shipping");
        var discountEl = document.getElementById("checkout-discount");
        var totalEl = document.getElementById("checkout-total");
        var couponEl = document.getElementById("checkout-coupon");
        var totals = calculateTotals();

        if (!itemsContainer) {
            return;
        }

        if (!cart.length) {
            itemsContainer.innerHTML = "<div class='empty-cart'><h3>Sem produtos no checkout</h3><p>Volta ao carrinho e adiciona pelo menos um artigo antes de avancares.</p></div>";
        } else {
            itemsContainer.innerHTML = cart.map(function (item) {
                var product = getProduct(item.id, item.name, item.price);
                return (
                    "<div class='checkout-item'>" +
                        "<div>" +
                            "<strong>" + product.name + "</strong>" +
                            "<span>" + item.quantity + " x " + formatPriceLocal(item.price) + "</span>" +
                        "</div>" +
                        "<strong>" + formatPriceLocal(item.price * item.quantity) + "</strong>" +
                    "</div>"
                );
            }).join("");
        }

        if (subtotalEl) {
            subtotalEl.textContent = formatPriceLocal(totals.subtotal);
        }
        if (shippingEl) {
            shippingEl.textContent = totals.shipping === 0 ? "Gratis" : formatPriceLocal(totals.shipping);
        }
        if (discountEl) {
            discountEl.textContent = totals.discount > 0 ? "- " + formatPriceLocal(totals.discount) : "0,00€";
        }
        if (totalEl) {
            totalEl.textContent = formatPriceLocal(totals.total);
        }
        if (couponEl) {
            couponEl.textContent = totals.appliedCoupon || "Sem cupao";
        }
    }

    function prefillCheckoutUser() {
        var user = readCurrentUser();
        if (!user) {
            return;
        }

        setFieldValue("checkout-name", user.name || "");
        setFieldValue("checkout-email", user.email || "");
        setFieldValue("checkout-phone", user.phone || "");
    }

    function setFieldValue(id, value) {
        var field = document.getElementById(id);
        if (field) {
            field.value = value || "";
        }
    }

    function bindCheckoutMethods() {
        Array.prototype.slice.call(document.querySelectorAll(".checkout-method")).forEach(function (option) {
            option.addEventListener("click", function () {
                selectedPaymentMethod = option.getAttribute("data-method");

                Array.prototype.slice.call(document.querySelectorAll(".checkout-method")).forEach(function (item) {
                    item.classList.remove("selected");
                });

                option.classList.add("selected");

                PAYMENT_METHODS.forEach(function (method) {
                    var panel = document.getElementById("checkout-payment-" + method);
                    if (panel) {
                        panel.hidden = method !== selectedPaymentMethod;
                    }
                });
            });
        });
    }

    function validateCheckoutForm() {
        var requiredIds = [
            "checkout-name",
            "checkout-email",
            "checkout-phone",
            "checkout-address",
            "checkout-postal",
            "checkout-city"
        ];

        var allFilled = requiredIds.every(function (id) {
            var field = document.getElementById(id);
            return !!(field && field.value.trim());
        });

        if (!allFilled) {
            return "Preenche os dados de entrega antes de confirmares a encomenda.";
        }

        if (!selectedPaymentMethod) {
            return "Seleciona um metodo de pagamento.";
        }

        if (selectedPaymentMethod === "card") {
            if (!(document.getElementById("checkout-card-name").value.trim() &&
                document.getElementById("checkout-card-number").value.trim() &&
                document.getElementById("checkout-card-expiry").value.trim() &&
                document.getElementById("checkout-card-cvv").value.trim())) {
                return "Preenche os dados do cartao.";
            }
        }

        if (selectedPaymentMethod === "mbway" && !document.getElementById("checkout-mbway-phone").value.trim()) {
            return "Indica o numero MB Way.";
        }

        if (selectedPaymentMethod === "paypal" && !document.getElementById("checkout-paypal-email").value.trim()) {
            return "Indica o email PayPal.";
        }

        if (selectedPaymentMethod === "multibanco") {
            if (!(document.getElementById("checkout-mb-name").value.trim() &&
                document.getElementById("checkout-mb-email").value.trim())) {
                return "Preenche os dados para referencia Multibanco.";
            }
        }

        return "";
    }

    async function completeCheckout(event) {
        event.preventDefault();

        if (!cart.length) {
            toastLocal("O carrinho esta vazio.", "warning");
            window.location.href = getCartUrl();
            return;
        }

        var validationError = validateCheckoutForm();
        if (validationError) {
            toastLocal(validationError, "warning");
            return;
        }

        var totals = calculateTotals();
        var currentUser = readCurrentUser();
        var order = {
            createdAt: new Date().toISOString(),
            userId: currentUser ? (currentUser.id || currentUser._id || "") : "",
            user: currentUser ? {
                id: currentUser.id || currentUser._id || "",
                name: currentUser.name || "",
                email: currentUser.email || ""
            } : null,
            items: cart.map(function (item) {
                return Object.assign({}, item);
            }),
            delivery: {
                name: document.getElementById("checkout-name").value.trim(),
                email: document.getElementById("checkout-email").value.trim(),
                phone: document.getElementById("checkout-phone").value.trim(),
                address: document.getElementById("checkout-address").value.trim(),
                postalCode: document.getElementById("checkout-postal").value.trim(),
                city: document.getElementById("checkout-city").value.trim(),
                deliveryType: document.getElementById("checkout-delivery-type").value,
                notes: document.getElementById("checkout-notes").value.trim()
            },
            payment: {
                method: selectedPaymentMethod,
                status: "paid"
            },
            totals: totals
        };

        if (!window.BeastCenterApi || typeof window.BeastCenterApi.createOrder !== "function") {
            toastLocal("A API da loja nao esta disponivel neste momento.", "error");
            return;
        }

        try {
            var response = await window.BeastCenterApi.createOrder(order);
            order = response && response.order ? response.order : order;
        } catch (error) {
            toastLocal(error.message || "Nao foi possivel concluir a compra.", "error");
            return;
        }

        syncLocalOrder(order);

        writeCart([]);
        storageRemove(COUPON_KEY);

        var formShell = document.getElementById("checkout-form-shell");
        var summaryShell = document.getElementById("checkout-summary-shell");
        var successPanel = document.getElementById("checkout-success");
        var successCode = document.getElementById("checkout-success-code");
        var successTotal = document.getElementById("checkout-success-total");
        var successDashboard = document.getElementById("checkout-success-dashboard");

        if (formShell) {
            formShell.hidden = true;
        }
        if (summaryShell) {
            summaryShell.hidden = true;
        }
        if (successPanel) {
            successPanel.hidden = false;
        }
        if (successCode) {
            successCode.textContent = order.orderCode || order.id || "BC-000000";
        }
        if (successTotal) {
            successTotal.textContent = formatPriceLocal(order.totals.total);
        }
        if (successDashboard && currentUser) {
            successDashboard.hidden = false;
            successDashboard.href = getDashboardUrl();
        }

        updateCartCount();
        toastLocal("Pagamento confirmado. Encomenda registada com sucesso.", "success");
    }

    function initCheckoutPage() {
        var form = document.getElementById("checkout-form");
        if (!form) {
            return;
        }

        if (!cart.length) {
            window.location.href = getCartUrl();
            return;
        }

        prefillCheckoutUser();
        renderCheckoutSummary();
        bindCheckoutMethods();

        var defaultMethod = document.querySelector(".checkout-method[data-method='card']");
        if (defaultMethod) {
            defaultMethod.click();
        }

        form.addEventListener("submit", completeCheckout);
        initDashboardShortcut();
    }

    function initCartPage() {
        if (!isCartPage()) {
            return;
        }

        renderCart();
        updateCartTotals();
        initDashboardShortcut();

        var checkoutButton = document.getElementById("start-checkout-btn");
        if (checkoutButton) {
            checkoutButton.addEventListener("click", startCheckout);
        }
    }

    function initRecommendedCards() {
        Array.prototype.slice.call(document.querySelectorAll(".produto-card-small[data-product-id]")).forEach(function (card) {
            var product = getProduct(card.getAttribute("data-product-id"));
            var image = card.querySelector("img");
            installImageWithFallback(image, product.imageCandidates || [], card, product, true);
        });
    }

    function init() {
        initStoreLinks();
        updateCartCount();
        bindCategoryFilters();
        bindSorting();
        bindStoreProductMedia();
        initRecommendedCards();
        initCartPage();
        initCheckoutPage();
    }

    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.updateQuantity = updateQuantity;
    window.applyCoupon = applyCoupon;

    document.addEventListener("DOMContentLoaded", init);
})();
