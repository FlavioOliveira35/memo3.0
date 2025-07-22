// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCAjJGwKaYi6cJNrmGcdnKgO-jHYGivv0E",
    authDomain: "smemoria-bfaed.firebaseapp.com",
    projectId: "smemoria-bfaed",
    storageBucket: "smemoria-bfaed.firebasestorage.app",
    messagingSenderId: "728874899156",
    appId: "1:728874899156:web:81744aa120a926ff5ccd41"
};

// Inicialização do Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();


document.addEventListener('DOMContentLoaded', () => {
    // --- Modal Control ---
    const loginModal = document.getElementById('login-modal');
    const loginBtn = document.getElementById('login-btn');
    const closeBtn = loginModal.querySelector('.close-btn');
    const loginActionBtn = document.getElementById('login-action-btn');

    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // --- Firebase Actions ---
    if (loginActionBtn) {
        loginActionBtn.addEventListener('click', login);
    }
});

// Seleção dos elementos do DOM necessários para a página de login.
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginButton = document.getElementById('login-action-btn'); // Corrigido para o novo botão

// Lógica do Modal de Upgrade Premium
const premiumUpgradeModalOverlay = document.getElementById('premiumUpgradeModalOverlay');
const premiumPurchaseInfo = document.getElementById('premiumPurchaseInfo');

function openPremiumUpgradeModal() {
    if (premiumUpgradeModalOverlay) {
        premiumUpgradeModalOverlay.style.display = 'flex';
        if (premiumPurchaseInfo) premiumPurchaseInfo.style.display = 'none';
    }
}

function closePremiumUpgradeModal() {
    if (premiumUpgradeModalOverlay) {
        premiumUpgradeModalOverlay.style.display = 'none';
    }
}

// Listeners para fechar o modal.
if (premiumUpgradeModalOverlay) {
    const closeBtn = premiumUpgradeModalOverlay.querySelector('.modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePremiumUpgradeModal);
    }
    const cancelBtnGroup = premiumUpgradeModalOverlay.querySelector('.modal-button-group .cancel-btn');
    if (cancelBtnGroup) {
        cancelBtnGroup.addEventListener('click', closePremiumUpgradeModal);
    }
}

// Manipulador para o clique no botão de compra do plano premium.
function handlePremiumPurchase() {
    if (premiumPurchaseInfo) {
        premiumPurchaseInfo.textContent = 'Agradecemos o seu interesse! A funcionalidade de pagamento será implementada em breve.';
        premiumPurchaseInfo.style.display = 'block';
    }
}

// Função de login original, agora chamada pelo botão no modal
function login() {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    if (!email || !password) {
        alert("Por favor, preencha e-mail e senha.");
        return;
    }

    const originalText = loginButton.innerHTML;
    loginButton.innerHTML = '<div class="loading"></div> Entrando...';
    loginButton.disabled = true;

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            if (user) {
                const userDocRef = db.collection('users').doc(user.uid);
                userDocRef.update({
                    totalLogins: firebase.firestore.FieldValue.increment(1),
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(error => {
                    console.warn("Falha ao atualizar dados de login:", error);
                    userDocRef.set({
                        totalLogins: firebase.firestore.FieldValue.increment(1),
                        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                });
            }
            window.location.href = '../index.html';
        })
        .catch(error => {
            alert("Erro ao fazer login: " + mapFirebaseAuthError(error.code));
        })
        .finally(() => {
            loginButton.innerHTML = originalText;
            loginButton.disabled = false;
        });
}

function mapFirebaseAuthError(errorCode) {
    const errorMessages = {
        'auth/invalid-email': 'Formato de e-mail inválido.',
        'auth/user-disabled': 'Este usuário foi desabilitado.',
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/invalid-credential': 'Credenciais inválidas. Verifique e-mail e senha.',
        'auth/too-many-requests': 'Muitas tentativas de login falharam. Por favor, tente novamente mais tarde.'
    };
    return errorMessages[errorCode] || 'Ocorreu um erro desconhecido. Tente novamente.';
}

// Observador de estado de autenticação
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('Usuário já está logado, redirecionando para index.html');
        window.location.href = '../index.html';
    }
});
