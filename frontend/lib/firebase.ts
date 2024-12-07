// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBPV7KdEAERXSeoAq3gYBvoxejcb2_czLc",
  authDomain: "apeksha-685d2.firebaseapp.com",
  projectId: "apeksha-685d2",
  storageBucket: "apeksha-685d2.appspot.com",
  messagingSenderId: "573178281343",
  appId: "1:573178281343:web:43e90b59babc60f5846e4a",
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
