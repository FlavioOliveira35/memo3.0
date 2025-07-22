document.addEventListener('DOMContentLoaded', () => {
    // Modal elements
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');

    // Buttons to open modals
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');

    // Close buttons
    const closeBtns = document.querySelectorAll('.close-btn');

    // Links to switch between modals
    const showRegisterModalLink = document.getElementById('show-register-modal');
    const showLoginModalLink = document.getElementById('show-login-modal');

    // Action buttons in modals
    const loginActionBtn = document.getElementById('login-action-btn');
    const registerActionBtn = document.getElementById('register-action-btn');

    // --- Modal Control ---

    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });

    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'flex';
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target == loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target == registerModal) {
            registerModal.style.display = 'none';
        }
    });

    showRegisterModalLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'flex';
    });

    showLoginModalLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'flex';
    });

    // --- Firebase Actions ---

    loginActionBtn.addEventListener('click', () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const originalContent = loginActionBtn.innerHTML;
        loginActionBtn.innerHTML = 'Conectando...';
        loginActionBtn.disabled = true;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                window.location.href = '../index.html';
            })
            .catch((error) => {
                alert('Erro de login: ' + error.message);
                loginActionBtn.innerHTML = originalContent;
                loginActionBtn.disabled = false;
            });
    });

    registerActionBtn.addEventListener('click', () => {
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert("As senhas não coincidem.");
            return;
        }

        const originalContent = registerActionBtn.innerHTML;
        registerActionBtn.innerHTML = 'Criando...';
        registerActionBtn.disabled = true;

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                alert('Conta criada com sucesso! Faça o login.');
                registerModal.style.display = 'none';
                loginModal.style.display = 'flex';
            })
            .catch((error) => {
                alert('Erro de cadastro: ' + error.message);
            })
            .finally(() => {
                registerActionBtn.innerHTML = originalContent;
                registerActionBtn.disabled = false;
            });
    });
});
