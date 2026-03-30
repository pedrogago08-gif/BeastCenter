// Script de autenticacao (Login e Registo)

if (typeof validateEmail !== "function") {
    function validateEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

if (typeof showToast !== "function") {
    function showToast(message) {
        alert(message);
    }
}

var ADMIN_REVEAL_STORAGE_KEY = "beastcenter_admin_panel_visible";
var ADMIN_CLICK_THRESHOLD = 5;
var adminRevealClicks = 0;

function setCurrentUser(payload) {
    localStorage.setItem("currentUser", JSON.stringify(payload));
}

function showAdminLogin() {
    var panel = document.getElementById("admin-secret-panel");
    var form = document.getElementById("login-form");

    if (panel) {
        panel.hidden = false;
    }

    if (form) {
        form.style.display = "none";
    }

    sessionStorage.setItem(ADMIN_REVEAL_STORAGE_KEY, "1");
}

function hideAdminLogin() {
    var panel = document.getElementById("admin-secret-panel");
    var form = document.getElementById("login-form");

    if (panel) {
        panel.hidden = true;
    }

    if (form) {
        form.style.display = "block";
    }

    sessionStorage.removeItem(ADMIN_REVEAL_STORAGE_KEY);
}

function setupAdminReveal() {
    var trigger = document.getElementById("admin-secret-trigger");
    var params = new URLSearchParams(window.location.search);
    var shouldReveal = params.get("admin") === "1" || sessionStorage.getItem(ADMIN_REVEAL_STORAGE_KEY) === "1";

    if (shouldReveal) {
        showAdminLogin();
    }

    if (!trigger) {
        return;
    }

    function registerRevealAttempt() {
        adminRevealClicks += 1;
        if (adminRevealClicks >= ADMIN_CLICK_THRESHOLD) {
            adminRevealClicks = 0;
            showAdminLogin();
            showToast("Modo administrativo desbloqueado.", "success");
        }
    }

    trigger.addEventListener("click", registerRevealAttempt);
    trigger.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            registerRevealAttempt();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
            event.preventDefault();
            showAdminLogin();
        }
    });
}

function switchToRegister() {
    document.getElementById("login-box").style.display = "none";
    document.getElementById("register-box").style.display = "block";
}

function switchToLogin() {
    document.getElementById("register-box").style.display = "none";
    document.getElementById("login-box").style.display = "block";
}

async function handleAdminLogin(event) {
    event.preventDefault();

    var usernameField = document.getElementById("admin-username");
    var passwordField = document.getElementById("admin-password");
    var username = (usernameField.value || "").trim().toLowerCase();
    var password = passwordField.value || "";

    if (!username || password.length < 6) {
        showToast("Introduz utilizador e password validos.", "error");
        return false;
    }

    try {
        var response = await window.BeastCenterApi.adminLogin({
            username: username,
            password: password
        });

        setCurrentUser(response.user);
        showToast("Login admin realizado com sucesso!", "success");
        setTimeout(function () {
            window.location.href = "admin/dashboard.html";
        }, 700);
    } catch (error) {
        showToast(error.message || "Falha no login admin.", "error");
    }

    return false;
}

async function handleLogin(event) {
    event.preventDefault();

    var email = document.getElementById("login-email").value;
    var password = document.getElementById("login-password").value;

    if (!validateEmail(email)) {
        showToast("Por favor, insere um email valido", "error");
        return false;
    }

    if (password.length < 6) {
        showToast("Password deve ter pelo menos 6 caracteres", "error");
        return false;
    }

    try {
        var response = await window.BeastCenterApi.login({
            email: email,
            password: password
        });

        setCurrentUser(response.user);
        showToast("Login realizado com sucesso!", "success");
        setTimeout(function () {
            window.location.href = response.user.role === "admin" ? "admin/dashboard.html" : "Index.html";
        }, 800);
    } catch (error) {
        showToast(error.message || "Email ou password incorretos", "error");
    }

    return false;
}

async function handleRegister(event) {
    event.preventDefault();

    var name = document.getElementById("register-name").value;
    var email = document.getElementById("register-email").value;
    var phone = document.getElementById("register-phone").value;
    var password = document.getElementById("register-password").value;
    var confirmPassword = document.getElementById("register-confirm-password").value;

    if (!name || name.length < 3) {
        showToast("Nome deve ter pelo menos 3 caracteres", "error");
        return false;
    }

    if (!validateEmail(email)) {
        showToast("Por favor, insere um email valido", "error");
        return false;
    }

    if (!phone || phone.replace(/\D/g, "").length < 9) {
        showToast("Introduz um numero de telemovel valido", "error");
        return false;
    }

    if (password.length < 8) {
        showToast("Password deve ter pelo menos 8 caracteres", "error");
        return false;
    }

    if (password !== confirmPassword) {
        showToast("As passwords nao coincidem", "error");
        return false;
    }

    try {
        await window.BeastCenterApi.register({
            name: name,
            email: email,
            phone: phone,
            password: password,
        });

        showToast("Conta criada com sucesso! Agora ja podes entrar e depois escolher um plano.", "success");
        setTimeout(function () {
            window.location.href = "Index.html";
        }, 700);
    } catch (error) {
        showToast(error.message || "Falha ao criar conta", "error");
    }

    return false;
}

document.getElementById("register-password")?.addEventListener("input", function (event) {
    var password = event.target.value;
    var hint = document.querySelector(".password-hint");

    if (!hint) {
        return;
    }

    if (password.length === 0) {
        hint.textContent = "Usa pelo menos 8 caracteres com letras e numeros";
        hint.className = "password-hint";
    } else if (password.length < 8) {
        hint.textContent = "Password fraca - adiciona mais caracteres";
        hint.className = "password-hint weak";
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        hint.textContent = "Password media - adiciona letras e numeros";
        hint.className = "password-hint medium";
    } else {
        hint.textContent = "Password forte!";
        hint.className = "password-hint strong";
    }
});

setupAdminReveal();
