import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  enableIndexedDbPersistence,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn2aRrk0Sa5Nh4_vy8iETC-06Rhgq-OqY",
  authDomain: "home-stock-92eb3.firebaseapp.com",
  projectId: "home-stock-92eb3",
  storageBucket: "home-stock-92eb3.firebasestorage.app",
  messagingSenderId: "650413619287",
  appId: "1:650413619287:web:dd23dc470cfb94a8520b12"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  serverTimestamp,
  writeBatch
};

enableIndexedDbPersistence(db).catch((error) => {
  if (!["failed-precondition", "unimplemented"].includes(error.code)) {
    console.warn("Offline persistence could not be enabled:", error);
  }
});