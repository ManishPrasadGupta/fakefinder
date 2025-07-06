// Only use this in a .js file, imported with type="module"
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC9Gmtz5SYWWP657PLuR_Sut2YSKB0YhPA",
  authDomain: "megpolextension-dfbbe.firebaseapp.com",
  projectId: "megpolextension-dfbbe",
  storageBucket: "megpolextension-dfbbe.appspot.com",  
  messagingSenderId: "949317125280",
  appId: "1:949317125280:web:071eb81a59b9c2141375c5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };