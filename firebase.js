// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJmSQ4okVZr9p8YInUGV3wWO3ecJFJoDI",
  authDomain: "inventory-management-761fe.firebaseapp.com",
  projectId: "inventory-management-761fe",
  storageBucket: "inventory-management-761fe.appspot.com",
  messagingSenderId: "1039886522007",
  appId: "1:1039886522007:web:db8f8aa1c106c62f713bd2",
  measurementId: "G-2ESTBZQNBK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore};