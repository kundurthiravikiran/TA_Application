const admin = require("firebase-admin");
require("dotenv").config();

const { SERVICEACCOUNTTOKEN } = process.env;

const serviceAccount = JSON.parse(SERVICEACCOUNTTOKEN);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = db;
