import * as firebase from "firebase";

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "<api-key>",
  authDomain: "<auth-domain>",
  databaseURL: "<database-url>",
  projectId: "<project-id>",
  storageBucket: "<storage-bucket>",
  messagingSenderId: "<messaging-sender-id>",
  appId: "<app-id>",
  measurementId: "<measurement-id>",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const db = firebase.firestore();
export const TicTacFourCollection = db.collection("tictacfour");
