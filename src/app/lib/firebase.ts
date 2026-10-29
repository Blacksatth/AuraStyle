  // lib/firebase.ts
  import { initializeApp } from "firebase/app"
  import { getFirestore } from "firebase/firestore"
  import { getStorage } from 'firebase/storage'

  const firebaseConfig = {
  apiKey: "AIzaSyAvn4yiJwV6Yxkep4TqgsSkWus79OV8_jk",
  authDomain: "gorra-style-ec63e.firebaseapp.com",
  projectId: "gorra-style-ec63e",
  storageBucket: "gorra-style-ec63e.firebasestorage.app",
  messagingSenderId: "879512824532",
  appId: "1:879512824532:web:bab083577b5e514499a941",
  measurementId: "G-KK766TR6LH"
  }

  const app = initializeApp(firebaseConfig)
  export const db = getFirestore(app)
  import { getAuth } from 'firebase/auth'
  export const auth = getAuth(app)
  export const storage = getStorage(app)

