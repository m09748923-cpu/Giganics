import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  getDatabase,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDEAz7YdcUZUaVuWdrQ5yRhM1jVGTKwuPk",
  authDomain: "giganics-36027.firebaseapp.com",
  databaseURL: "https://giganics-36027-default-rtdb.firebaseio.com",
  projectId: "giganics-36027",
  storageBucket: "giganics-36027.firebasestorage.app",
  messagingSenderId: "584273340803",
  appId: "1:584273340803:web:a37baa7a41313c323aaeb6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Realtime Database
export const database = getDatabase(app);

export default app;