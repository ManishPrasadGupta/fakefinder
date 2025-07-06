// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9Gmtz5SYWWP657PLuR_Sut2YSKB0YhPA",
  authDomain: "megpolextension-dfbbe.firebaseapp.com",
  projectId: "megpolextension-dfbbe",
  storageBucket: "megpolextension-dfbbe.firebasestorage.app",
  messagingSenderId: "949317125280",
  appId: "1:949317125280:web:071eb81a59b9c2141375c5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app); 
export const auth = getAuth(app);