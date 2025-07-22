// ===================================================================================
// Lógica da Página de Registro
// ===================================================================================
// Este script gerencia o formulário e o processo de registro de um novo usuário.
// Assim como login.js, este arquivo é autônomo para funcionar independentemente.
//
// NOTA DE ARQUITETURA:
// O nome da pasta ('admin/register') sugere que esta página seria para registrar
// administradores, mas a lógica implementada (`status: 'free'`) é para um
// registro de usuário padrão. Se o objetivo for um registro público, seria
// melhor mover este arquivo para uma pasta como `auth/register/`. Se for para
// administradores, a lógica deveria atribuir um status de 'admin'.
// ===================================================================================


// -----------------------------------------------------------------------------------
// Seção: Configuração do Firebase e Elementos da UI
// -----------------------------------------------------------------------------------
// Configuração do Firebase (duplicada para autonomia da página).
const firebaseConfig = {
  apiKey: "AIzaSyCAjJGwKaYi6cJNrmGcdnKgO-jHYGivv0E",
  authDomain: "smemoria-bfaed.firebaseapp.com",
  projectId: "smemoria-bfaed",
  storageBucket: "smemoria-bfaed.firebasestorage.app",
  messagingSenderId: "728874899156",
  appId: "1:728874899156:web:81744aa120a926ff5ccd41"
};

// Inicialização do Firebase.
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Mapeamento dos elementos do formulário de registro.
const registerNameInput = document.getElementById('registerName');
const registerEmailInput = document.getElementById('registerEmail');
const registerPasswordInput = document.getElementById('registerPassword');
const registerCPFInput = document.getElementById('registerCPF');
const registerDOBInput = document.getElementById('registerDOB');
const registerCityInput = document.getElementById('registerCity');
const registerStateInput = document.getElementById('registerState');
const registerButton = document.getElementById('registerButton');
const openPremiumModalButton = document.getElementById('openPremiumModalButton');

// Adiciona os listeners de clique aos botões principais.
registerButton.addEventListener('click', register);
openPremiumModalButton.addEventListener('click', openPremiumUpgradeModal);


// -----------------------------------------------------------------------------------
// Seção: Lógica do Modal Premium (Duplicada)
// -----------------------------------------------------------------------------------
// Esta seção é uma cópia da lógica do modal encontrada em outros scripts.
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

if (premiumUpgradeModalOverlay) {
  premiumUpgradeModalOverlay.addEventListener('click', function(event) {
    if (event.target === premiumUpgradeModalOverlay) {
      closePremiumUpgradeModal();
    }
  });
  const closeBtn = premiumUpgradeModalOverlay.querySelector('.modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePremiumUpgradeModal);
  }
  const cancelBtnGroup = document.getElementById('closeModalButton');
  if (cancelBtnGroup) {
    cancelBtnGroup.addEventListener('click', closePremiumUpgradeModal);
  }
  const premiumPurchaseButton = document.getElementById('premiumPurchaseButton');
  if (premiumPurchaseButton) {
    premiumPurchaseButton.addEventListener('click', handlePremiumPurchase);
  }
}

function handlePremiumPurchase() {
  console.log('Botão "Quero ser Premium!" clicado na página de registro.');
  if (premiumPurchaseInfo) {
    premiumPurchaseInfo.textContent = 'Agradecemos o seu interesse! A funcionalidade de pagamento será implementada em breve.';
    premiumPurchaseInfo.style.display = 'block';
  }
}


// -----------------------------------------------------------------------------------
// Seção: Função Principal de Registro
// -----------------------------------------------------------------------------------

/**
 * @function register
 * @description Coleta os dados do formulário, valida-os e cria um novo usuário
 * no Firebase Authentication e um documento correspondente no Firestore.
 */
function register() {
  console.log("Iniciando processo de registro a partir de register.js");

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
          window.location.href = '../../auth/login.html';
        }).catch(error => {
          // Tratamento de erro caso a escrita no Firestore falhe.
          // O usuário foi criado no Auth, mas seus dados não foram salvos.
          // Isso pode deixar a conta em um estado inconsistente.
          console.error('Erro DETALHADO ao criar documento do usuário no Firestore:', error.code, error.message, error.stack);
          alert('Sua conta foi criada, mas houve um problema ao salvar seus dados. Por favor, tente fazer o login.');
          window.location.href = '../../auth/login.html';
        });
      } else {
        // Cenário de erro inesperado.
        alert('Erro inesperado durante o registro. Tente novamente.');
        window.location.href = 'register.html';
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


// -----------------------------------------------------------------------------------
// Seção: Funções Utilitárias e Listeners
// -----------------------------------------------------------------------------------

/**
 * @function mapFirebaseAuthError
 * @description Mapeia códigos de erro do Firebase Auth para mensagens amigáveis.
 * @param {string} errorCode - O código de erro retornado pelo Firebase.
 * @returns {string} A mensagem de erro amigável.
 */
function mapFirebaseAuthError(errorCode) {
  const errorMessages = {
    'auth/invalid-email': 'Formato de e-mail inválido.',
    'auth/user-disabled': 'Este usuário foi desabilitado.',
    'auth/email-already-in-use': 'Este e-mail já está em uso por outra conta.',
    'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
    'auth/operation-not-allowed': 'Operação não permitida (verifique as configurações do Firebase).',
    'auth/invalid-credential': 'Credenciais inválidas.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.'
  };
  return errorMessages[errorCode] || 'Ocorreu um erro desconhecido. Tente novamente.';
}

/**
 * @listens auth#onAuthStateChanged
 * @description Se um usuário já logado acessar a página de registro, ele é
 * redirecionado para a página principal da aplicação.
 */
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('Usuário já está logado, redirecionando para a página principal desde register.js');
    window.location.href = '../../index.html';
  } else {
    // Garante que a tela de registro esteja visível.
    const registerScreenDiv = document.getElementById('registerScreen');
    if (registerScreenDiv && !registerScreenDiv.classList.contains('active')) {
      registerScreenDiv.classList.add('active');
    }
  }
});
