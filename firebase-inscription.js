import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification
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

const form = document.getElementById("register-form");
const emailInput = document.getElementById("register-email");
const passwordInput = document.getElementById("register-password");
const confirmPasswordInput = document.getElementById(
  "register-password-confirm"
);
const message = document.getElementById("register-message");

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `login-message ${type}`;
}

function getFriendlyError(errorCode) {
  const messages = {
    "auth/email-already-in-use":
      "Cette adresse e-mail est déjà associée à un compte.",
    "auth/invalid-email":
      "L’adresse e-mail saisie n’est pas valide.",
    "auth/weak-password":
      "Choisissez un mot de passe plus robuste.",
    "auth/network-request-failed":
      "Impossible de créer le compte. Vérifiez votre connexion Internet.",
    "auth/too-many-requests":
      "Trop de tentatives. Veuillez patienter avant de réessayer."
  };

  return messages[errorCode] ||
    "Le compte n’a pas pu être créé. Veuillez réessayer.";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const passwordConfirm = confirmPasswordInput.value;

  if (password !== passwordConfirm) {
    showMessage("Les deux mots de passe ne sont pas identiques.");
    confirmPasswordInput.focus();
    return;
  }

  if (password.length < 6) {
    showMessage("Le mot de passe doit contenir au moins 6 caractères.");
    passwordInput.focus();
    return;
  }

  try {
    showMessage("Création du compte en cours…", "info");

    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await sendEmailVerification(credential.user);

    showMessage(
      "Compte créé. Vérifiez votre boîte e-mail pour confirmer votre adresse.",
      "success"
    );

    setTimeout(() => {
      window.location.href = "mon-espace.html";
    }, 1800);

  } catch (error) {
    console.error("Erreur d'inscription Firebase :", error.code, error.message);
    showMessage(getFriendlyError(error.code));
  }
});