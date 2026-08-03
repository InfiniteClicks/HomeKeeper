import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn2aRrk0Sa5Nh4_vy8iETC-06Rhgq-OqY",
  authDomain: "home-stock-92eb3.firebaseapp.com",
  projectId: "home-stock-92eb3",
  storageBucket: "home-stock-92eb3.firebasestorage.app",
  messagingSenderId: "650413619287",
  appId: "1:650413619287:web:dd23dc470cfb94a8520b12"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence);