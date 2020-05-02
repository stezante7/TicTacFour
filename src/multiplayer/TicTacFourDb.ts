import * as firebase from "firebase";
import config from "./db.config";

// Initialize Firebase
firebase.initializeApp(config);
firebase.analytics();

const db = firebase.firestore();
export const TicTacFourCollection = db.collection("tictacfour");
