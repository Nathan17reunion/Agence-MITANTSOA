const admin = require("firebase-admin");

// Initialiser Firebase Admin une seule fois
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !privateKey
  ) {
    throw new Error(
      "Configuration Firebase manquante : vérifiez FIREBASE_PROJECT_ID, " +
      "FIREBASE_CLIENT_EMAIL et FIREBASE_PRIVATE_KEY."
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

// Middleware de vérification du jeton Firebase
async function verifierToken(req, res, next) {
  const entete = req.headers.authorization || "";

  const token = entete.startsWith("Bearer ")
    ? entete.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      erreur: "Token manquant.",
    });
  }

  try {
    const utilisateur = await admin.auth().verifyIdToken(token);

    req.utilisateur = utilisateur;

    return next();
  } catch (erreur) {
    return res.status(401).json({
      erreur: "Token invalide ou expiré.",
    });
  }
}

module.exports = { verifierToken };