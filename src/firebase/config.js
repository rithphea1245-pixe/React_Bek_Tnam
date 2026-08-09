// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZJHKMcr9g8m0_dc1XULfrWA4jl9qvyTQ",
  authDomain: "nodejsxfirebase-40ff6.firebaseapp.com",
  projectId: "nodejsxfirebase-40ff6",
  storageBucket: "nodejsxfirebase-40ff6.firebasestorage.app",
  messagingSenderId: "473262434597",
  appId: "1:473262434597:web:ab0cffb298a467100952cc",
  measurementId: "G-03D0BKC58E",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };
