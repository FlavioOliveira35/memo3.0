// Manter a configuração e inicialização do Firebase no topo para garantir que execute primeiro.
const firebaseConfig = {
    apiKey: "AIzaSyCAjJGwKaYi6cJNrmGcdnKgO-jHYGivv0E",
    authDomain: "smemoria-bfaed.firebaseapp.com",
    projectId: "smemoria-bfaed",
    storageBucket: "smemoria-bfaed.firebasestorage.app",
    messagingSenderId: "728874899156",
    appId: "1:728874899156:web:81744aa120a926ff5ccd41"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// O resto do código original é executado após o DOM estar pronto.
document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica dos Modais ---
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const closeLoginBtn = loginModal.querySelector('.close-btn');
    const closeRegisterBtn = registerModal.querySelector('.close-btn');
    const showRegisterLink = document.getElementById('show-register-modal');
    const showLoginLink = document.getElementById('show-login-modal');

    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });

    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'flex';
    });

    closeLoginBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    closeRegisterBtn.addEventListener('click', () => {
        registerModal.style.display = 'none';
    });

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'flex';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'flex';
    });

    window.addEventListener('click', (event) => {
        if (event.target == loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target == registerModal) {
            registerModal.style.display = 'none';
        }
    });

    // --- Lógica do Modal Premium (Mantida) ---
    const premiumUpgradeModalOverlay = document.getElementById('premiumUpgradeModalOverlay');
    const premiumPurchaseInfo = document.getElementById('premiumPurchaseInfo');

    const openPremiumModalBtn = document.querySelector('.premium-cta-button');
    if(openPremiumModalBtn) {
        openPremiumModalBtn.addEventListener('click', openPremiumUpgradeModal);
    }
    const openPremiumModalButtonRegister = document.getElementById('openPremiumModalButton');
    if(openPremiumModalButtonRegister) {
        openPremiumModalButtonRegister.addEventListener('click', openPremiumUpgradeModal);
    }


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

    if (premiumUpgradeModalOverlay) {
        const closeBtn = premiumUpgradeModalOverlay.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closePremiumUpgradeModal);
        }
        const cancelBtnGroup = premiumUpgradeModalOverlay.querySelector('.cancel-btn');
        if (cancelBtnGroup) {
            cancelBtnGroup.addEventListener('click', closePremiumUpgradeModal);
        }
    }
});


// --- Funções de Autenticação (Mantidas no escopo global para o `onclick`) ---

const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginButton = document.getElementById('login-action-btn');

const registerNameInput = document.getElementById('registerName');
const registerEmailInput = document.getElementById('registerEmail');
const registerPasswordInput = document.getElementById('registerPassword');
const registerCPFInput = document.getElementById('registerCPF');
const registerDOBInput = document.getElementById('registerDOB');
const registerCityInput = document.getElementById('registerCity');
const registerStateInput = document.getElementById('registerState');
const registerButton = document.getElementById('registerButton');

if (registerButton) {
    registerButton.addEventListener('click', register);
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
 * @function register
 * @description Coleta os dados do formulário, valida-os e cria um novo usuário
 * no Firebase Authentication e um documento correspondente no Firestore.
 */
function register() {
  console.log("Iniciando processo de registro a partir de login.js");

  // Coleta e limpa os dados dos inputs.
  const name = registerNameInput.value.trim();
  const email = registerEmailInput.value.trim();
  const password = registerPasswordInput.value;
  const cpf = registerCPFInput.value.trim();
  const dob = registerDOBInput.value;
  const city = registerCityInput.value.trim();
  const state = registerStateInput.value.trim();

  // Validações de entrada.
  if (!name || !email || !password || !cpf || !dob || !city || !state) {
    alert("Por favor, preencha todos os campos para registrar.");
    return;
  }
  if (password.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres.");
    return;
  }
  // Validação simples de CPF. Para produção, uma validação mais robusta
  // (que verifica os dígitos verificadores) seria recomendada.
  if (cpf.replace(/\D/g, '').length !== 11) {
    alert("Por favor, insira um CPF válido com 11 dígitos.");
    return;
  }

  // Feedback visual para o usuário.
  const originalText = registerButton.innerHTML;
  registerButton.innerHTML = '<div class="loading"></div> Cadastrando...';
  registerButton.disabled = true;

  // Cria o usuário no serviço de Autenticação do Firebase.
  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log("Registro no Firebase Auth realizado com sucesso:", userCredential.user);
      const user = userCredential.user;
      if (user) {
        // Após criar o usuário no Auth, cria um documento no Firestore
        // para armazenar informações adicionais.
        db.collection('users').doc(user.uid).set({
          uid: user.uid,
          name: name,
          email: email,
          cpf: cpf,
          dateOfBirth: dob,
          city: city,
          state: state,
          status: 'free', // Novos usuários começam como 'free'.
          accountStatus: 'active', // 'active' ou 'blocked'.
          bonusNotes: 0,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          totalLogins: 1, // O registro conta como o primeiro login.
          lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          console.log('Documento do usuário criado no Firestore com todos os dados.');
          // Redireciona para a página de login para que o usuário possa entrar.
          alert('Cadastro realizado com sucesso! Faça o login para continuar.');
          window.location.href = 'login.html';
        }).catch(error => {
          // Tratamento de erro caso a escrita no Firestore falhe.
          // O usuário foi criado no Auth, mas seus dados não foram salvos.
          // Isso pode deixar a conta em um estado inconsistente.
          console.error('Erro DETALHADO ao criar documento do usuário no Firestore:', error.code, error.message, error.stack);
          alert('Sua conta foi criada, mas houve um problema ao salvar seus dados. Por favor, tente fazer o login.');
          window.location.href = 'login.html';
        });
      } else {
        // Cenário de erro inesperado.
        alert('Erro inesperado durante o registro. Tente novamente.');
        window.location.href = 'login.html';
      }
    })
    .catch(error => {
      console.error("Erro no registro:", error);
      alert("Erro ao registrar: " + mapFirebaseAuthError(error.code));
    })
    .finally(() => {
      // Restaura o botão de registro.
      registerButton.innerHTML = originalText;
      registerButton.disabled = false;
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
        'auth/too-many-requests': 'Muitas tentativas de login falharam. Por favor, tente novamente mais tarde.',
        'auth/email-already-in-use': 'Este e-mail já está em uso por outra conta.',
        'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
        'auth/operation-not-allowed': 'Operação não permitida (verifique as configurações do Firebase).'
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
