// Script da Loja - Gestao de produtos e carrinho

function storageGet(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (err) {
        return null;
    }
}

function storageSet(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function formatPriceLocal(value) {
    return value.toFixed(2).replace('.', ',') + '?';
}

function toastLocal(message, type) {
    if (typeof showToast === 'function') {
        showToast(message, type || 'info');
        return;
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type || 'info'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

let cart = storageGet('cart') || [];

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function addToCart(productId, productName, price) {
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
        toastLocal(`${productName} - quantidade atualizada!`, 'success');
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
        toastLocal(`${productName} adicionado ao carrinho!`, 'success');
    }

    storageSet('cart', cart);
    updateCartCount();

    if (window.location.pathname.includes('carrinho.html')) {
        renderCart();
        updateCartTotals();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    storageSet('cart', cart);
    updateCartCount();
    toastLocal('Produto removido do carrinho', 'info');

    if (window.location.pathname.includes('carrinho.html')) {
        renderCart();
        updateCartTotals();
    }
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);

    if (item) {
        item.quantity += change;

        if (item.quantity < 1) {
            removeFromCart(productId);
            return;
        } else if (item.quantity > 10) {
            toastLocal('Quantidade maxima: 10 unidades', 'warning');
            item.quantity = 10;
        }

        storageSet('cart', cart);
        updateCartCount();

        if (window.location.pathname.includes('carrinho.html')) {
            renderCart();
            updateCartTotals();
        }
    }
}

function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const envio = subtotal >= 50 ? 0 : 5.99;

    const appliedCoupon = storageGet('appliedCoupon');
    const couponDiscounts = {
        BEAST10: 0.10,
        BEAST20: 0.20,
        WELCOME: 0.15
    };
    const discountRate = appliedCoupon && couponDiscounts[appliedCoupon] ? couponDiscounts[appliedCoupon] : 0;
    const desconto = subtotal * discountRate;
    const total = subtotal - desconto + envio;

    const subtotalEl = document.getElementById('subtotal');
    const envioEl = document.getElementById('envio');
    const totalEl = document.getElementById('total');
    const itemsCountEl = document.getElementById('cart-items-count');
    const descontoRow = document.getElementById('desconto-row');
    const descontoEl = document.getElementById('desconto');

    if (subtotalEl) subtotalEl.textContent = formatPriceLocal(subtotal);
    if (envioEl) {
        envioEl.textContent = envio === 0 ? 'Gratis' : formatPriceLocal(envio);
    }
    if (totalEl) totalEl.textContent = formatPriceLocal(total);
    if (itemsCountEl) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        itemsCountEl.textContent = totalItems;
    }

    if (descontoRow && descontoEl) {
        if (desconto > 0) {
            descontoRow.style.display = 'flex';
            descontoEl.textContent = `- ${formatPriceLocal(desconto)}`;
        } else {
            descontoRow.style.display = 'none';
        }
    }

    const descontoInfo = document.querySelector('.desconto-info span');
    if (descontoInfo && subtotal < 50) {
        const falta = 50 - subtotal;
        descontoInfo.innerHTML = `Faltam <strong>${formatPriceLocal(falta)}</strong> para portes gratis!`;
    } else if (descontoInfo) {
        descontoInfo.innerHTML = `<strong>Portes gratis!</strong>`;
    }
}

function applyCoupon() {
    const cupaoInput = document.getElementById('cupao-code');
    const cupao = cupaoInput.value.trim().toUpperCase();

    const cuponsValidos = {
        BEAST10: 0.10,
        BEAST20: 0.20,
        WELCOME: 0.15
    };

    if (cuponsValidos[cupao]) {
        const desconto = cuponsValidos[cupao];
        toastLocal(`Cupao aplicado! ${desconto * 100}% de desconto`, 'success');
        storageSet('appliedCoupon', cupao);
        updateCartTotals();
    } else if (cupao) {
        toastLocal('Cupao invalido', 'error');
    } else {
        toastLocal('Por favor, insere um codigo', 'warning');
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    container.innerHTML = '';

    if (!cart || cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">O teu carrinho esta vazio.</p>';
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const row = document.createElement('div');
        row.className = 'carrinho-item';
        row.innerHTML = `
            <img src="../../images/products/${item.id}.jpg" alt="${item.name}">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p class="item-details">Quantidade: ${item.quantity}</p>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remover</button>
            </div>
            <div class="item-quantity">
                <button onclick="updateQuantity('${item.id}', -1)">-</button>
                <input type="number" value="${item.quantity}" min="1" max="10" readonly>
                <button onclick="updateQuantity('${item.id}', 1)">+</button>
            </div>
            <div class="item-price">
                <span class="price">${formatPriceLocal(itemTotal)}</span>
                <small class="price-unit">(${formatPriceLocal(item.price)} cada)</small>
            </div>
        `;
        container.appendChild(row);
    });
}

const categoryButtons = document.querySelectorAll('.category-btn');
if (categoryButtons.length) {
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const category = this.getAttribute('data-category');
            document.querySelectorAll('.produto-card').forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

const sortSelect = document.getElementById('sort-select');
if (sortSelect) {
    sortSelect.addEventListener('change', function() {
        const sortBy = this.value;
        const productGrid = document.querySelector('.produtos-grid');
        const products = Array.from(productGrid.querySelectorAll('.produto-card'));

        products.sort((a, b) => {
            const priceA = parseFloat(a.getAttribute('data-price'));
            const priceB = parseFloat(b.getAttribute('data-price'));

            switch (sortBy) {
                case 'preco-asc':
                    return priceA - priceB;
                case 'preco-desc':
                    return priceB - priceA;
                case 'popular':
                    return Math.random() - 0.5;
                default:
                    return 0;
            }
        });

        products.forEach(product => productGrid.appendChild(product));
    });
}

document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    renderCart();

    if (window.location.pathname.includes('carrinho.html')) {
        updateCartTotals();
    }
});

