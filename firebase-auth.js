import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAC4g13dQqwWB3hrtjU6a1dAP91FviHHMI",
  authDomain: "connexion-mitantsoa-angence.firebaseapp.com",
  projectId: "connexion-mitantsoa-angence",
  storageBucket: "connexion-mitantsoa-angence.firebasestorage.app",
  messagingSenderId: "857962704410",
  appId: "1:857962704410:web:984c9936b3f22742fc6ba3",
  measurementId: "G-G6L1RCZPRG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const rememberSession = document.getElementById("remember-session");
const loginMessage = document.getElementById("login-message");
const googleLoginButton = document.getElementById("google-login");
const forgotPasswordButton = document.getElementById("forgot-password-button");

function showMessage(text, type = "error") {
  loginMessage.textContent = text;
  loginMessage.className = `login-message ${type}`;
}

const boutonReinitialisation =
  document.getElementById("mot-de-passe-oublie");

const messageReinitialisation =
  document.getElementById("message-reinitialisation");

const champEmail = document.getElementById("email");

if (
  boutonReinitialisation &&
  messageReinitialisation &&
  champEmail
) {
  boutonReinitialisation.addEventListener("click", async () => {
    const email = champEmail.value.trim();

    if (!email || !champEmail.checkValidity()) {
      messageReinitialisation.textContent =
        "Saisissez une adresse e-mail valide dans le champ ci-dessus.";

      champEmail.focus();
      champEmail.reportValidity();
      return;
    }

    boutonReinitialisation.disabled = true;
    messageReinitialisation.textContent = "Traitement en cours…";

    const messageNeutre =
      "Si un compte correspond à cette adresse, vous recevrez un e-mail " +
      "pour réinitialiser votre mot de passe. " +
      "Pensez à vérifier vos courriers indésirables.";

    try {
      auth.languageCode = "fr";

      await sendPasswordResetEmail(auth, email);

      messageReinitialisation.textContent = messageNeutre;

    } catch (erreur) {
      if (erreur.code === "auth/user-not-found") {
        messageReinitialisation.textContent = messageNeutre;

      } else if (erreur.code === "auth/too-many-requests") {
        messageReinitialisation.textContent =
          "Trop de tentatives. Veuillez patienter avant de réessayer.";

      } else {
        messageReinitialisation.textContent =
          "Impossible de traiter la demande pour le moment. " +
          "Veuillez réessayer plus tard.";
      }

    } finally {
      boutonReinitialisation.disabled = false;
    }
  });
}

function getFriendlyError(errorCode) {
  const messages = {
    "auth/invalid-email": "L’adresse e-mail saisie n’est pas valide.",
    "auth/missing-password": "Veuillez saisir votre mot de passe.",
    "auth/user-disabled": "Ce compte est actuellement désactivé.",
    "auth/too-many-requests":
      "Trop de tentatives. Veuillez patienter avant de réessayer.",
    "auth/network-request-failed":
      "Impossible de vous connecter. Vérifiez votre connexion Internet.",
    "auth/popup-closed-by-user":
      "La fenêtre Google a été fermée avant la fin de la connexion.",
    "auth/popup-blocked":
      "Votre navigateur a bloqué la fenêtre de connexion Google."
  };

  return messages[errorCode] ||
    "Connexion impossible. Vérifiez votre adresse e-mail et votre mot de passe.";
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Utilisateur connecté :", user.email);
  } else {
    console.log("Utilisateur non connecté.");
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Veuillez compléter votre adresse e-mail et votre mot de passe.");
    return;
  }

  const persistence = rememberSession.checked
    ? browserLocalPersistence
    : browserSessionPersistence;

  try {
    showMessage("Connexion en cours…", "info");

    await setPersistence(auth, persistence);

    await signInWithEmailAndPassword(auth, email, password);

    showMessage("Connexion réussie. Redirection…", "success");

    window.location.href = "mon-espace.html";
  } catch (error) {
    console.error("Erreur de connexion Firebase :", error.code, error.message);
    showMessage(getFriendlyError(error.code));
  }
});

googleLoginButton.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();

  try {
    showMessage("Ouverture de la connexion Google…", "info");

    await signInWithPopup(auth, provider);

    window.location.href = "mon-espace.html";
  } catch (error) {
    console.error("Erreur de connexion Google :", error.code, error.message);
    showMessage(getFriendlyError(error.code));
  }
});

forgotPasswordButton.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  if (!email) {
    showMessage(
      "Saisissez votre adresse e-mail, puis cliquez à nouveau sur « Mot de passe oublié ? »."
    );
    emailInput.focus();
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);

    showMessage(
      "Si cette adresse correspond à un compte, un e-mail de réinitialisation a été envoyé.",
      "success"
    );
  } catch (error) {
    console.error(
      "Erreur de réinitialisation Firebase :",
      error.code,
      error.message
    );

    showMessage(
      "La demande n’a pas pu être envoyée. Vérifiez l’adresse saisie et réessayez."
    );
  }
});
