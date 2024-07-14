// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzTBJR3CnS8fhIkmVj2RDJT0FrHfa4S3Q",
  authDomain: "logleet-5f8c5.firebaseapp.com",
  projectId: "logleet-5f8c5",
  storageBucket: "logleet-5f8c5.appspot.com",
  messagingSenderId: "1071422322545",
  appId: "1:1071422322545:web:2749764bc68b149414e8d0",
  measurementId: "G-MCWBYCBQ62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
