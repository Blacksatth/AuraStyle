// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwYLzCJOtFp91iCk55VoRORr3n0G9XI9Y",
  authDomain: "aurastyle-8de42.firebaseapp.com",
  projectId: "aurastyle-8de42",
  storageBucket: "aurastyle-8de42.firebasestorage.app",
  messagingSenderId: "538263807134",
  appId: "1:538263807134:web:79a4fabc5f404c0d2d878f",
  measurementId: "G-YGYBP5VBE7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);