import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

//const firebaseConfig = {
  //apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
 // authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
 // projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
 // storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
 // messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
 // appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//}; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGMxDCbKMGMnpoWDNPo3mfpaxvrdEXc5M",
  authDomain: "eco-friendly-rad.firebaseapp.com",
  projectId: "eco-friendly-rad",
  storageBucket: "eco-friendly-rad.firebasestorage.app",
  messagingSenderId: "537017782457",
  appId: "1:537017782457:web:088e20492dde2315e4cb68"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
