// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDaps4eAv1jSvdqXEGGWiHJG_pKWs-Kjqw",
  authDomain: "doe-para-o-bem.firebaseapp.com",
  databaseURL: "https://doe-para-o-bem-default-rtdb.firebaseio.com",
  projectId: "doe-para-o-bem",
  storageBucket: "doe-para-o-bem.firebasestorage.app",
  messagingSenderId: "837036927824",
  appId: "1:837036927824:web:235ad1721be2a86fb05a55",
  measurementId: "G-H220R5KEJ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);