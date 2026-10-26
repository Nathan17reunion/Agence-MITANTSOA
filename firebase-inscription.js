import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// "auth" doit déjà correspondre à ton application Firebase initialisée.
// "email" et "motDePasse" viennent de ton formulaire.

async function inscrireClient(email, motDePasse) {
  const resultat = await createUserWithEmailAndPassword(
    auth,
    email,
    motDePasse
  );

  auth.languageCode = "fr";

  await sendEmailVerification(resultat.user, {
    url: "https://mitantsoaagency.onrender.com/completer-profil.html",
    handleCodeInApp: false
  });

  // Ne pas rediriger immédiatement vers mon-espace.html.
  window.location.replace("verification-email.html");
}

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAC4g13dQqwWB3hrtjU6a1dAP91FviHHMI",
  authDomain: "connexion-mitantsoa-angence.firebaseapp.com",
  projectId: "connexion-mitantsoa-angence",
  storageBucket: "connexion-mitantsoa-angence.firebasestorage.app",
  messagingSenderId: "857962704410",
  appId: "1:857962704410:web:984c9936b3f22742fc6ba3",
  measurementId: "G-G6L1RCZPRG"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Éléments du formulaire
const form = document.getElementById("register-form");
const emailInput = document.getElementById("register-email");
const passwordInput = document.getElementById("register-password");
const confirmPasswordInput = document.getElementById(
  "register-password-confirm"
);
const message = document.getElementById("register-message");

// Affichage des messages
function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `login-message ${type}`;
}

// Messages d'erreur
function getFriendlyError(errorCode) {
  const messages = {
    "auth/email-already-in-use":
      "Cette adresse e-mail est déjà associée à un compte. Connectez-vous ou utilisez « Mot de passe oublié ?",
    "auth/invalid-email":
      "L’adresse e-mail saisie n’est pas valide.",
    "auth/weak-password":
      "Choisissez un mot de passe plus robuste.",
    "auth/network-request-failed":
      "Impossible de créer le compte. Vérifiez votre connexion Internet.",
    "auth/too-many-requests":
      "Trop de tentatives. Veuillez patienter avant de réessayer."
  };

  if (erreur.code === "auth/email-already-in-use") {
    message.textContent =
      "Impossible de créer ce compte. Si vous êtes déjà inscrit, " +
      "connectez-vous ou utilisez « Mot de passe oublié ? ».";
  }

  return messages[errorCode] ||
    "Le compte n’a pas pu être créé. Veuillez réessayer.";
}

// Inscription
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

    // Créer le compte

    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Envoyer l'e-mail de vérification
    try {
      await sendEmailVerification(credential.user, {
        url: new URL(
          "completer-profil.html",
          window.location.href
        ).href,
        handleCodeInApp: false
      });

      showMessage(
        "Compte créé. Consultez votre boîte e-mail pour vérifier votre adresse.",
        "success"
      );
    } catch (erreur) {
      console.error(
        "Échec de l’envoi de vérification :",
        erreur.code
      );

      showMessage(
        "Votre compte est créé, mais l’e-mail de vérification n’a pas pu être envoyé. Vous pourrez demander un nouvel envoi.",
        "info"
      );
    }

    // Dans tous les cas, accéder à la page de vérification
    setTimeout(() => {
      window.location.replace("verification-email.html");
    }, 1500);

  } catch (error) {
    console.error(
      "Erreur d'inscription Firebase :",
      error.code,
      error.message
    );

    showMessage(getFriendlyError(error.code));
  }
});
