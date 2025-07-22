// ===================================================================================
// Lógica da Página de Login
// ===================================================================================
// Este script gerencia todas as interações na página de login (login.html).
// Ele é autônomo, o que significa que contém sua própria inicialização do Firebase
// e funções utilitárias para não depender de outros scripts da aplicação principal.
//
// SUGESTÃO DE REATORAÇÃO:
// A duplicação da `firebaseConfig` e de funções como `mapFirebaseAuthError`
// aumenta a chance de inconsistências. O ideal seria ter um único `firebase-config.js`
// e um `utils.js` que pudessem ser importados como módulos (`<script type="module">`)
// tanto em `index.html` quanto em `login.html`, centralizando a lógica comum.
// ===================================================================================


// -----------------------------------------------------------------------------------
// Seção: Configuração do Firebase
// -----------------------------------------------------------------------------------
// Configuração do Firebase (copiada para autonomia da página).
const firebaseConfig = {
    apiKey: "AIzaSyCAjJGwKaYi6cJNrmGcdnKgO-jHYGivv0E",
    authDomain: "smemoria-bfaed.firebaseapp.com",
    projectId: "smemoria-bfaed",
    storageBucket: "smemoria-bfaed.firebasestorage.app",
    messagingSenderId: "728874899156",
    appId: "1:728874899156:web:81744aa120a926ff5ccd41"
};

// Inicialização do Firebase e seus serviços.
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


// -----------------------------------------------------------------------------------
// Seção: Elementos da UI e Lógica de Modais
// -----------------------------------------------------------------------------------
// Seleção dos elementos do DOM necessários para a página de login.
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginButton = document.querySelector('#loginScreen button[onclick="login()"]');

// Lógica do Modal de Upgrade Premium (copiada para autonomia).
// NOTA: Esta lógica também está duplicada. Se o modal for idêntico ao da
// aplicação principal, ele deveria ser um componente reutilizável.
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
    premiumUpgradeModalOverlay.addEventListener('click', function(event) {
        if (event.target === premiumUpgradealOverlay) {
            closePremiumUpgradeModal();
        }
    });
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
    console.log('Botão "Quero ser Premium!" clicado na página de login.');
    if (premiumPurchaseInfo) {
        premiumPurchaseInfo.textContent = 'Agradecemos o seu interesse! A funcionalidade de pagamento será implementada em breve.';
        premiumPurchaseInfo.style.display = 'block';
    }
    // No futuro, aqui seria o local para integrar com um gateway de pagamento.
}


// -----------------------------------------------------------------------------------
// Seção: Lógica de Autenticação
// -----------------------------------------------------------------------------------

/**
 * @function login
 * @description Executa a tentativa de login do usuário com e-mail e senha.
 * Fornece feedback visual durante o processo e trata os erros.
 */
function login() {
    console.log("Iniciando processo de login a partir de login.js");

    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    if (!email || !password) {
        alert("Por favor, preencha e-mail e senha.");
        return;
    }

    // Desabilita o botão e mostra um indicador de carregamento para evitar cliques duplos.
    const originalText = loginButton.innerHTML;
    loginButton.innerHTML = '<div class="loading"></div> Entrando...';
    loginButton.disabled = true;

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log("Login realizado com sucesso, redirecionando para o app...");
            const user = userCredential.user;
            if (user) {
                const userId = user.uid;
                const userDocRef = db.collection('users').doc(userId);

                // Atualiza o contador de logins e a data do último login.
                // Esta operação é "dispare e esqueça" (fire and forget), não bloqueia
                // o redirecionamento do usuário.
                userDocRef.update({
                    totalLogins: firebase.firestore.FieldValue.increment(1),
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(error => {
                    // Fallback: se o `update` falhar (ex: documento não existe, o que é improvável
                    // aqui, mas é uma boa prática), tenta um `set` com `merge: true`.
                    console.warn("Falha ao incrementar totalLogins com update(). Tentando com set({merge: true}).", error);
                    userDocRef.set({
                        totalLogins: firebase.firestore.FieldValue.increment(1),
                        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true })
                    .catch(err => {
                        console.error("Erro ao definir/incrementar totalLogins com set({merge:true}):", err);
                    });
                });
            }
            // Redireciona para a página principal da aplicação após o sucesso.
            window.location.href = '../index.html';
        })
        .catch(error => {
            console.error("Erro no login:", error);
            // Usa uma função para traduzir o código de erro do Firebase em uma mensagem amigável.
            alert("Erro ao fazer login: " + mapFirebaseAuthError(error.code));
        })
        .finally(() => {
            // Garante que o botão de login seja reativado e o texto restaurado,
            // independentemente de o login ter sucesso ou falhar.
            loginButton.innerHTML = originalText;
            loginButton.disabled = false;
        });
}

/**
 * @function mapFirebaseAuthError
 * @description Mapeia códigos de erro do Firebase Auth para mensagens em português.
 * @param {string} errorCode - O código de erro retornado pelo Firebase.
 * @returns {string} A mensagem de erro amigável para o usuário.
 */
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

/**
 * @listens auth#onAuthStateChanged
 * @description Observador de estado de autenticação.
 * Se o usuário já estiver logado ao visitar a página de login (ex: abriu em uma
 * nova aba), ele é automaticamente redirecionado para a aplicação principal.
 */
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('Usuário já está logado, redirecionando para index.html desde login.js');
        window.location.href = '../index.html';
    } else {
        // Usuário não está logado, então ele deve permanecer na página de login.
        // O código abaixo garante que a tela de login esteja visível.
        const loginScreenDiv = document.getElementById('loginScreen');
        if (loginScreenDiv && !loginScreenDiv.classList.contains('active')) {
            loginScreenDiv.classList.add('active');
        }
    }
});
