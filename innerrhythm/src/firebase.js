// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, Timestamp, FieldValue, Filter } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKX_kvFOxUzoIfqi8Dp9-zGRUIBHdXvs8",
  authDomain: "innerrhythm-8606b.firebaseapp.com",
  projectId: "innerrhythm-8606b",
  storageBucket: "innerrhythm-8606b.appspot.com",
  messagingSenderId: "37520758052",
  appId: "1:37520758052:web:908ffdbfa3fbaf6b39cfb1",
  measurementId: "G-8E2FH1HY8L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };